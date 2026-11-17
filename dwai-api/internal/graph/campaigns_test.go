//go:build integration

package graph_test

import (
	"net/http"
	"strings"
	"testing"

	"github.com/99designs/gqlgen/client"
	"github.com/deepconcern/dwai/dwai-api/internal/auth"
	"github.com/deepconcern/dwai/dwai-api/internal/models/modelstest"
	"github.com/deepconcern/dwai/dwai-api/internal/testutil"
	"github.com/google/go-cmp/cmp"
)

const campaignFields = `
fragment CampaignFields on Campaign {
	id
	name
	description
	inviteCode
	isGm
	gm { displayName }
	myCharacter { id }
	characters {
		id
		name
		alignmentType
		hitPoints
		maxHitPoints
		characterClass { key }
		raceMove { key }
		looks { value }
		owner { displayName }
	}
	sessions {
		id
		number
		learned { checked reason }
		looted { checked reason }
		overcame { checked reason }
		reports {
			character { id }
			alignment { checked reason }
			bond { checked reason }
			resolvedBondText
			xpAwarded
		}
	}
}`

type checkedResponse struct {
	Checked bool
	Reason  *string
}

type campaignResponse struct {
	ID          string
	Name        string
	Description string
	InviteCode  *string
	IsGm        bool
	Gm          struct{ DisplayName string }
	MyCharacter *struct{ ID string }
	Characters  []struct {
		ID             string
		Name           string
		AlignmentType  string
		HitPoints      int32
		MaxHitPoints   int32
		CharacterClass struct{ Key string }
		RaceMove       struct{ Key string }
		Looks          []struct{ Value string }
		Owner          struct{ DisplayName string }
	}
	Sessions []struct {
		ID       string
		Number   int32
		Learned  checkedResponse
		Looted   checkedResponse
		Overcame checkedResponse
		Reports  []struct {
			Character        struct{ ID string }
			Alignment        checkedResponse
			Bond             checkedResponse
			ResolvedBondText *string
			XpAwarded        int32
		}
	}
}

const createCampaignMutation = `
mutation ($input: CampaignInput!) {
	campaigns { create(input: $input) { ...CampaignFields } }
}` + campaignFields

const updateCampaignMutation = `
mutation ($id: ID!, $input: CampaignInput!) {
	campaigns { update(id: $id, input: $input) { ...CampaignFields } }
}` + campaignFields

const deleteCampaignMutation = `
mutation ($id: ID!) { campaigns { delete(id: $id) } }`

const campaignByIDQuery = `
query ($id: ID!) {
	campaigns { byId(id: $id) { ...CampaignFields } }
}` + campaignFields

const myCampaignsQuery = `
{ campaigns { mine { ...CampaignFields } } }` + campaignFields

const inviteQuery = `
query ($code: String!) {
	campaigns { byInviteCode(code: $code) { name gm { displayName } } }
}`

const joinMutation = `
mutation ($code: String!, $characterId: ID!) {
	campaigns { join(code: $code, characterId: $characterId) { ...CampaignFields } }
}` + campaignFields

const leaveMutation = `
mutation ($characterId: ID!) {
	campaigns { leave(characterId: $characterId) { campaign { id } } }
}`

const regenerateInviteCodeMutation = `
mutation ($id: ID!) {
	campaigns { regenerateInviteCode(id: $id) { ...CampaignFields } }
}` + campaignFields

const removeCharacterMutation = `
mutation ($id: ID!, $characterId: ID!) {
	campaigns { removeCharacter(id: $id, characterId: $characterId) { ...CampaignFields } }
}` + campaignFields

const endSessionMutation = `
mutation ($id: ID!, $input: EndSessionInput!) {
	campaigns { endSession(id: $id, input: $input) { id } }
}`

// bondsFields is what the bond and End of Session tests read of a
// character.
const bondsFields = `
fragment BondsFields on Character {
	id
	xp
	viewerIsOwner
	campaign { id isGm }
	pendingSession { id number }
	bonds { id text target { id name } }
}`

type bondsResponse struct {
	ID            string
	Xp            int32
	ViewerIsOwner bool
	Campaign      *struct {
		ID   string
		IsGm bool
	}
	PendingSession *struct {
		ID     string
		Number int32
	}
	Bonds []struct {
		ID     string
		Text   string
		Target struct {
			ID   string
			Name string
		}
	}
}

const characterBondsQuery = `
query ($id: ID!) {
	characters { byId(id: $id) { ...BondsFields } }
}` + bondsFields

const addBondMutation = `
mutation ($id: ID!, $input: BondInput!) {
	characters { addBond(id: $id, input: $input) { ...BondsFields } }
}` + bondsFields

const updateBondMutation = `
mutation ($bondId: ID!, $text: String!) {
	characters { updateBond(bondId: $bondId, text: $text) { ...BondsFields } }
}` + bondsFields

const deleteBondMutation = `
mutation ($bondId: ID!) {
	characters { deleteBond(bondId: $bondId) { ...BondsFields } }
}` + bondsFields

const submitSessionReportMutation = `
mutation ($id: ID!, $input: SessionReportInput!) {
	characters { submitSessionReport(id: $id, input: $input) { ...BondsFields } }
}` + bondsFields

// table is a campaign with a GM and two players who have joined with a
// fighter each, named Ana and Bo.
type table struct {
	h        http.Handler
	gm       *client.Client
	ana, bo  *client.Client
	campaign campaignResponse
	anaID    string
	boID     string
}

func newTable(t *testing.T) *table {
	t.Helper()

	h, _ := env.NewServer(t)
	tb := &table{h: h}

	tb.gm = registered(t, h, "gm@example.com")
	tb.campaign = createCampaign(t, tb.gm, "The Lost Mines", "")

	tb.ana = registered(t, h, "ana@example.com")
	tb.anaID = createNamedFighter(t, tb.ana, "Ana").ID
	join(t, tb.ana, *tb.campaign.InviteCode, tb.anaID)

	tb.bo = registered(t, h, "bo@example.com")
	tb.boID = createNamedFighter(t, tb.bo, "Bo").ID
	join(t, tb.bo, *tb.campaign.InviteCode, tb.boID)

	return tb
}

func registered(t *testing.T, h http.Handler, email string) *client.Client {
	t.Helper()

	b := testutil.NewBrowser(h)
	b.Register(t, email)

	return b.Client
}

func createNamedFighter(t *testing.T, c *client.Client, name string) characterResponse {
	t.Helper()

	input := modelstest.ValidCreateCharacterInput(characterClass(t, "fighter"))
	input.Name = name

	return createCharacter(t, c, input)
}

func createCampaign(t *testing.T, c *client.Client, name, description string) campaignResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ Create campaignResponse }
	}
	if err := c.Post(createCampaignMutation, &resp, client.Var("input", map[string]any{"name": name, "description": description})); err != nil {
		t.Fatalf("create campaign: %v", err)
	}

	return resp.Campaigns.Create
}

func campaignByID(t *testing.T, c *client.Client, id string) campaignResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ ByID campaignResponse }
	}
	if err := c.Post(campaignByIDQuery, &resp, client.Var("id", id)); err != nil {
		t.Fatalf("get campaign %s: %v", id, err)
	}

	return resp.Campaigns.ByID
}

func myCampaigns(t *testing.T, c *client.Client) []campaignResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ Mine []campaignResponse }
	}
	if err := c.Post(myCampaignsQuery, &resp); err != nil {
		t.Fatalf("list campaigns: %v", err)
	}

	return resp.Campaigns.Mine
}

func join(t *testing.T, c *client.Client, code, characterID string) campaignResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ Join campaignResponse }
	}
	if err := c.Post(joinMutation, &resp, client.Var("code", code), client.Var("characterId", characterID)); err != nil {
		t.Fatalf("join campaign: %v", err)
	}

	return resp.Campaigns.Join
}

func characterBonds(t *testing.T, c *client.Client, id string) bondsResponse {
	t.Helper()

	var resp struct{ Characters struct{ ByID bondsResponse } }
	if err := c.Post(characterBondsQuery, &resp, client.Var("id", id)); err != nil {
		t.Fatalf("get character %s: %v", id, err)
	}

	return resp.Characters.ByID
}

func addBond(t *testing.T, c *client.Client, id, targetID, text string) bondsResponse {
	t.Helper()

	var resp struct {
		Characters struct{ AddBond bondsResponse }
	}
	if err := c.Post(addBondMutation, &resp, client.Var("id", id), client.Var("input", map[string]any{"targetId": targetID, "text": text})); err != nil {
		t.Fatalf("add bond: %v", err)
	}

	return resp.Characters.AddBond
}

func endSession(t *testing.T, c *client.Client, campaignID string, input map[string]any) string {
	t.Helper()

	var resp struct {
		Campaigns struct{ EndSession struct{ ID string } }
	}
	if err := c.Post(endSessionMutation, &resp, client.Var("id", campaignID), client.Var("input", input)); err != nil {
		t.Fatalf("end session: %v", err)
	}

	return resp.Campaigns.EndSession.ID
}

func submitReport(t *testing.T, c *client.Client, id string, input map[string]any) bondsResponse {
	t.Helper()

	var resp struct {
		Characters struct{ SubmitSessionReport bondsResponse }
	}
	if err := c.Post(submitSessionReportMutation, &resp, client.Var("id", id), client.Var("input", input)); err != nil {
		t.Fatalf("submit session report: %v", err)
	}

	return resp.Characters.SubmitSessionReport
}

func checked(reason string) map[string]any {
	return map[string]any{"checked": true, "reason": reason}
}

func unchecked() map[string]any {
	return map[string]any{"checked": false}
}

func wantNotFound(t *testing.T, errs []string) {
	t.Helper()

	if len(errs) != 1 || !strings.HasSuffix(errs[0], "not found") {
		t.Errorf("errors = %v, want one \"not found\"", errs)
	}
}

func messages(t *testing.T, c *client.Client, query string, vars map[string]any) []string {
	t.Helper()

	errs := postErrors(t, c, query, options(vars)...)
	out := make([]string, len(errs))
	for i, e := range errs {
		out[i] = e.Message
	}

	return out
}

func TestCreateAndUpdateCampaign(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	gm := registered(t, h, "gm@example.com")

	campaign := createCampaign(t, gm, "  The Lost Mines ", " Goblins. ")
	if campaign.Name != "The Lost Mines" || campaign.Description != "Goblins." {
		t.Errorf("name, description = %q, %q; want trimmed", campaign.Name, campaign.Description)
	}
	if !campaign.IsGm || campaign.InviteCode == nil || len(*campaign.InviteCode) != 10 {
		t.Errorf("isGm = %t, inviteCode = %v; want the GM to see a 10-character code", campaign.IsGm, campaign.InviteCode)
	}
	if campaign.MyCharacter != nil || len(campaign.Characters) != 0 || len(campaign.Sessions) != 0 {
		t.Errorf("a new campaign has characters or sessions: %+v", campaign)
	}

	if got := myCampaigns(t, gm); len(got) != 1 || got[0].ID != campaign.ID {
		t.Errorf("campaigns.mine = %+v, want the new campaign", got)
	}

	wantValidationError(t, postErrors(t, gm, createCampaignMutation, client.Var("input", map[string]any{"name": "  "})), "name")
	wantValidationError(t, postErrors(t, gm, updateCampaignMutation, client.Var("id", campaign.ID), client.Var("input", map[string]any{"name": "x", "description": strings.Repeat("a", 2001)})), "description")

	var resp struct {
		Campaigns struct{ Update campaignResponse }
	}
	if err := gm.Post(updateCampaignMutation, &resp, client.Var("id", campaign.ID), client.Var("input", map[string]any{"name": "The Found Mines"})); err != nil {
		t.Fatalf("update campaign: %v", err)
	}
	if got := campaignByID(t, gm, campaign.ID); got.Name != "The Found Mines" || got.Description != "" {
		t.Errorf("after update: name, description = %q, %q", got.Name, got.Description)
	}

	// Someone else's campaign doesn't exist, as far as they can tell.
	stranger := registered(t, h, "stranger@example.com")
	wantNotFound(t, messages(t, stranger, campaignByIDQuery, map[string]any{"id": campaign.ID}))
	wantNotFound(t, messages(t, stranger, updateCampaignMutation, map[string]any{"id": campaign.ID, "input": map[string]any{"name": "Mine now"}}))
	wantNotFound(t, messages(t, stranger, deleteCampaignMutation, map[string]any{"id": campaign.ID}))
	if got := myCampaigns(t, stranger); len(got) != 0 {
		t.Errorf("a stranger's campaigns.mine = %+v, want none", got)
	}
}

func TestJoinCampaign(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	// The invite preview needs only the code.
	var invite struct {
		Campaigns struct {
			ByInviteCode struct {
				Name string
				Gm   struct{ DisplayName string }
			}
		}
	}
	newcomer := registered(t, tb.h, "newcomer@example.com")
	if err := newcomer.Post(inviteQuery, &invite, client.Var("code", strings.ToLower(*tb.campaign.InviteCode))); err != nil {
		t.Fatalf("invite preview: %v", err)
	}
	if invite.Campaigns.ByInviteCode.Name != "The Lost Mines" {
		t.Errorf("invite preview name = %q", invite.Campaigns.ByInviteCode.Name)
	}

	// Players see the party but not the invite code.
	campaign := campaignByID(t, tb.ana, tb.campaign.ID)
	if campaign.IsGm || campaign.InviteCode != nil {
		t.Errorf("player sees isGm = %t, inviteCode = %v", campaign.IsGm, campaign.InviteCode)
	}
	if campaign.MyCharacter == nil || campaign.MyCharacter.ID != tb.anaID {
		t.Errorf("myCharacter = %+v, want Ana", campaign.MyCharacter)
	}
	if len(campaign.Characters) != 2 || campaign.Characters[0].Name != "Ana" || campaign.Characters[1].Name != "Bo" {
		t.Fatalf("party = %+v, want Ana and Bo", campaign.Characters)
	}
	ana := campaign.Characters[0]
	if ana.CharacterClass.Key != "fighter" || ana.RaceMove.Key == "" || len(ana.Looks) == 0 || ana.MaxHitPoints == 0 || ana.HitPoints != ana.MaxHitPoints || ana.Owner.DisplayName != "Player" {
		t.Errorf("party member summary incomplete: %+v", ana)
	}
	if got := myCampaigns(t, tb.bo); len(got) != 1 || got[0].ID != tb.campaign.ID {
		t.Errorf("player's campaigns.mine = %+v, want the campaign", got)
	}

	code := *tb.campaign.InviteCode

	t.Run("invalid code", func(t *testing.T) {
		id := createFighter(t, newcomer).ID
		wantValidationError(t, postErrors(t, newcomer, joinMutation, client.Var("code", "NOPE"), client.Var("characterId", id)), "code")
	})
	t.Run("GM joining their own campaign", func(t *testing.T) {
		id := createFighter(t, tb.gm).ID
		wantValidationError(t, postErrors(t, tb.gm, joinMutation, client.Var("code", code), client.Var("characterId", id)), "code")
	})
	t.Run("character already in a campaign", func(t *testing.T) {
		other := createCampaign(t, tb.gm, "Another", "")
		wantValidationError(t, postErrors(t, tb.ana, joinMutation, client.Var("code", *other.InviteCode), client.Var("characterId", tb.anaID)), "characterId")
	})
	t.Run("second character in the same campaign", func(t *testing.T) {
		id := createFighter(t, tb.ana).ID
		wantValidationError(t, postErrors(t, tb.ana, joinMutation, client.Var("code", code), client.Var("characterId", id)), "characterId")
	})
	t.Run("someone else's character", func(t *testing.T) {
		wantNotFound(t, messages(t, newcomer, joinMutation, map[string]any{"code": code, "characterId": tb.anaID}))
	})
	t.Run("player can't regenerate the code", func(t *testing.T) {
		errs := messages(t, tb.ana, regenerateInviteCodeMutation, map[string]any{"id": tb.campaign.ID})
		if len(errs) != 1 || !strings.Contains(errs[0], "only the campaign's GM") {
			t.Errorf("errors = %v, want GM only", errs)
		}
	})

	// Regenerating the code revokes the old one.
	var regen struct {
		Campaigns struct{ RegenerateInviteCode campaignResponse }
	}
	if err := tb.gm.Post(regenerateInviteCodeMutation, &regen, client.Var("id", tb.campaign.ID)); err != nil {
		t.Fatalf("regenerate: %v", err)
	}
	newCode := *regen.Campaigns.RegenerateInviteCode.InviteCode
	if newCode == code {
		t.Fatal("regenerated code is unchanged")
	}
	id := createFighter(t, newcomer).ID
	wantValidationError(t, postErrors(t, newcomer, joinMutation, client.Var("code", code), client.Var("characterId", id)), "code")
	if got := join(t, newcomer, newCode, id); len(got.Characters) != 3 {
		t.Errorf("after joining with the new code, party has %d characters, want 3", len(got.Characters))
	}
}

func TestGMSeesCampaignSheets(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	// The GM reads a player's full sheet, read-only.
	sheet := characterByID(t, tb.gm, tb.anaID)
	if sheet.Name != "Ana" || len(sheet.Equipment) == 0 {
		t.Errorf("GM's view of Ana = %+v, want the full sheet", sheet)
	}
	bonds := characterBonds(t, tb.gm, tb.anaID)
	if bonds.ViewerIsOwner || bonds.Campaign == nil || !bonds.Campaign.IsGm {
		t.Errorf("GM view: viewerIsOwner = %t, campaign = %+v", bonds.ViewerIsOwner, bonds.Campaign)
	}
	if !characterBonds(t, tb.ana, tb.anaID).ViewerIsOwner {
		t.Error("owner's viewerIsOwner = false")
	}

	// The GM may change HP and XP.
	damaged := takeDamage(t, tb.gm, tb.anaID, map[string]any{"amount": 3, "ignoresArmor": true})
	if damaged.HitPoints != sheet.HitPoints-3 {
		t.Errorf("after GM damage, HP = %d, want %d", damaged.HitPoints, sheet.HitPoints-3)
	}
	if healed := heal(t, tb.gm, tb.anaID, 2); healed.HitPoints != sheet.HitPoints-1 {
		t.Errorf("after GM heal, HP = %d, want %d", healed.HitPoints, sheet.HitPoints-1)
	}
	if got := postCharacter(t, tb.gm, adjustXPMutation, "characters", "adjustXp", client.Var("id", tb.anaID), client.Var("delta", 2)); got.Xp != 2 {
		t.Errorf("after GM adjustXp, XP = %d, want 2", got.Xp)
	}

	// Everything else stays owner-only.
	for _, call := range characterCalls(tb.anaID, tb.anaID, sheet.Equipment[0].ID) {
		switch call.name {
		case "characters.byId", "characters.adjustXp", "characters.heal", "characters.takeDamage":
			continue
		}
		t.Run("GM "+call.name, func(t *testing.T) {
			wantNotFound(t, messages(t, tb.gm, call.query, call.vars))
		})
	}

	// Players don't see each other's sheets, and the GM doesn't see
	// characters outside the campaign.
	wantNotFound(t, messages(t, tb.bo, characterByIDQuery, map[string]any{"id": tb.anaID}))
	wantNotFound(t, messages(t, tb.bo, healMutation, map[string]any{"id": tb.anaID, "amount": 1}))
	outsider := createFighter(t, tb.ana)
	wantNotFound(t, messages(t, tb.gm, characterByIDQuery, map[string]any{"id": outsider.ID}))
}

func TestBonds(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	got := addBond(t, tb.ana, tb.anaID, tb.boID, "  I have sworn to protect Bo. ")
	if len(got.Bonds) != 1 || got.Bonds[0].Text != "I have sworn to protect Bo." || got.Bonds[0].Target.Name != "Bo" {
		t.Fatalf("bonds = %+v, want one trimmed bond about Bo", got.Bonds)
	}
	bondID := got.Bonds[0].ID

	// The GM sees bonds on the sheet too.
	if gmView := characterBonds(t, tb.gm, tb.anaID); len(gmView.Bonds) != 1 {
		t.Errorf("GM sees %d bonds, want 1", len(gmView.Bonds))
	}

	outsider := createFighter(t, tb.bo)
	for name, target := range map[string]string{"self": tb.anaID, "outside the campaign": outsider.ID, "malformed": "nope"} {
		t.Run("target "+name, func(t *testing.T) {
			wantValidationError(t, postErrors(t, tb.ana, addBondMutation, client.Var("id", tb.anaID), client.Var("input", map[string]any{"targetId": target, "text": "x"})), "targetId")
		})
	}
	wantValidationError(t, postErrors(t, tb.ana, addBondMutation, client.Var("id", tb.anaID), client.Var("input", map[string]any{"targetId": tb.boID, "text": "  "})), "text")
	wantValidationError(t, postErrors(t, tb.bo, addBondMutation, client.Var("id", outsider.ID), client.Var("input", map[string]any{"targetId": tb.anaID, "text": "x"})), "id")

	// Only the owner changes bonds.
	wantNotFound(t, messages(t, tb.bo, updateBondMutation, map[string]any{"bondId": bondID, "text": "Hacked"}))
	wantNotFound(t, messages(t, tb.gm, deleteBondMutation, map[string]any{"bondId": bondID}))
	wantNotFound(t, messages(t, tb.gm, addBondMutation, map[string]any{"id": tb.anaID, "input": map[string]any{"targetId": tb.boID, "text": "x"}}))

	var updated struct {
		Characters struct{ UpdateBond bondsResponse }
	}
	if err := tb.ana.Post(updateBondMutation, &updated, client.Var("bondId", bondID), client.Var("text", "Bo owes me their life.")); err != nil {
		t.Fatalf("update bond: %v", err)
	}
	if b := updated.Characters.UpdateBond.Bonds; len(b) != 1 || b[0].Text != "Bo owes me their life." {
		t.Errorf("after update, bonds = %+v", b)
	}

	var deleted struct {
		Characters struct{ DeleteBond bondsResponse }
	}
	if err := tb.ana.Post(deleteBondMutation, &deleted, client.Var("bondId", bondID)); err != nil {
		t.Fatalf("delete bond: %v", err)
	}
	if b := deleted.Characters.DeleteBond.Bonds; len(b) != 0 {
		t.Errorf("after delete, bonds = %+v", b)
	}

	// Leaving deletes bonds written by and about the character.
	addBond(t, tb.ana, tb.anaID, tb.boID, "About Bo")
	addBond(t, tb.bo, tb.boID, tb.anaID, "About Ana")

	var left struct {
		Campaigns struct {
			Leave struct {
				Campaign *struct{ ID string }
			}
		}
	}
	if err := tb.bo.Post(leaveMutation, &left, client.Var("characterId", tb.boID)); err != nil {
		t.Fatalf("leave: %v", err)
	}
	if left.Campaigns.Leave.Campaign != nil {
		t.Error("after leaving, the character still has a campaign")
	}
	if b := characterBonds(t, tb.ana, tb.anaID).Bonds; len(b) != 0 {
		t.Errorf("after Bo left, Ana's bonds = %+v, want none", b)
	}
	if b := characterBonds(t, tb.bo, tb.boID).Bonds; len(b) != 0 {
		t.Errorf("after Bo left, Bo's bonds = %+v, want none", b)
	}
	if got := campaignByID(t, tb.ana, tb.campaign.ID); len(got.Characters) != 1 {
		t.Errorf("after Bo left, party = %+v", got.Characters)
	}
	wantNotFound(t, messages(t, tb.bo, campaignByIDQuery, map[string]any{"id": tb.campaign.ID}))
	wantValidationError(t, postErrors(t, tb.bo, leaveMutation, client.Var("characterId", tb.boID)), "id")
}

func TestEndOfSession(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	bond := addBond(t, tb.ana, tb.anaID, tb.boID, "I worry about Bo.").Bonds[0]

	allNo := map[string]any{"learned": unchecked(), "looted": unchecked(), "overcame": unchecked()}

	// Only the GM ends a session, and every "yes" needs a reason.
	errs := messages(t, tb.ana, endSessionMutation, map[string]any{"id": tb.campaign.ID, "input": allNo})
	if len(errs) != 1 || !strings.Contains(errs[0], "only the campaign's GM") {
		t.Errorf("player ending a session: errors = %v", errs)
	}
	wantValidationError(t, postErrors(t, tb.gm, endSessionMutation, client.Var("id", tb.campaign.ID), client.Var("input", map[string]any{
		"learned": checked(" "), "looted": unchecked(), "overcame": unchecked(),
	})), "learned.reason")

	if got := characterBonds(t, tb.ana, tb.anaID).PendingSession; got != nil {
		t.Errorf("before any session, pendingSession = %+v", got)
	}

	sessionID := endSession(t, tb.gm, tb.campaign.ID, map[string]any{
		"learned":  checked("The king is a lich."),
		"looted":   map[string]any{"checked": false, "reason": "ignored"},
		"overcame": checked("Killed the owlbear."),
	})

	pending := characterBonds(t, tb.ana, tb.anaID).PendingSession
	if pending == nil || pending.ID != sessionID || pending.Number != 1 {
		t.Fatalf("pendingSession = %+v, want session 1", pending)
	}

	// Only the owner reports, and checked items need reasons.
	wantNotFound(t, messages(t, tb.gm, submitSessionReportMutation, map[string]any{"id": tb.anaID, "input": map[string]any{"sessionId": sessionID, "alignment": unchecked()}}))
	errsList := postErrors(t, tb.ana, submitSessionReportMutation, client.Var("id", tb.anaID), client.Var("input", map[string]any{
		"sessionId":      sessionID,
		"alignment":      checked(""),
		"resolvedBondId": bond.ID,
	}))
	for _, field := range []string{"alignmentReason", "bondReason", "replacementBond.text", "replacementBond.targetId"} {
		wantValidationError(t, errsList, field)
	}
	wantValidationError(t, postErrors(t, tb.ana, submitSessionReportMutation, client.Var("id", tb.anaID), client.Var("input", map[string]any{
		"sessionId":       sessionID,
		"alignment":       unchecked(),
		"resolvedBondId":  "01970000-0000-7000-8000-000000000000",
		"bondReason":      "x",
		"replacementBond": map[string]any{"targetId": tb.boID, "text": "x"},
	})), "resolvedBondId")

	// Ana: 2 group yeses, alignment, and a resolved bond.
	ana := submitReport(t, tb.ana, tb.anaID, map[string]any{
		"sessionId":       sessionID,
		"alignment":       checked("Defended the weak."),
		"resolvedBondId":  bond.ID,
		"bondReason":      "Bo proved themselves.",
		"replacementBond": map[string]any{"targetId": tb.boID, "text": "Bo has my back."},
	})
	if ana.Xp != 4 {
		t.Errorf("Ana's XP = %d, want 4", ana.Xp)
	}
	if ana.PendingSession != nil {
		t.Errorf("after reporting, pendingSession = %+v", ana.PendingSession)
	}
	if len(ana.Bonds) != 1 || ana.Bonds[0].Text != "Bo has my back." {
		t.Errorf("after resolving, bonds = %+v, want only the replacement", ana.Bonds)
	}

	// Reporting twice fails.
	wantValidationError(t, postErrors(t, tb.ana, submitSessionReportMutation, client.Var("id", tb.anaID), client.Var("input", map[string]any{
		"sessionId": sessionID, "alignment": unchecked(),
	})), "sessionId")

	// Bo: group yeses only.
	if bo := submitReport(t, tb.bo, tb.boID, map[string]any{"sessionId": sessionID, "alignment": unchecked()}); bo.Xp != 2 {
		t.Errorf("Bo's XP = %d, want 2", bo.Xp)
	}

	// The log shows everything.
	campaign := campaignByID(t, tb.bo, tb.campaign.ID)
	if len(campaign.Sessions) != 1 {
		t.Fatalf("sessions = %+v, want 1", campaign.Sessions)
	}
	session := campaign.Sessions[0]
	ptr := func(s string) *string { return &s }
	if diff := cmp.Diff(checkedResponse{true, ptr("The king is a lich.")}, session.Learned); diff != "" {
		t.Errorf("learned (-want +got):\n%s", diff)
	}
	if diff := cmp.Diff(checkedResponse{false, nil}, session.Looted); diff != "" {
		t.Errorf("looted (-want +got):\n%s", diff)
	}
	if len(session.Reports) != 2 {
		t.Fatalf("reports = %+v, want 2", session.Reports)
	}
	report := session.Reports[0]
	if report.Character.ID != tb.anaID || report.XpAwarded != 4 || !report.Alignment.Checked || *report.Alignment.Reason != "Defended the weak." ||
		!report.Bond.Checked || *report.Bond.Reason != "Bo proved themselves." || report.ResolvedBondText == nil || *report.ResolvedBondText != "I worry about Bo." {
		t.Errorf("Ana's report = %+v", report)
	}
	if r := session.Reports[1]; r.Character.ID != tb.boID || r.XpAwarded != 2 || r.Alignment.Checked || r.Bond.Checked || r.ResolvedBondText != nil {
		t.Errorf("Bo's report = %+v", r)
	}

	// A new End of Session closes the old one.
	newCharacter := registered(t, tb.h, "carl@example.com")
	carlID := createNamedFighter(t, newCharacter, "Carl").ID
	join(t, newCharacter, *tb.campaign.InviteCode, carlID)
	second := endSession(t, tb.gm, tb.campaign.ID, allNo)
	wantValidationError(t, postErrors(t, newCharacter, submitSessionReportMutation, client.Var("id", carlID), client.Var("input", map[string]any{
		"sessionId": sessionID, "alignment": unchecked(),
	})), "sessionId")
	if got := characterBonds(t, newCharacter, carlID).PendingSession; got == nil || got.ID != second || got.Number != 2 {
		t.Errorf("Carl's pendingSession = %+v, want session 2", got)
	}
	if got := submitReport(t, newCharacter, carlID, map[string]any{"sessionId": second, "alignment": unchecked()}); got.Xp != 0 {
		t.Errorf("Carl's XP = %d, want 0", got.Xp)
	}
}

func TestRemoveCharacterAndDeleteCampaign(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	addBond(t, tb.ana, tb.anaID, tb.boID, "About Bo")

	// Players can't remove others or delete the campaign.
	for _, call := range []struct {
		query string
		vars  map[string]any
	}{
		{removeCharacterMutation, map[string]any{"id": tb.campaign.ID, "characterId": tb.boID}},
		{deleteCampaignMutation, map[string]any{"id": tb.campaign.ID}},
		{updateCampaignMutation, map[string]any{"id": tb.campaign.ID, "input": map[string]any{"name": "x"}}},
	} {
		if errs := messages(t, tb.ana, call.query, call.vars); len(errs) != 1 || !strings.Contains(errs[0], "only the campaign's GM") {
			t.Errorf("player call: errors = %v, want GM only", errs)
		}
	}

	var removed struct {
		Campaigns struct{ RemoveCharacter campaignResponse }
	}
	if err := tb.gm.Post(removeCharacterMutation, &removed, client.Var("id", tb.campaign.ID), client.Var("characterId", tb.boID)); err != nil {
		t.Fatalf("remove character: %v", err)
	}
	if got := removed.Campaigns.RemoveCharacter.Characters; len(got) != 1 || got[0].ID != tb.anaID {
		t.Errorf("after removing Bo, party = %+v", got)
	}
	if got := characterBonds(t, tb.ana, tb.anaID).Bonds; len(got) != 0 {
		t.Errorf("after removing Bo, Ana's bonds = %+v", got)
	}
	if got := characterBonds(t, tb.bo, tb.boID).Campaign; got != nil {
		t.Errorf("Bo's campaign after removal = %+v", got)
	}
	wantNotFound(t, messages(t, tb.gm, removeCharacterMutation, map[string]any{"id": tb.campaign.ID, "characterId": tb.boID}))

	var deleted struct{ Campaigns struct{ Delete bool } }
	if err := tb.gm.Post(deleteCampaignMutation, &deleted, client.Var("id", tb.campaign.ID)); err != nil || !deleted.Campaigns.Delete {
		t.Fatalf("delete campaign: %v, %t", err, deleted.Campaigns.Delete)
	}
	if got := characterBonds(t, tb.ana, tb.anaID); got.Campaign != nil {
		t.Errorf("Ana's campaign after deletion = %+v", got.Campaign)
	}
	wantNotFound(t, messages(t, tb.gm, campaignByIDQuery, map[string]any{"id": tb.campaign.ID}))
	if got := myCampaigns(t, tb.gm); len(got) != 0 {
		t.Errorf("GM's campaigns after deletion = %+v", got)
	}
}

func TestLoggedOutCampaignCallsAreUnauthenticated(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	anonymous := testutil.NewBrowser(h).Client

	for name, call := range map[string]struct {
		query string
		vars  map[string]any
	}{
		"mine":         {myCampaignsQuery, nil},
		"byInviteCode": {inviteQuery, map[string]any{"code": "ABCDEFGHJK"}},
		"create":       {createCampaignMutation, map[string]any{"input": map[string]any{"name": "x"}}},
	} {
		t.Run(name, func(t *testing.T) {
			errs := postErrors(t, anonymous, call.query, options(call.vars)...)
			if len(errs) != 1 || errs[0].Extensions["code"] != auth.UnauthenticatedErrorCode {
				t.Errorf("errors = %v, want one with code %s", errs, auth.UnauthenticatedErrorCode)
			}
		})
	}
}
