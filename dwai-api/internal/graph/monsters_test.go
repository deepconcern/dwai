//go:build integration

package graph_test

import (
	"strings"
	"testing"

	"github.com/99designs/gqlgen/client"
	"github.com/deepconcern/dwai/dwai-api/internal/auth"
	"github.com/deepconcern/dwai/dwai-api/internal/testutil"
	"github.com/google/go-cmp/cmp"
)

const monsterFields = `
fragment MonsterFields on Monster {
	id
	name
	source
	sourceKey
	setting { key name }
	hp
	armor
	attack { name damage piercing ignoresArmor tags }
	tags
	instinct
	description
	moves
	specialQualities
}`

type monsterResponse struct {
	ID        string
	Name      string
	Source    string
	SourceKey *string
	Setting   *struct {
		Key  string
		Name string
	}
	HP     *int32
	Armor  *int32
	Attack *struct {
		Name         string
		Damage       string
		Piercing     int32
		IgnoresArmor bool
		Tags         []string
	}
	Tags             []string
	Instinct         string
	Description      string
	Moves            []string
	SpecialQualities []string
}

const campaignMonsterFields = `
fragment CampaignMonsterFields on CampaignMonster {
	id
	name
	hp
	maxHp
	statBlock { ...MonsterFields }
}` + monsterFields

type campaignMonsterResponse struct {
	ID        string
	Name      string
	HP        int32
	MaxHP     int32 `json:"maxHp"`
	StatBlock monsterResponse
}

const compendiumQuery = `
query { monsters { compendium { ...MonsterFields } } }` + monsterFields

const myMonstersQuery = `
query { monsters { mine { ...MonsterFields } } }` + monsterFields

const customMonsterQuery = `
query ($id: ID!) { monsters { custom(id: $id) { ...MonsterFields } } }` + monsterFields

const createCustomMonsterMutation = `
mutation ($input: MonsterInput!) { monsters { createCustom(input: $input) { ...MonsterFields } } }` + monsterFields

const updateCustomMonsterMutation = `
mutation ($id: ID!, $input: MonsterInput!) { monsters { updateCustom(id: $id, input: $input) { ...MonsterFields } } }` + monsterFields

const deleteCustomMonsterMutation = `
mutation ($id: ID!) { monsters { deleteCustom(id: $id) } }`

const campaignMonstersQuery = `
query ($id: ID!) { campaigns { byId(id: $id) { monsters { ...CampaignMonsterFields } } } }` + campaignMonsterFields

const addMonstersMutation = `
mutation ($id: ID!, $input: AddMonstersInput!) {
	campaigns { addMonsters(id: $id, input: $input) { ...CampaignMonsterFields } }
}` + campaignMonsterFields

const damageMonsterMutation = `
mutation ($monsterId: ID!, $input: TakeDamageInput!) {
	campaigns { damageMonster(monsterId: $monsterId, input: $input) { ...CampaignMonsterFields } }
}` + campaignMonsterFields

const healMonsterMutation = `
mutation ($monsterId: ID!, $amount: Int!) {
	campaigns { healMonster(monsterId: $monsterId, amount: $amount) { ...CampaignMonsterFields } }
}` + campaignMonsterFields

const renameMonsterMutation = `
mutation ($monsterId: ID!, $name: String!) {
	campaigns { renameMonster(monsterId: $monsterId, name: $name) { ...CampaignMonsterFields } }
}` + campaignMonsterFields

const removeMonsterMutation = `
mutation ($monsterId: ID!) { campaigns { removeMonster(monsterId: $monsterId) } }`

const postMonsterDamageMutation = `
mutation ($monsterId: ID!, $input: DamageRollInput!) {
	campaigns { postMonsterDamage(monsterId: $monsterId, input: $input) { ...MessageFields } }
}` + messageFields

func createCustomMonster(t *testing.T, c *client.Client, input map[string]any) monsterResponse {
	t.Helper()

	var resp struct {
		Monsters struct{ CreateCustom monsterResponse }
	}
	if err := c.Post(createCustomMonsterMutation, &resp, client.Var("input", input)); err != nil {
		t.Fatalf("create custom monster: %v", err)
	}

	return resp.Monsters.CreateCustom
}

func myMonsters(t *testing.T, c *client.Client) []monsterResponse {
	t.Helper()

	var resp struct {
		Monsters struct{ Mine []monsterResponse }
	}
	if err := c.Post(myMonstersQuery, &resp); err != nil {
		t.Fatalf("list my monsters: %v", err)
	}

	return resp.Monsters.Mine
}

func addMonsters(t *testing.T, c *client.Client, campaignID string, input map[string]any) []campaignMonsterResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ AddMonsters []campaignMonsterResponse }
	}
	if err := c.Post(addMonstersMutation, &resp, client.Var("id", campaignID), client.Var("input", input)); err != nil {
		t.Fatalf("add monsters: %v", err)
	}

	return resp.Campaigns.AddMonsters
}

func campaignMonsters(t *testing.T, c *client.Client, campaignID string) []campaignMonsterResponse {
	t.Helper()

	var resp struct {
		Campaigns struct {
			ByID struct{ Monsters []campaignMonsterResponse }
		}
	}
	if err := c.Post(campaignMonstersQuery, &resp, client.Var("id", campaignID)); err != nil {
		t.Fatalf("list campaign monsters: %v", err)
	}

	return resp.Campaigns.ByID.Monsters
}

func damageMonster(t *testing.T, c *client.Client, monsterID string, input map[string]any) campaignMonsterResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ DamageMonster campaignMonsterResponse }
	}
	if err := c.Post(damageMonsterMutation, &resp, client.Var("monsterId", monsterID), client.Var("input", input)); err != nil {
		t.Fatalf("damage monster: %v", err)
	}

	return resp.Campaigns.DamageMonster
}

func monsterNames(monsters []campaignMonsterResponse) []string {
	names := make([]string, len(monsters))
	for i, m := range monsters {
		names[i] = m.Name
	}

	return names
}

// customOgre is a custom monster with 10 HP and armor 3, for damage tests.
var customOgre = map[string]any{"name": "Ogre", "hp": 10, "armor": 3, "attack": map[string]any{"name": "Club", "damage": "d8+5"}}

func TestCompendium(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	c := registered(t, h, "gm@example.com")

	var resp struct {
		Monsters struct{ Compendium []monsterResponse }
	}
	if err := c.Post(compendiumQuery, &resp); err != nil {
		t.Fatalf("compendium: %v", err)
	}
	all := resp.Monsters.Compendium

	t.Run("lists all 154 monsters", func(t *testing.T) {
		if len(all) != 154 {
			t.Errorf("len = %d, want 154", len(all))
		}
	})

	byName := map[string]monsterResponse{}
	for _, m := range all {
		byName[m.Name] = m
	}

	t.Run("Cave Rat has its key, setting, and split attack", func(t *testing.T) {
		rat := byName["Cave Rat"]
		if rat.ID != "cave_rat" || rat.Source != "COMPENDIUM" || rat.Setting == nil || rat.Setting.Key != "caverns" {
			t.Errorf("Cave Rat = %+v, want id cave_rat in caverns", rat)
		}
		if rat.Attack == nil || rat.Attack.Name != "Gnaw" || rat.Attack.Damage != "d6" || rat.Attack.Piercing != 1 {
			t.Errorf("attack = %+v, want Gnaw d6, 1 piercing", rat.Attack)
		}
	})

	t.Run("Merchant has no stats", func(t *testing.T) {
		merchant := byName["Merchant"]
		if merchant.HP != nil || merchant.Armor != nil || merchant.Attack != nil {
			t.Errorf("Merchant = %+v, want null HP, armor, and attack", merchant)
		}
	})
}

func TestLoggedOutMonsterCallsAreUnauthenticated(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	anonymous := testutil.NewBrowser(h).Client

	errs := postErrors(t, anonymous, compendiumQuery)
	if len(errs) != 1 || errs[0].Extensions["code"] != auth.UnauthenticatedErrorCode {
		t.Errorf("errors = %v, want one with code %s", errs, auth.UnauthenticatedErrorCode)
	}
}

func TestCreateCustomMonster(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	c := registered(t, h, "gm@example.com")

	created := createCustomMonster(t, c, map[string]any{
		"name": "Bog Hag", "hp": 12, "armor": 1,
		"attack": map[string]any{"name": "Claw", "damage": "d8+1"},
	})

	mine := myMonsters(t, c)
	if len(mine) != 1 || mine[0].ID != created.ID {
		t.Fatalf("bestiary = %+v, want the Bog Hag", mine)
	}
	got := mine[0]
	if got.Name != "Bog Hag" || got.Source != "CUSTOM" || *got.HP != 12 || *got.Armor != 1 || got.Attack.Name != "Claw" || got.Attack.Damage != "d8+1" {
		t.Errorf("Bog Hag = %+v, want HP 12, armor 1, Claw d8+1", got)
	}
}

func TestCustomMonsterWithOnlyAName(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	c := registered(t, h, "gm@example.com")

	got := createCustomMonster(t, c, map[string]any{"name": "Peasant"})
	if got.HP != nil || got.Armor != nil || got.Attack != nil {
		t.Errorf("Peasant = %+v, want null HP, armor, and attack", got)
	}
}

func TestInvalidCustomMonsters(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		input map[string]any
		field string
	}{
		{"blank name", map[string]any{"name": " "}, "name"},
		{"HP 0", map[string]any{"name": "x", "hp": 0}, "hp"},
		{"armor 11", map[string]any{"name": "x", "armor": 11}, "armor"},
		{"damage 2d7", map[string]any{"name": "x", "attack": map[string]any{"name": "Bite", "damage": "2d7"}}, "attack.damage"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			h, _ := env.NewServer(t)
			c := registered(t, h, "gm@example.com")

			errs := postErrors(t, c, createCustomMonsterMutation, client.Var("input", tt.input))
			wantValidationError(t, errs, tt.field)
			if mine := myMonsters(t, c); len(mine) != 0 {
				t.Errorf("saved %+v, want nothing", mine)
			}
		})
	}
}

func TestCopyFromCompendium(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	c := registered(t, h, "gm@example.com")

	copied := createCustomMonster(t, c, map[string]any{"name": "Ankheg", "hp": 10, "armor": 3, "sourceKey": "ankheg"})

	var updated struct {
		Monsters struct{ UpdateCustom monsterResponse }
	}
	err := c.Post(updateCustomMonsterMutation, &updated, client.Var("id", copied.ID), client.Var("input", map[string]any{"name": "Corn Ankheg", "hp": 10, "armor": 3, "sourceKey": "ankheg"}))
	if err != nil {
		t.Fatalf("update custom monster: %v", err)
	}
	if got := updated.Monsters.UpdateCustom; got.Name != "Corn Ankheg" || got.SourceKey == nil || *got.SourceKey != "ankheg" {
		t.Errorf("copy = %+v, want Corn Ankheg from ankheg", got)
	}

	var compendium struct {
		Monsters struct{ ByKey monsterResponse }
	}
	if err := c.Post(`query { monsters { byKey(key: "ankheg") { ...MonsterFields } } }`+monsterFields, &compendium); err != nil {
		t.Fatalf("byKey: %v", err)
	}
	if got := compendium.Monsters.ByKey.Name; got != "Ankheg" {
		t.Errorf("compendium Ankheg's name = %q, want unchanged", got)
	}
}

func TestCustomMonstersBelongToTheirOwner(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	owner := registered(t, h, "gm@example.com")
	stranger := registered(t, h, "other@example.com")
	hag := createCustomMonster(t, owner, map[string]any{"name": "Bog Hag"})

	for name, call := range map[string]struct {
		query string
		vars  map[string]any
	}{
		"read":   {customMonsterQuery, map[string]any{"id": hag.ID}},
		"edit":   {updateCustomMonsterMutation, map[string]any{"id": hag.ID, "input": map[string]any{"name": "Mine now"}}},
		"delete": {deleteCustomMonsterMutation, map[string]any{"id": hag.ID}},
	} {
		t.Run(name, func(t *testing.T) {
			wantNotFound(t, messages(t, stranger, call.query, call.vars))
		})
	}

	if mine := myMonsters(t, stranger); len(mine) != 0 {
		t.Errorf("the stranger's bestiary = %+v, want empty", mine)
	}
	if mine := myMonsters(t, owner); len(mine) != 1 || mine[0].Name != "Bog Hag" {
		t.Errorf("the owner's bestiary = %+v, want the Bog Hag unchanged", mine)
	}
}

func TestDeletingACustomMonsterKeepsItsCopiesInPlay(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	hag := createCustomMonster(t, tb.gm, map[string]any{"name": "Bog Hag", "hp": 12, "instinct": "To curse"})
	addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"customMonsterId": hag.ID})

	var resp struct{ Monsters struct{ DeleteCustom bool } }
	if err := tb.gm.Post(deleteCustomMonsterMutation, &resp, client.Var("id", hag.ID)); err != nil {
		t.Fatalf("delete custom monster: %v", err)
	}

	inPlay := campaignMonsters(t, tb.gm, tb.campaign.ID)
	if len(inPlay) != 1 || inPlay[0].StatBlock.Instinct != "To curse" || inPlay[0].MaxHP != 12 {
		t.Errorf("in play = %+v, want the Bog Hag's snapshot", inPlay)
	}
}

func TestAddMonstersToPlay(t *testing.T) {
	t.Parallel()

	t.Run("several are numbered at the compendium's HP", func(t *testing.T) {
		t.Parallel()

		tb := newTable(t)
		added := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"compendiumKey": "goblin", "count": 4})

		if diff := cmp.Diff([]string{"Goblin 1", "Goblin 2", "Goblin 3", "Goblin 4"}, monsterNames(added)); diff != "" {
			t.Errorf("names (-want +got):\n%s", diff)
		}
		for _, m := range added {
			if m.HP != 3 || m.MaxHP != 3 {
				t.Errorf("%s HP = %d/%d, want 3/3 (the compendium goblin)", m.Name, m.HP, m.MaxHP)
			}
		}
	})

	t.Run("numbering continues after the highest in play", func(t *testing.T) {
		t.Parallel()

		tb := newTable(t)
		addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"compendiumKey": "goblin", "count": 4})
		added := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"compendiumKey": "goblin", "count": 2})

		if diff := cmp.Diff([]string{"Goblin 5", "Goblin 6"}, monsterNames(added)); diff != "" {
			t.Errorf("names (-want +got):\n%s", diff)
		}
	})

	t.Run("one keeps its name", func(t *testing.T) {
		t.Parallel()

		tb := newTable(t)
		added := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"compendiumKey": "ogre"})

		if diff := cmp.Diff([]string{"Ogre"}, monsterNames(added)); diff != "" {
			t.Errorf("names (-want +got):\n%s", diff)
		}
	})

	t.Run("a stat block without HP needs a max HP", func(t *testing.T) {
		t.Parallel()

		tb := newTable(t)
		errs := postErrors(t, tb.gm, addMonstersMutation, client.Var("id", tb.campaign.ID), client.Var("input", map[string]any{"compendiumKey": "merchant"}))
		wantValidationError(t, errs, "maxHp")

		added := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"compendiumKey": "merchant", "maxHp": 6})
		if len(added) != 1 || added[0].HP != 6 || added[0].MaxHP != 6 {
			t.Errorf("added = %+v, want one Merchant at 6/6", added)
		}
	})
}

func TestPlayersCantSeeOrChangeMonstersInPlay(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	ogre := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"compendiumKey": "ogre"})[0]

	for name, call := range map[string]struct {
		query string
		vars  map[string]any
	}{
		"list":   {campaignMonstersQuery, map[string]any{"id": tb.campaign.ID}},
		"add":    {addMonstersMutation, map[string]any{"id": tb.campaign.ID, "input": map[string]any{"compendiumKey": "goblin"}}},
		"damage": {damageMonsterMutation, map[string]any{"monsterId": ogre.ID, "input": map[string]any{"amount": 5}}},
		"heal":   {healMonsterMutation, map[string]any{"monsterId": ogre.ID, "amount": 1}},
		"rename": {renameMonsterMutation, map[string]any{"monsterId": ogre.ID, "name": "Bob"}},
		"remove": {removeMonsterMutation, map[string]any{"monsterId": ogre.ID}},
		"roll": {postMonsterDamageMutation, map[string]any{"monsterId": ogre.ID, "input": map[string]any{
			"diceTotal": 6, "label": "Club: d8+5",
		}}},
	} {
		t.Run(name, func(t *testing.T) {
			errs := messages(t, tb.ana, call.query, call.vars)
			if len(errs) != 1 || !strings.Contains(errs[0], "only the campaign's GM") {
				t.Errorf("errors = %v, want one GM-only error", errs)
			}
		})
	}

	if got := campaignMonsters(t, tb.gm, tb.campaign.ID); len(got) != 1 || got[0].Name != "Ogre" || got[0].HP != got[0].MaxHP {
		t.Errorf("in play = %+v, want the Ogre unchanged", got)
	}
}

func TestDamageMonster(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		monster map[string]any
		input   map[string]any
		wantHP  int32
	}{
		{"armor is subtracted", customOgre, map[string]any{"amount": 5}, 8},
		{"piercing reduces armor", customOgre, map[string]any{"amount": 5, "piercing": 2}, 6},
		{"ignores armor", customOgre, map[string]any{"amount": 5, "ignoresArmor": true}, 5},
		{"never below 0", map[string]any{"name": "Rat", "hp": 2, "armor": 0}, map[string]any{"amount": 5}, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			tb := newTable(t)
			custom := createCustomMonster(t, tb.gm, tt.monster)
			monster := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"customMonsterId": custom.ID})[0]

			if got := damageMonster(t, tb.gm, monster.ID, tt.input); got.HP != tt.wantHP {
				t.Errorf("HP = %d, want %d", got.HP, tt.wantHP)
			}
		})
	}
}

func TestHealMonsterStopsAtMaxHP(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	custom := createCustomMonster(t, tb.gm, map[string]any{"name": "Ogre", "hp": 10, "armor": 0})
	ogre := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"customMonsterId": custom.ID})[0]
	damageMonster(t, tb.gm, ogre.ID, map[string]any{"amount": 7})

	var resp struct {
		Campaigns struct{ HealMonster campaignMonsterResponse }
	}
	if err := tb.gm.Post(healMonsterMutation, &resp, client.Var("monsterId", ogre.ID), client.Var("amount", 20)); err != nil {
		t.Fatalf("heal monster: %v", err)
	}
	if got := resp.Campaigns.HealMonster.HP; got != 10 {
		t.Errorf("HP = %d, want 10", got)
	}
}

func TestRenameAndRemoveMonsters(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	added := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"compendiumKey": "goblin", "count": 2})

	var renamed struct {
		Campaigns struct{ RenameMonster campaignMonsterResponse }
	}
	if err := tb.gm.Post(renameMonsterMutation, &renamed, client.Var("monsterId", added[0].ID), client.Var("name", "Grik")); err != nil {
		t.Fatalf("rename monster: %v", err)
	}

	var removed struct{ Campaigns struct{ RemoveMonster bool } }
	if err := tb.gm.Post(removeMonsterMutation, &removed, client.Var("monsterId", added[1].ID)); err != nil {
		t.Fatalf("remove monster: %v", err)
	}

	if diff := cmp.Diff([]string{"Grik"}, monsterNames(campaignMonsters(t, tb.gm, tb.campaign.ID))); diff != "" {
		t.Errorf("in play (-want +got):\n%s", diff)
	}
}

func TestMonsterHPChangesAreNotLogged(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	ogre := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"compendiumKey": "ogre"})[0]
	damageMonster(t, tb.gm, ogre.ID, map[string]any{"amount": 5})

	if got := campaignMessages(t, tb.gm, tb.campaign.ID).Messages; len(got) != 0 {
		t.Errorf("chat = %+v, want nothing", got)
	}
}

func TestPostMonsterDamage(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	ogre := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"compendiumKey": "ogre"})[0]

	var resp struct {
		Campaigns struct{ PostMonsterDamage messageResponse }
	}
	err := tb.gm.Post(postMonsterDamageMutation, &resp, client.Var("monsterId", ogre.ID), client.Var("input", map[string]any{
		"dice":      []map[string]any{{"sides": 8, "value": 6}},
		"label":     "Club: d8+5",
		"modifiers": []map[string]any{{"label": "+5", "value": 5}},
	}))
	if err != nil {
		t.Fatalf("post monster damage: %v", err)
	}

	got := resp.Campaigns.PostMonsterDamage
	if got.Kind != "DAMAGE" || got.AuthorName != "Ogre" || got.Roll == nil || got.Roll.Total != 11 || len(got.Roll.Dice) != 1 {
		t.Errorf("message = %+v (roll %+v), want a damage roll by Ogre totalling 6 + 5 = 11", got, got.Roll)
	}

	if seen := campaignMessages(t, tb.ana, tb.campaign.ID).Messages; len(seen) != 1 || seen[0].AuthorName != "Ogre" {
		t.Errorf("Ana sees %+v, want the Ogre's roll", seen)
	}
}

func TestGMOnlyMonsterDamage(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	ogre := addMonsters(t, tb.gm, tb.campaign.ID, map[string]any{"compendiumKey": "ogre"})[0]

	var resp struct {
		Campaigns struct{ PostMonsterDamage messageResponse }
	}
	err := tb.gm.Post(postMonsterDamageMutation, &resp, client.Var("monsterId", ogre.ID), client.Var("input", map[string]any{
		"diceTotal": 6, "gmOnly": true, "label": "Club: d8+5",
	}))
	if err != nil {
		t.Fatalf("post monster damage: %v", err)
	}

	if seen := campaignMessages(t, tb.ana, tb.campaign.ID).Messages; len(seen) != 0 {
		t.Errorf("Ana sees %+v, want nothing", seen)
	}
}
