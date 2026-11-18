//go:build integration

package graph_test

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/99designs/gqlgen/client"
	"github.com/deepconcern/dwai/dwai-api/internal/testutil"
	"github.com/google/go-cmp/cmp"
)

// messageFields is everything the chat tests read of a message.
const messageFields = `
fragment MessageFields on Message {
	id
	kind
	authorName
	authorIsGm
	body
	characterId
	characterName
	ooc
	gmOnly
	whisperTo
	viewerIsAuthor
	roll {
		band
		dice { dropped sides value }
		diceTotal
		label
		modifiers { label value }
		move { key name }
		source
		total
	}
}`

type rollResponse struct {
	Band *string
	Dice []struct {
		Dropped bool
		Sides   int32
		Value   int32
	}
	DiceTotal int32
	Label     string
	Modifiers []struct {
		Label string
		Value int32
	}
	Move *struct {
		Key  string
		Name string
	}
	Source string
	Total  int32
}

type messageResponse struct {
	ID             string
	Kind           string
	AuthorName     string
	AuthorIsGm     bool
	Body           string
	CharacterID    *string
	CharacterName  *string
	Ooc            bool
	GmOnly         bool
	WhisperTo      *string
	ViewerIsAuthor bool
	Roll           *rollResponse
}

type messagePageResponse struct {
	HasMore  bool
	Messages []messageResponse
}

const campaignMessagesQuery = `
query ($id: ID!, $before: ID, $limit: Int! = 50) {
	campaigns { byId(id: $id) { messages(before: $before, limit: $limit) { hasMore messages { ...MessageFields } } } }
}` + messageFields

const postMessageMutation = `
mutation ($id: ID!, $input: MessageInput!) {
	campaigns { postMessage(id: $id, input: $input) { ...MessageFields } }
}` + messageFields

const postRollMutation = `
mutation ($id: ID!, $input: RollInput!) {
	campaigns { postRoll(id: $id, input: $input) { ...MessageFields } }
}` + messageFields

const postDamageMutation = `
mutation ($id: ID!, $input: DamageRollInput!) {
	campaigns { postDamage(id: $id, input: $input) { ...MessageFields } }
}` + messageFields

const campaignMessagesSubscription = `
subscription ($campaignId: ID!) {
	campaignMessages(campaignId: $campaignId) { ...MessageFields }
}` + messageFields

const adjustXpMutation = `
mutation ($id: ID!, $delta: Int!) {
	characters { adjustXp(id: $id, delta: $delta) { id xp } }
}`

const addBonusMutation = `
mutation ($id: ID!, $input: BonusInput!) {
	characters { addBonus(id: $id, input: $input) { id bonuses { id amount kind label } } }
}`

const removeBonusMutation = `
mutation ($bonusId: ID!) {
	characters { removeBonus(bonusId: $bonusId) { id bonuses { id amount kind label } } }
}`

type bonusesResponse struct {
	ID      string
	Bonuses []struct {
		ID     string
		Amount int32
		Kind   string
		Label  string
	}
}

func campaignMessages(t *testing.T, c *client.Client, campaignID string, options ...client.Option) messagePageResponse {
	t.Helper()

	var resp struct {
		Campaigns struct {
			ByID struct{ Messages messagePageResponse }
		}
	}
	if err := c.Post(campaignMessagesQuery, &resp, append(options, client.Var("id", campaignID))...); err != nil {
		t.Fatalf("get messages: %v", err)
	}

	return resp.Campaigns.ByID.Messages
}

func postMessage(t *testing.T, c *client.Client, campaignID string, input map[string]any) messageResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ PostMessage messageResponse }
	}
	if err := c.Post(postMessageMutation, &resp, client.Var("id", campaignID), client.Var("input", input)); err != nil {
		t.Fatalf("post message: %v", err)
	}

	return resp.Campaigns.PostMessage
}

func postRoll(t *testing.T, c *client.Client, campaignID string, input map[string]any) messageResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ PostRoll messageResponse }
	}
	if err := c.Post(postRollMutation, &resp, client.Var("id", campaignID), client.Var("input", input)); err != nil {
		t.Fatalf("post roll: %v", err)
	}

	return resp.Campaigns.PostRoll
}

func addBonus(t *testing.T, c *client.Client, id string, input map[string]any) bonusesResponse {
	t.Helper()

	var resp struct {
		Characters struct{ AddBonus bonusesResponse }
	}
	if err := c.Post(addBonusMutation, &resp, client.Var("id", id), client.Var("input", input)); err != nil {
		t.Fatalf("add bonus: %v", err)
	}

	return resp.Characters.AddBonus
}

func adjustXp(t *testing.T, c *client.Client, id string, delta int) {
	t.Helper()

	var resp map[string]any
	if err := c.Post(adjustXpMutation, &resp, client.Var("id", id), client.Var("delta", delta)); err != nil {
		t.Fatalf("adjust XP: %v", err)
	}
}

// bodies returns the bodies of the messages of one kind.
func bodies(page messagePageResponse, kind string) []string {
	var out []string
	for _, m := range page.Messages {
		if m.Kind == kind {
			out = append(out, m.Body)
		}
	}

	return out
}

func TestChatMessages(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	// Given a campaign with a GM and two players,
	// when Ana posts in character and the GM posts out of character,
	postMessage(t, tb.ana, tb.campaign.ID, map[string]any{"body": "  I draw my sword. "})
	postMessage(t, tb.gm, tb.campaign.ID, map[string]any{"body": "Pizza's here.", "ooc": true})

	// then everyone sees both, oldest first, with the author's character
	// name or "GM".
	got := campaignMessages(t, tb.bo, tb.campaign.ID).Messages
	if len(got) != 2 {
		t.Fatalf("messages = %+v, want 2", got)
	}
	if got[0].AuthorName != "Ana" || got[0].Body != "I draw my sword." || got[0].Ooc || got[0].AuthorIsGm || got[0].ViewerIsAuthor {
		t.Errorf("Ana's message as Bo sees it = %+v", got[0])
	}
	if got[0].CharacterID == nil || *got[0].CharacterID != tb.anaID {
		t.Errorf("Ana's message characterId = %v, want %s", got[0].CharacterID, tb.anaID)
	}
	if got[1].AuthorName != "GM" || !got[1].AuthorIsGm || !got[1].Ooc || got[1].CharacterID != nil {
		t.Errorf("GM's message = %+v", got[1])
	}
	if mine := campaignMessages(t, tb.ana, tb.campaign.ID).Messages[0]; !mine.ViewerIsAuthor {
		t.Errorf("Ana's own message viewerIsAuthor = false")
	}
}

func TestChatRejectsBlankMessages(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	errs := postErrors(t, tb.ana, postMessageMutation, client.Var("id", tb.campaign.ID), client.Var("input", map[string]any{"body": "   "}))
	wantValidationError(t, errs, "body")
}

func TestNonMembersCantUseTheChat(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	postMessage(t, tb.ana, tb.campaign.ID, map[string]any{"body": "Secret plans."})

	stranger := registered(t, tb.h, "stranger@example.com")
	createNamedFighter(t, stranger, "Cy")

	wantNotFound(t, messages(t, stranger, campaignMessagesQuery, map[string]any{"id": tb.campaign.ID}))
	wantNotFound(t, messages(t, stranger, postMessageMutation, map[string]any{"id": tb.campaign.ID, "input": map[string]any{"body": "Hi"}}))
	wantNotFound(t, messages(t, stranger, postRollMutation, map[string]any{"id": tb.campaign.ID, "input": map[string]any{"diceTotal": 7, "label": "Parley"}}))
}

func TestWhispers(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	// Ana whispers to the GM, and the GM whispers to Bo.
	toGM := postMessage(t, tb.ana, tb.campaign.ID, map[string]any{"body": "I pocket the gem.", "whisperToGm": true})
	toBo := postMessage(t, tb.gm, tb.campaign.ID, map[string]any{"body": "You hear a voice.", "whisperToCharacterId": tb.boID})

	if toGM.WhisperTo == nil || *toGM.WhisperTo != "GM" {
		t.Errorf("whisper to GM whisperTo = %v, want GM", toGM.WhisperTo)
	}
	if toBo.WhisperTo == nil || *toBo.WhisperTo != "Bo" {
		t.Errorf("whisper to Bo whisperTo = %v, want Bo", toBo.WhisperTo)
	}

	tests := []struct {
		name string
		c    *client.Client
		want []string
	}{
		{"GM sees both", tb.gm, []string{"I pocket the gem.", "You hear a voice."}},
		{"Ana sees her own whisper only", tb.ana, []string{"I pocket the gem."}},
		{"Bo sees the whisper to him only", tb.bo, []string{"You hear a voice."}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if diff := cmp.Diff(tt.want, bodies(campaignMessages(t, tt.c, tb.campaign.ID), "CHAT")); diff != "" {
				t.Errorf("chat (-want +got):\n%s", diff)
			}
		})
	}
}

func TestWhispersOnlyGoBetweenAPlayerAndTheGM(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	tests := []struct {
		name  string
		c     *client.Client
		input map[string]any
		field string
	}{
		{"a player can't whisper to another player", tb.ana, map[string]any{"body": "Psst", "whisperToCharacterId": tb.boID}, "whisperToCharacterId"},
		{"the GM can't whisper to the GM", tb.gm, map[string]any{"body": "Psst", "whisperToGm": true}, "whisperToGm"},
		{"the GM can't whisper to a character outside the campaign", tb.gm, map[string]any{"body": "Psst", "whisperToCharacterId": createNamedFighter(t, tb.ana, "Spare").ID}, "whisperToCharacterId"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			errs := postErrors(t, tt.c, postMessageMutation, client.Var("id", tb.campaign.ID), client.Var("input", tt.input))
			wantValidationError(t, errs, tt.field)
		})
	}
}

func TestMessagesPaging(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	for _, body := range []string{"one", "two", "three"} {
		postMessage(t, tb.ana, tb.campaign.ID, map[string]any{"body": body})
	}

	// The latest page holds the newest messages, oldest first.
	latest := campaignMessages(t, tb.bo, tb.campaign.ID, client.Var("limit", 2))
	if diff := cmp.Diff([]string{"two", "three"}, bodies(latest, "CHAT")); diff != "" || !latest.HasMore {
		t.Fatalf("latest page = %v (hasMore %v), want [two three] with more (diff %s)", bodies(latest, "CHAT"), latest.HasMore, diff)
	}

	// Scrolling back loads what came before.
	older := campaignMessages(t, tb.bo, tb.campaign.ID, client.Var("limit", 2), client.Var("before", latest.Messages[0].ID))
	if diff := cmp.Diff([]string{"one"}, bodies(older, "CHAT")); diff != "" || older.HasMore {
		t.Errorf("older page = %v (hasMore %v), want [one] and no more", bodies(older, "CHAT"), older.HasMore)
	}
}

func TestPostRoll(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	t.Run("app roll records the dice and the chosen modifiers", func(t *testing.T) {
		got := postRoll(t, tb.ana, tb.campaign.ID, map[string]any{
			"dice":      []map[string]any{{"sides": 6, "value": 4}, {"sides": 6, "value": 5}},
			"label":     "Hack and Slash",
			"modifiers": []map[string]any{{"label": "STR", "value": 2}, {"label": "weak", "value": -1}, {"label": "forward (Aid from Lux)", "value": 1}},
			"moveKey":   "hack_and_slash",
		})

		if got.Kind != "ROLL" || got.AuthorName != "Ana" || got.Roll == nil {
			t.Fatalf("message = %+v", got)
		}
		roll := got.Roll
		if roll.Total != 11 || roll.DiceTotal != 9 || roll.Source != "APP" || roll.Band == nil || *roll.Band != "STRONG_HIT" {
			t.Errorf("roll = %+v, want 9 + 2 - 1 + 1 = 11, a strong hit", roll)
		}
		if len(roll.Dice) != 2 || len(roll.Modifiers) != 3 {
			t.Errorf("roll dice = %+v, modifiers = %+v", roll.Dice, roll.Modifiers)
		}
		if roll.Move == nil || roll.Move.Name != "Hack and Slash" {
			t.Errorf("roll move = %+v, want Hack and Slash", roll.Move)
		}
	})

	t.Run("physical dice total with nothing chosen adds nothing", func(t *testing.T) {
		// Ana's fighter has STR 16 (+2), but she chose no modifiers.
		roll := postRoll(t, tb.ana, tb.campaign.ID, map[string]any{"diceTotal": 5, "label": "Roll +STR"}).Roll

		if roll.Total != 5 || roll.Source != "MANUAL" || roll.Dice != nil || *roll.Band != "MISS" {
			t.Errorf("roll = %+v, want a manual 5, a miss", roll)
		}
	})

	t.Run("out-of-range totals are rejected", func(t *testing.T) {
		for _, total := range []int{1, 13} {
			errs := postErrors(t, tb.ana, postRollMutation, client.Var("id", tb.campaign.ID), client.Var("input", map[string]any{"diceTotal": total, "label": "Parley"}))
			wantValidationError(t, errs, "diceTotal")
		}
	})

	t.Run("an unknown move is rejected", func(t *testing.T) {
		errs := postErrors(t, tb.ana, postRollMutation, client.Var("id", tb.campaign.ID), client.Var("input", map[string]any{"diceTotal": 7, "label": "Fireball", "moveKey": "fireball"}))
		wantValidationError(t, errs, "moveKey")
	})

	t.Run("the GM has no character to roll for", func(t *testing.T) {
		errs := postErrors(t, tb.gm, postRollMutation, client.Var("id", tb.campaign.ID), client.Var("input", map[string]any{"diceTotal": 7, "label": "Parley"}))
		wantValidationError(t, errs, "id")
	})
}

func TestGMOnlyRolls(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	postRoll(t, tb.ana, tb.campaign.ID, map[string]any{"diceTotal": 9, "gmOnly": true, "label": "Discern Realities"})

	for name, c := range map[string]*client.Client{"Ana": tb.ana, "GM": tb.gm} {
		if got := len(campaignMessages(t, c, tb.campaign.ID).Messages); got != 1 {
			t.Errorf("%s sees %d messages, want the GM-only roll", name, got)
		}
	}
	if got := campaignMessages(t, tb.bo, tb.campaign.ID).Messages; len(got) != 0 {
		t.Errorf("Bo sees %+v, want nothing", got)
	}
}

func TestPostDamage(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	var resp struct {
		Campaigns struct{ PostDamage messageResponse }
	}
	err := tb.ana.Post(postDamageMutation, &resp, client.Var("id", tb.campaign.ID), client.Var("input", map[string]any{
		"dice":      []map[string]any{{"sides": 10, "value": 7}, {"sides": 4, "value": 3}},
		"label":     "d10+1d4+1",
		"modifiers": []map[string]any{{"label": "+1", "value": 1}},
	}))
	if err != nil {
		t.Fatalf("post damage: %v", err)
	}

	got := resp.Campaigns.PostDamage
	if got.Kind != "DAMAGE" || got.Roll == nil || got.Roll.Total != 11 || got.Roll.Band != nil {
		t.Errorf("damage = %+v, want 7 + 3 + 1 = 11 with no band", got.Roll)
	}

	// Damage only goes to chat: nobody's HP changes.
	if hp := characterByID(t, tb.ana, tb.anaID); hp.HitPoints != hp.MaxHitPoints {
		t.Errorf("Ana's HP = %d, want unchanged %d", hp.HitPoints, hp.MaxHitPoints)
	}
}

func TestBonuses(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	added := addBonus(t, tb.ana, tb.anaID, map[string]any{"amount": 1, "kind": "FORWARD", "label": "Aid from Lux"})
	if len(added.Bonuses) != 1 || added.Bonuses[0].Amount != 1 || added.Bonuses[0].Kind != "FORWARD" || added.Bonuses[0].Label != "Aid from Lux" {
		t.Fatalf("bonuses = %+v", added.Bonuses)
	}

	// Only the owner may remove it.
	wantNotFound(t, messages(t, tb.bo, removeBonusMutation, map[string]any{"bonusId": added.Bonuses[0].ID}))

	var resp struct {
		Characters struct{ RemoveBonus bonusesResponse }
	}
	if err := tb.ana.Post(removeBonusMutation, &resp, client.Var("bonusId", added.Bonuses[0].ID)); err != nil {
		t.Fatalf("remove bonus: %v", err)
	}
	if got := resp.Characters.RemoveBonus.Bonuses; len(got) != 0 {
		t.Errorf("bonuses after removing = %+v, want none", got)
	}
}

func TestSheetActionsAreLogged(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	// Given Ana in a campaign, when she marks XP twice, unmarks it once, and
	// the GM marks one for her, each is logged and none is refused.
	adjustXp(t, tb.ana, tb.anaID, 1)
	adjustXp(t, tb.ana, tb.anaID, 1)
	adjustXp(t, tb.ana, tb.anaID, -1)
	adjustXp(t, tb.gm, tb.anaID, 1)

	// And the other sheet actions in the spec are logged too.
	takeDamage(t, tb.ana, tb.anaID, map[string]any{"amount": 5})
	heal(t, tb.ana, tb.anaID, 3)
	postCharacter(t, tb.ana, setDebilityMutation, "characters", "setDebility", client.Var("id", tb.anaID), client.Var("debility", "WEAK"), client.Var("active", true))
	bonus := addBonus(t, tb.ana, tb.anaID, map[string]any{"amount": 1, "kind": "FORWARD", "label": "Aid from Lux"})
	var removed map[string]any
	if err := tb.ana.Post(removeBonusMutation, &removed, client.Var("bonusId", bonus.Bonuses[0].ID)); err != nil {
		t.Fatalf("remove bonus: %v", err)
	}
	addBond(t, tb.ana, tb.anaID, tb.boID, "Bo has my back.")

	page := campaignMessages(t, tb.bo, tb.campaign.ID)
	want := []string{
		"marked 1 XP",
		"marked 1 XP",
		"unmarked 1 XP",
		"marked 1 XP",
		"took 5 damage (armor 1), HP 23 → 19",
		"healed 3 HP, HP 19 → 22",
		"is now Weak",
		"added +1 forward: Aid from Lux",
		"removed +1 forward: Aid from Lux",
		"wrote a bond about Bo",
	}
	if diff := cmp.Diff(want, bodies(page, "ACTIVITY")); diff != "" {
		t.Fatalf("activity (-want +got):\n%s", diff)
	}

	// Activity lines are about Ana, and say who made the change.
	gmMarked := page.Messages[3]
	if gmMarked.CharacterName == nil || *gmMarked.CharacterName != "Ana" || !gmMarked.AuthorIsGm {
		t.Errorf("the GM's XP line = %+v, want about Ana, by the GM", gmMarked)
	}
	if page.Messages[0].AuthorIsGm {
		t.Errorf("Ana's own XP line authorIsGm = true")
	}
}

func TestSheetActionsOutsideACampaignAreNotLogged(t *testing.T) {
	t.Parallel()

	c, pool := env.NewClient(t)
	fighter := createFighter(t, c)

	adjustXp(t, c, fighter.ID, 1)

	var count int
	if err := pool.QueryRow(t.Context(), "SELECT count(*) FROM campaign_messages").Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Errorf("campaign_messages has %d rows, want 0", count)
	}
}

// subscriber is a player connected to a campaign's chat over WebSocket.
type subscriber struct {
	messages chan messageResponse
	errs     chan error
}

// subscribe logs in a new user, joins their character Name to the
// campaign, and subscribes them to its chat. It returns their client too.
func subscribe(t *testing.T, h http.Handler, tb *table, email, name string) (*client.Client, *subscriber) {
	t.Helper()

	browser := testutil.NewBrowser(h)
	browser.Register(t, email)
	id := createNamedFighter(t, browser.Client, name).ID
	join(t, browser.Client, *tb.campaign.InviteCode, id)

	ws := client.New(h, client.Path("/graphql"))
	sub := ws.Websocket(campaignMessagesSubscription, client.AddCookie(browser.SessionCookie()), client.Var("campaignId", tb.campaign.ID))
	t.Cleanup(func() { _ = sub.Close() })

	s := &subscriber{messages: make(chan messageResponse, 10), errs: make(chan error, 1)}
	go func() {
		for {
			var resp struct{ CampaignMessages messageResponse }
			if err := sub.Next(&resp); err != nil {
				s.errs <- err
				return
			}
			s.messages <- resp.CampaignMessages
		}
	}()

	return browser.Client, s
}

// next waits for the subscriber's next message.
func (s *subscriber) next(t *testing.T) messageResponse {
	t.Helper()

	select {
	case m := <-s.messages:
		return m
	case err := <-s.errs:
		t.Fatalf("subscription: %v", err)
	case <-time.After(10 * time.Second):
		t.Fatal("no message within 10s")
	}

	return messageResponse{}
}

// waitUntilSubscribed posts "ping N" from c until s receives one, since the
// subscription starts asynchronously, then drains the extras.
func (s *subscriber) waitUntilSubscribed(t *testing.T, c *client.Client, campaignID string) {
	t.Helper()

	ctx, cancel := context.WithTimeout(t.Context(), 10*time.Second)
	defer cancel()

	for i := 0; ; i++ {
		postMessage(t, c, campaignID, map[string]any{"body": fmt.Sprintf("ping %d", i), "ooc": true})
		select {
		case <-s.messages:
			time.Sleep(200 * time.Millisecond)
			for len(s.messages) > 0 {
				<-s.messages
			}
			return
		case err := <-s.errs:
			t.Fatalf("subscription: %v", err)
		case <-time.After(100 * time.Millisecond):
		case <-ctx.Done():
			t.Fatal("subscription never started")
		}
	}
}

func TestChatSubscription(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	tb := &table{h: h}
	tb.gm = registered(t, h, "gm@example.com")
	tb.campaign = createCampaign(t, tb.gm, "The Lost Mines", "")

	ana, _ := subscribe(t, h, tb, "ana@example.com", "Ana")
	_, bo := subscribe(t, h, tb, "bo@example.com", "Bo")
	bo.waitUntilSubscribed(t, ana, tb.campaign.ID)

	// Given Bo is subscribed, when Ana whispers to the GM and then posts to
	// everyone, Bo receives only the message to everyone, without reloading.
	postMessage(t, ana, tb.campaign.ID, map[string]any{"body": "I pocket the gem.", "whisperToGm": true})
	postMessage(t, ana, tb.campaign.ID, map[string]any{"body": "Onward!"})

	got := bo.next(t)
	if got.Body != "Onward!" || got.AuthorName != "Ana" || got.ViewerIsAuthor {
		t.Errorf("Bo received %+v, want Ana's \"Onward!\"", got)
	}

	// And activity lines arrive the same way.
	tb.anaID = myCharacters(t, ana)[0].ID
	adjustXp(t, ana, tb.anaID, 1)
	if got := bo.next(t); got.Kind != "ACTIVITY" || got.Body != "marked 1 XP" {
		t.Errorf("Bo received %+v, want Ana's XP line", got)
	}
}

func TestStrangersCantSubscribe(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	browser := testutil.NewBrowser(tb.h)
	browser.Register(t, "stranger@example.com")

	ws := client.New(tb.h, client.Path("/graphql"))
	sub := ws.Websocket(campaignMessagesSubscription, client.AddCookie(browser.SessionCookie()), client.Var("campaignId", tb.campaign.ID))
	defer func() { _ = sub.Close() }()

	var resp map[string]any
	err := sub.Next(&resp)
	if err == nil || !strings.Contains(err.Error(), "not found") {
		t.Fatalf("subscription error = %v, want not found", err)
	}
}
