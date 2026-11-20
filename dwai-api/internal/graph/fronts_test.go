//go:build integration

package graph_test

import (
	"strings"
	"testing"

	"github.com/99designs/gqlgen/client"
	"github.com/google/go-cmp/cmp"
)

const dangerFields = `
fragment DangerFields on Danger {
	id
	frontId
	name
	type
	impulse
	impendingDoom
	notes
	revealed
	category { key name moves }
	portents { id text done revealed }
}`

type portentResponse struct {
	ID       string
	Text     string
	Done     bool
	Revealed bool
}

type dangerResponse struct {
	ID            string
	FrontID       *string `json:"frontId"`
	Name          string
	Type          string
	Impulse       string
	ImpendingDoom string
	Notes         string
	Revealed      bool
	Category      *struct {
		Key   string
		Name  string
		Moves []string
	}
	Portents []portentResponse
}

const frontFields = `
fragment FrontFields on Front {
	id
	kind
	name
	notes
	resolved
	stakes { question answer }
	dangers { ...DangerFields }
}` + dangerFields

type frontResponse struct {
	ID       string
	Kind     string
	Name     string
	Notes    string
	Resolved bool
	Stakes   []struct {
		Question string
		Answer   string
	}
	Dangers []dangerResponse
}

const encounterFields = `
fragment EncounterFields on Encounter {
	id
	name
	location
	notes
	danger { id name }
	monsters { id count maxHp statBlock { name } }
}`

type encounterResponse struct {
	ID       string
	Name     string
	Location string
	Notes    string
	Danger   *struct {
		ID   string
		Name string
	}
	Monsters []struct {
		ID        string
		Count     int32
		MaxHP     int32 `json:"maxHp"`
		StatBlock struct{ Name string }
	}
}

type knownThreatResponse struct {
	DangerID string `json:"dangerId"`
	Name     string
	Type     string
	Portents []string
}

const dangerTemplateQuery = `
query { dangerTemplate { categories { key name types { key name impulse } } impendingDooms { key name } } }`

const campaignPrepQuery = `
query ($id: ID!) { campaigns { byId(id: $id) {
	fronts { ...FrontFields }
	dangersWithoutFront { ...DangerFields }
} } }` + frontFields

const campaignFrontsQuery = `
query ($id: ID!) { campaigns { byId(id: $id) { fronts { id } } } }`

const campaignDangersQuery = `
query ($id: ID!) { campaigns { byId(id: $id) { dangersWithoutFront { id } } } }`

const campaignEncountersQuery = `
query ($id: ID!) { campaigns { byId(id: $id) { encounters { ...EncounterFields } } } }` + encounterFields

const knownThreatsQuery = `
query ($id: ID!) { campaigns { byId(id: $id) { knownThreats { dangerId name type portents } } } }`

const campaignMonsterEncountersQuery = `
query ($id: ID!) { campaigns { byId(id: $id) { monsters { name hp maxHp encounterId } } } }`

const createFrontMutation = `
mutation ($id: ID!, $input: FrontInput!) { campaigns { createFront(id: $id, input: $input) { ...FrontFields } } }` + frontFields

const updateFrontMutation = `
mutation ($frontId: ID!, $input: FrontInput!) { campaigns { updateFront(frontId: $frontId, input: $input) { ...FrontFields } } }` + frontFields

const setFrontResolvedMutation = `
mutation ($frontId: ID!, $resolved: Boolean!) { campaigns { setFrontResolved(frontId: $frontId, resolved: $resolved) { resolved } } }`

const deleteFrontMutation = `
mutation ($frontId: ID!) { campaigns { deleteFront(frontId: $frontId) } }`

const createDangerMutation = `
mutation ($id: ID!, $input: DangerInput!) { campaigns { createDanger(id: $id, input: $input) { ...DangerFields } } }` + dangerFields

const updateDangerMutation = `
mutation ($dangerId: ID!, $input: DangerInput!) { campaigns { updateDanger(dangerId: $dangerId, input: $input) { ...DangerFields } } }` + dangerFields

const deleteDangerMutation = `
mutation ($dangerId: ID!) { campaigns { deleteDanger(dangerId: $dangerId) } }`

const setPortentDoneMutation = `
mutation ($portentId: ID!, $done: Boolean!) { campaigns { setPortentDone(portentId: $portentId, done: $done) { ...DangerFields } } }` + dangerFields

const setDangerRevealedMutation = `
mutation ($dangerId: ID!, $revealed: Boolean!) { campaigns { setDangerRevealed(dangerId: $dangerId, revealed: $revealed) { ...DangerFields } } }` + dangerFields

const setPortentRevealedMutation = `
mutation ($portentId: ID!, $revealed: Boolean!) { campaigns { setPortentRevealed(portentId: $portentId, revealed: $revealed) { ...DangerFields } } }` + dangerFields

const createEncounterMutation = `
mutation ($id: ID!, $input: EncounterInput!) { campaigns { createEncounter(id: $id, input: $input) { ...EncounterFields } } }` + encounterFields

const updateEncounterMutation = `
mutation ($encounterId: ID!, $input: EncounterInput!) { campaigns { updateEncounter(encounterId: $encounterId, input: $input) { ...EncounterFields } } }` + encounterFields

const deleteEncounterMutation = `
mutation ($encounterId: ID!) { campaigns { deleteEncounter(encounterId: $encounterId) } }`

const addEncounterMonstersMutation = `
mutation ($encounterId: ID!, $input: AddMonstersInput!) { campaigns { addEncounterMonsters(encounterId: $encounterId, input: $input) { ...EncounterFields } } }` + encounterFields

const setEncounterMonsterCountMutation = `
mutation ($encounterMonsterId: ID!, $count: Int!) { campaigns { setEncounterMonsterCount(encounterMonsterId: $encounterMonsterId, count: $count) { ...EncounterFields } } }` + encounterFields

const removeEncounterMonsterMutation = `
mutation ($encounterMonsterId: ID!) { campaigns { removeEncounterMonster(encounterMonsterId: $encounterMonsterId) { ...EncounterFields } } }` + encounterFields

const runEncounterMutation = `
mutation ($encounterId: ID!) { campaigns { runEncounter(encounterId: $encounterId) { name hp maxHp encounterId } } }`

type encounterMonsterInPlay struct {
	Name        string
	HP          int32
	MaxHP       int32   `json:"maxHp"`
	EncounterID *string `json:"encounterId"`
}

func createFront(t *testing.T, c *client.Client, campaignID string, input map[string]any) frontResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ CreateFront frontResponse }
	}
	if err := c.Post(createFrontMutation, &resp, client.Var("id", campaignID), client.Var("input", input)); err != nil {
		t.Fatalf("create front: %v", err)
	}

	return resp.Campaigns.CreateFront
}

func createDanger(t *testing.T, c *client.Client, campaignID string, input map[string]any) dangerResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ CreateDanger dangerResponse }
	}
	if err := c.Post(createDangerMutation, &resp, client.Var("id", campaignID), client.Var("input", input)); err != nil {
		t.Fatalf("create danger: %v", err)
	}

	return resp.Campaigns.CreateDanger
}

func updateDanger(t *testing.T, c *client.Client, dangerID string, input map[string]any) dangerResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ UpdateDanger dangerResponse }
	}
	if err := c.Post(updateDangerMutation, &resp, client.Var("dangerId", dangerID), client.Var("input", input)); err != nil {
		t.Fatalf("update danger: %v", err)
	}

	return resp.Campaigns.UpdateDanger
}

func setPortent(t *testing.T, c *client.Client, mutation, flag, portentID string, value bool) dangerResponse {
	t.Helper()

	var resp struct {
		Campaigns map[string]dangerResponse
	}
	if err := c.Post(mutation, &resp, client.Var("portentId", portentID), client.Var(flag, value)); err != nil {
		t.Fatalf("set portent %s: %v", flag, err)
	}
	for _, d := range resp.Campaigns {
		return d
	}

	return dangerResponse{}
}

func setDangerRevealed(t *testing.T, c *client.Client, dangerID string, revealed bool) dangerResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ SetDangerRevealed dangerResponse }
	}
	if err := c.Post(setDangerRevealedMutation, &resp, client.Var("dangerId", dangerID), client.Var("revealed", revealed)); err != nil {
		t.Fatalf("set danger revealed: %v", err)
	}

	return resp.Campaigns.SetDangerRevealed
}

type campaignPrep struct {
	Fronts              []frontResponse
	DangersWithoutFront []dangerResponse
}

func prep(t *testing.T, c *client.Client, campaignID string) campaignPrep {
	t.Helper()

	var resp struct{ Campaigns struct{ ByID campaignPrep } }
	if err := c.Post(campaignPrepQuery, &resp, client.Var("id", campaignID)); err != nil {
		t.Fatalf("get prep: %v", err)
	}

	return resp.Campaigns.ByID
}

func knownThreats(t *testing.T, c *client.Client, campaignID string) []knownThreatResponse {
	t.Helper()

	var resp struct {
		Campaigns struct {
			ByID struct{ KnownThreats []knownThreatResponse }
		}
	}
	if err := c.Post(knownThreatsQuery, &resp, client.Var("id", campaignID)); err != nil {
		t.Fatalf("get known threats: %v", err)
	}

	return resp.Campaigns.ByID.KnownThreats
}

func createEncounter(t *testing.T, c *client.Client, campaignID string, input map[string]any) encounterResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ CreateEncounter encounterResponse }
	}
	if err := c.Post(createEncounterMutation, &resp, client.Var("id", campaignID), client.Var("input", input)); err != nil {
		t.Fatalf("create encounter: %v", err)
	}

	return resp.Campaigns.CreateEncounter
}

func addEncounterMonsters(t *testing.T, c *client.Client, encounterID string, input map[string]any) encounterResponse {
	t.Helper()

	var resp struct {
		Campaigns struct{ AddEncounterMonsters encounterResponse }
	}
	if err := c.Post(addEncounterMonstersMutation, &resp, client.Var("encounterId", encounterID), client.Var("input", input)); err != nil {
		t.Fatalf("add encounter monsters: %v", err)
	}

	return resp.Campaigns.AddEncounterMonsters
}

func campaignEncounters(t *testing.T, c *client.Client, campaignID string) []encounterResponse {
	t.Helper()

	var resp struct {
		Campaigns struct {
			ByID struct{ Encounters []encounterResponse }
		}
	}
	if err := c.Post(campaignEncountersQuery, &resp, client.Var("id", campaignID)); err != nil {
		t.Fatalf("get encounters: %v", err)
	}

	return resp.Campaigns.ByID.Encounters
}

func runEncounter(t *testing.T, c *client.Client, encounterID string) []encounterMonsterInPlay {
	t.Helper()

	var resp struct {
		Campaigns struct{ RunEncounter []encounterMonsterInPlay }
	}
	if err := c.Post(runEncounterMutation, &resp, client.Var("encounterId", encounterID)); err != nil {
		t.Fatalf("run encounter: %v", err)
	}

	return resp.Campaigns.RunEncounter
}

func monstersWithEncounters(t *testing.T, c *client.Client, campaignID string) []encounterMonsterInPlay {
	t.Helper()

	var resp struct {
		Campaigns struct {
			ByID struct{ Monsters []encounterMonsterInPlay }
		}
	}
	if err := c.Post(campaignMonsterEncountersQuery, &resp, client.Var("id", campaignID)); err != nil {
		t.Fatalf("get monsters: %v", err)
	}

	return resp.Campaigns.ByID.Monsters
}

func portentTexts(portents []portentResponse) []string {
	texts := make([]string, len(portents))
	for i, p := range portents {
		texts[i] = p.Text
	}

	return texts
}

func portentInputs(texts ...string) []map[string]any {
	inputs := make([]map[string]any, len(texts))
	for i, text := range texts {
		inputs[i] = map[string]any{"text": text}
	}

	return inputs
}

func TestDangerTemplate(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	c := registered(t, h, "gm@example.com")

	var resp struct {
		DangerTemplate struct {
			Categories []struct {
				Key   string
				Name  string
				Types []struct{ Key, Name, Impulse string }
			}
			ImpendingDooms []struct{ Key, Name string }
		}
	}
	if err := c.Post(dangerTemplateQuery, &resp); err != nil {
		t.Fatalf("get danger template: %v", err)
	}

	if len(resp.DangerTemplate.Categories) != 5 || len(resp.DangerTemplate.ImpendingDooms) != 6 {
		t.Errorf("template = %d categories and %d dooms, want 5 and 6", len(resp.DangerTemplate.Categories), len(resp.DangerTemplate.ImpendingDooms))
	}
}

func TestCreateFront(t *testing.T) {
	t.Parallel()

	tb := newTable(t)

	createFront(t, tb.gm, tb.campaign.ID, map[string]any{
		"kind":   "ADVENTURE",
		"name":   "The White Gate",
		"stakes": []map[string]any{{"question": "Who will be the Champion?"}},
	})

	fronts := prep(t, tb.gm, tb.campaign.ID).Fronts
	if len(fronts) != 1 {
		t.Fatalf("fronts = %+v, want one", fronts)
	}
	f := fronts[0]
	if f.Name != "The White Gate" || f.Kind != "ADVENTURE" || f.Resolved {
		t.Errorf("front = %+v, want an unresolved adventure front named The White Gate", f)
	}
	if len(f.Stakes) != 1 || f.Stakes[0].Question != "Who will be the Champion?" || f.Stakes[0].Answer != "" {
		t.Errorf("stakes = %+v, want the question with an empty answer", f.Stakes)
	}
}

func TestInvalidFronts(t *testing.T) {
	t.Parallel()

	elevenStakes := make([]map[string]any, 11)
	for i := range elevenStakes {
		elevenStakes[i] = map[string]any{"question": "Who?"}
	}

	tests := []struct {
		name      string
		input     map[string]any
		wantField string
	}{
		{"blank name", map[string]any{"kind": "CAMPAIGN", "name": " "}, "name"},
		{"101-character name", map[string]any{"kind": "CAMPAIGN", "name": strings.Repeat("a", 101)}, "name"},
		{"11 stakes questions", map[string]any{"kind": "CAMPAIGN", "name": "F", "stakes": elevenStakes}, "stakes"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			tb := newTable(t)
			errs := postErrors(t, tb.gm, createFrontMutation, client.Var("id", tb.campaign.ID), client.Var("input", tt.input))
			wantValidationError(t, errs, tt.wantField)

			if got := prep(t, tb.gm, tb.campaign.ID).Fronts; len(got) != 0 {
				t.Errorf("fronts = %+v, want none saved", got)
			}
		})
	}
}

func TestAnswerAStakesQuestion(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	front := createFront(t, tb.gm, tb.campaign.ID, map[string]any{
		"kind": "ADVENTURE", "name": "The White Gate", "stakes": []map[string]any{{"question": "Who will be the Champion?"}},
	})

	var resp struct {
		Campaigns struct{ UpdateFront frontResponse }
	}
	err := tb.gm.Post(updateFrontMutation, &resp, client.Var("frontId", front.ID), client.Var("input", map[string]any{
		"kind": "ADVENTURE", "name": "The White Gate",
		"stakes": []map[string]any{{"question": "Who will be the Champion?", "answer": "Avon, against her will"}},
	}))
	if err != nil {
		t.Fatalf("update front: %v", err)
	}

	stakes := prep(t, tb.gm, tb.campaign.ID).Fronts[0].Stakes
	if len(stakes) != 1 || stakes[0].Answer != "Avon, against her will" {
		t.Errorf("stakes = %+v, want the answer saved", stakes)
	}
}

func TestUnresolvedFrontsComeFirst(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	resolved := createFront(t, tb.gm, tb.campaign.ID, map[string]any{"kind": "ADVENTURE", "name": "Old"})
	createFront(t, tb.gm, tb.campaign.ID, map[string]any{"kind": "ADVENTURE", "name": "New"})

	var resp struct {
		Campaigns struct{ SetFrontResolved struct{ Resolved bool } }
	}
	if err := tb.gm.Post(setFrontResolvedMutation, &resp, client.Var("frontId", resolved.ID), client.Var("resolved", true)); err != nil {
		t.Fatalf("resolve front: %v", err)
	}

	fronts := prep(t, tb.gm, tb.campaign.ID).Fronts
	if len(fronts) != 2 || fronts[0].Name != "New" || fronts[1].Name != "Old" || !fronts[1].Resolved {
		t.Errorf("fronts = %+v, want New then the resolved Old", fronts)
	}
}

func TestDeleteFrontDeletesItsDangers(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	front := createFront(t, tb.gm, tb.campaign.ID, map[string]any{"kind": "ADVENTURE", "name": "The White Gate"})
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"frontId": front.ID, "name": "The College", "portents": portentInputs("A", "B")})

	var resp struct{ Campaigns struct{ DeleteFront bool } }
	if err := tb.gm.Post(deleteFrontMutation, &resp, client.Var("frontId", front.ID)); err != nil {
		t.Fatalf("delete front: %v", err)
	}

	p := prep(t, tb.gm, tb.campaign.ID)
	if len(p.Fronts) != 0 || len(p.DangersWithoutFront) != 0 {
		t.Errorf("prep = %+v, want nothing left", p)
	}
	errs := messages(t, tb.gm, setPortentDoneMutation, map[string]any{"portentId": danger.Portents[0].ID, "done": true})
	wantNotFound(t, errs)
}

func TestPlayersCantSeeOrChangePrep(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	front := createFront(t, tb.gm, tb.campaign.ID, map[string]any{"kind": "ADVENTURE", "name": "F"})
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"frontId": front.ID, "name": "D", "portents": portentInputs("P")})
	encounter := createEncounter(t, tb.gm, tb.campaign.ID, map[string]any{"name": "E"})
	encounter = addEncounterMonsters(t, tb.gm, encounter.ID, map[string]any{"compendiumKey": "goblin"})
	frontInput := map[string]any{"kind": "ADVENTURE", "name": "X"}
	dangerInput := map[string]any{"name": "X"}
	encounterInput := map[string]any{"name": "X"}

	for name, call := range map[string]struct {
		query string
		vars  map[string]any
	}{
		"list fronts":            {campaignFrontsQuery, map[string]any{"id": tb.campaign.ID}},
		"list dangers":           {campaignDangersQuery, map[string]any{"id": tb.campaign.ID}},
		"list encounters":        {campaignEncountersQuery, map[string]any{"id": tb.campaign.ID}},
		"create front":           {createFrontMutation, map[string]any{"id": tb.campaign.ID, "input": frontInput}},
		"update front":           {updateFrontMutation, map[string]any{"frontId": front.ID, "input": frontInput}},
		"resolve front":          {setFrontResolvedMutation, map[string]any{"frontId": front.ID, "resolved": true}},
		"delete front":           {deleteFrontMutation, map[string]any{"frontId": front.ID}},
		"create danger":          {createDangerMutation, map[string]any{"id": tb.campaign.ID, "input": dangerInput}},
		"update danger":          {updateDangerMutation, map[string]any{"dangerId": danger.ID, "input": dangerInput}},
		"delete danger":          {deleteDangerMutation, map[string]any{"dangerId": danger.ID}},
		"check portent":          {setPortentDoneMutation, map[string]any{"portentId": danger.Portents[0].ID, "done": true}},
		"reveal danger":          {setDangerRevealedMutation, map[string]any{"dangerId": danger.ID, "revealed": true}},
		"reveal portent":         {setPortentRevealedMutation, map[string]any{"portentId": danger.Portents[0].ID, "revealed": true}},
		"create encounter":       {createEncounterMutation, map[string]any{"id": tb.campaign.ID, "input": encounterInput}},
		"update encounter":       {updateEncounterMutation, map[string]any{"encounterId": encounter.ID, "input": encounterInput}},
		"delete encounter":       {deleteEncounterMutation, map[string]any{"encounterId": encounter.ID}},
		"add encounter monsters": {addEncounterMonstersMutation, map[string]any{"encounterId": encounter.ID, "input": map[string]any{"compendiumKey": "ogre"}}},
		"set monster count":      {setEncounterMonsterCountMutation, map[string]any{"encounterMonsterId": encounter.Monsters[0].ID, "count": 3}},
		"remove monster":         {removeEncounterMonsterMutation, map[string]any{"encounterMonsterId": encounter.Monsters[0].ID}},
		"run encounter":          {runEncounterMutation, map[string]any{"encounterId": encounter.ID}},
	} {
		t.Run(name, func(t *testing.T) {
			errs := messages(t, tb.ana, call.query, call.vars)
			if len(errs) != 1 || !strings.Contains(errs[0], "only the campaign's GM") {
				t.Errorf("errors = %v, want one GM-only error", errs)
			}
		})
	}

	p := prep(t, tb.gm, tb.campaign.ID)
	if len(p.Fronts) != 1 || p.Fronts[0].Name != "F" || len(p.Fronts[0].Dangers) != 1 || p.Fronts[0].Dangers[0].Revealed {
		t.Errorf("prep = %+v, want it unchanged", p)
	}
}

func TestAnotherGMCantChangeThisCampaignsPrep(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	front := createFront(t, tb.gm, tb.campaign.ID, map[string]any{"kind": "ADVENTURE", "name": "F"})
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"frontId": front.ID, "name": "D"})

	other := registered(t, tb.h, "other-gm@example.com")
	createCampaign(t, other, "Elsewhere", "")

	wantNotFound(t, messages(t, other, updateDangerMutation, map[string]any{"dangerId": danger.ID, "input": map[string]any{"name": "X"}}))
	wantNotFound(t, messages(t, other, updateFrontMutation, map[string]any{"frontId": front.ID, "input": map[string]any{"kind": "CAMPAIGN", "name": "X"}}))

	f := prep(t, tb.gm, tb.campaign.ID).Fronts[0]
	if f.Name != "F" || f.Dangers[0].Name != "D" {
		t.Errorf("front = %+v, want it unchanged", f)
	}
}

func TestDangerLimitIsAHintOnly(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	front := createFront(t, tb.gm, tb.campaign.ID, map[string]any{"kind": "ADVENTURE", "name": "F"})
	for _, name := range []string{"A", "B", "C", "D"} {
		createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"frontId": front.ID, "name": name})
	}

	if got := prep(t, tb.gm, tb.campaign.ID).Fronts[0].Dangers; len(got) != 4 {
		t.Errorf("dangers = %d, want 4", len(got))
	}
}

func TestDangerWithoutAFront(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"name": "The Orc Horde"})

	p := prep(t, tb.gm, tb.campaign.ID)
	if len(p.DangersWithoutFront) != 1 || p.DangersWithoutFront[0].Name != "The Orc Horde" || p.DangersWithoutFront[0].FrontID != nil {
		t.Errorf("dangers without a front = %+v, want The Orc Horde", p.DangersWithoutFront)
	}
}

func TestMoveADangerToAnotherFront(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	adventure := createFront(t, tb.gm, tb.campaign.ID, map[string]any{"kind": "ADVENTURE", "name": "Hargrosh Pass"})
	campaign := createFront(t, tb.gm, tb.campaign.ID, map[string]any{"kind": "CAMPAIGN", "name": "Grishkar Rises"})
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"frontId": adventure.ID, "name": "The Orcs"})

	updateDanger(t, tb.gm, danger.ID, map[string]any{"frontId": campaign.ID, "name": "The Orcs"})

	for _, f := range prep(t, tb.gm, tb.campaign.ID).Fronts {
		want := 0
		if f.ID == campaign.ID {
			want = 1
		}
		if len(f.Dangers) != want {
			t.Errorf("%s has %d dangers, want %d", f.Name, len(f.Dangers), want)
		}
	}
}

func TestDangerInAnotherCampaignsFront(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	elsewhere := createCampaign(t, tb.gm, "Elsewhere", "")
	front := createFront(t, tb.gm, elsewhere.ID, map[string]any{"kind": "ADVENTURE", "name": "F"})

	errs := postErrors(t, tb.gm, createDangerMutation, client.Var("id", tb.campaign.ID), client.Var("input", map[string]any{"frontId": front.ID, "name": "D"}))
	wantValidationError(t, errs, "frontId")
}

func TestDangerCategory(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	cult := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"name": "The Eye", "type": "Cult"})
	bard := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"name": "Lute", "type": "Rival bard"})

	if cult.Category == nil || cult.Category.Name != "Ambitious Organizations" || !contains(cult.Category.Moves, "Negotiate a deal") {
		t.Errorf("Cult category = %+v, want Ambitious Organizations with its moves", cult.Category)
	}
	if bard.Category != nil {
		t.Errorf("Rival bard category = %+v, want null", bard.Category)
	}
}

func contains(list []string, s string) bool {
	for _, item := range list {
		if item == s {
			return true
		}
	}

	return false
}

func TestEditPortentsKeepsTheirState(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"name": "D", "portents": portentInputs("A", "B", "C")})
	a, b := danger.Portents[0], danger.Portents[1]
	setDangerRevealed(t, tb.gm, danger.ID, true)
	setPortent(t, tb.gm, setPortentDoneMutation, "done", b.ID, true)
	setPortent(t, tb.gm, setPortentRevealedMutation, "revealed", b.ID, true)

	got := updateDanger(t, tb.gm, danger.ID, map[string]any{"name": "D", "portents": []map[string]any{
		{"id": b.ID, "text": "B"}, {"text": "D"}, {"id": a.ID, "text": "A"},
	}})

	if diff := cmp.Diff([]string{"B", "D", "A"}, portentTexts(got.Portents)); diff != "" {
		t.Errorf("portents (-want +got):\n%s", diff)
	}
	if got.Portents[0].ID != b.ID || !got.Portents[0].Done || !got.Portents[0].Revealed {
		t.Errorf("B = %+v, want it still checked and revealed", got.Portents[0])
	}
	if got.Portents[2].Done || got.Portents[2].Revealed {
		t.Errorf("A = %+v, want it unchecked and hidden", got.Portents[2])
	}
}

func TestCheckAndUncheckAPortent(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"name": "D", "portents": portentInputs("A")})
	id := danger.Portents[0].ID

	if got := setPortent(t, tb.gm, setPortentDoneMutation, "done", id, true); !got.Portents[0].Done {
		t.Errorf("after checking, done = false, want true")
	}
	if got := setPortent(t, tb.gm, setPortentDoneMutation, "done", id, false); got.Portents[0].Done {
		t.Errorf("after unchecking, done = true, want false")
	}
	if got := campaignMessages(t, tb.gm, tb.campaign.ID).Messages; len(got) != 0 {
		t.Errorf("chat = %+v, want nothing", got)
	}
}

func TestInvalidPortents(t *testing.T) {
	t.Parallel()

	twentyOne := make([]string, 21)
	for i := range twentyOne {
		twentyOne[i] = "P"
	}

	for name, portents := range map[string][]map[string]any{
		"21 portents":     portentInputs(twentyOne...),
		"a blank portent": portentInputs(" "),
	} {
		t.Run(name, func(t *testing.T) {
			t.Parallel()

			tb := newTable(t)
			errs := postErrors(t, tb.gm, createDangerMutation, client.Var("id", tb.campaign.ID), client.Var("input", map[string]any{"name": "D", "portents": portents}))
			wantValidationError(t, errs, "portents")
		})
	}
}

func TestRevealADanger(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{
		"name": "The College of Arcanists", "type": "Ambitious organization", "impulse": "to grow",
		"impendingDoom": "Usurpation", "notes": "Secret", "portents": portentInputs("Expedition sent"),
	})

	setDangerRevealed(t, tb.gm, danger.ID, true)

	want := []knownThreatResponse{{DangerID: danger.ID, Name: "The College of Arcanists", Type: "Ambitious organization", Portents: []string{}}}
	if diff := cmp.Diff(want, knownThreats(t, tb.ana, tb.campaign.ID)); diff != "" {
		t.Errorf("known threats (-want +got):\n%s", diff)
	}
	if diff := cmp.Diff([]string{"The GM revealed a danger: The College of Arcanists"}, bodies(campaignMessages(t, tb.ana, tb.campaign.ID), "ACTIVITY")); diff != "" {
		t.Errorf("activity (-want +got):\n%s", diff)
	}
}

func TestRevealAPortent(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{
		"name": "The College of Arcanists", "portents": portentInputs("Expedition sent", "The Key is discovered"),
	})
	setDangerRevealed(t, tb.gm, danger.ID, true)

	setPortent(t, tb.gm, setPortentRevealedMutation, "revealed", danger.Portents[0].ID, true)

	threats := knownThreats(t, tb.ana, tb.campaign.ID)
	if len(threats) != 1 {
		t.Fatalf("known threats = %+v, want one", threats)
	}
	if diff := cmp.Diff([]string{"Expedition sent"}, threats[0].Portents); diff != "" {
		t.Errorf("portents (-want +got):\n%s", diff)
	}
	activity := bodies(campaignMessages(t, tb.ana, tb.campaign.ID), "ACTIVITY")
	if !contains(activity, "The GM revealed a grim portent of The College of Arcanists: Expedition sent") {
		t.Errorf("activity = %v, want the portent's reveal", activity)
	}
}

func TestCantRevealAPortentOfAHiddenDanger(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"name": "D", "portents": portentInputs("P")})

	errs := postErrors(t, tb.gm, setPortentRevealedMutation, client.Var("portentId", danger.Portents[0].ID), client.Var("revealed", true))
	wantValidationError(t, errs, "portentId")

	if got := campaignMessages(t, tb.gm, tb.campaign.ID).Messages; len(got) != 0 {
		t.Errorf("chat = %+v, want nothing", got)
	}
}

func TestHideADanger(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"name": "D"})
	setDangerRevealed(t, tb.gm, danger.ID, true)

	setDangerRevealed(t, tb.gm, danger.ID, false)

	if got := knownThreats(t, tb.ana, tb.campaign.ID); len(got) != 0 {
		t.Errorf("known threats = %+v, want none", got)
	}
	if got := campaignMessages(t, tb.gm, tb.campaign.ID).Messages; len(got) != 1 {
		t.Errorf("chat = %+v, want only the reveal", got)
	}
}

func TestCreateEncounterWithoutADanger(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	encounter := createEncounter(t, tb.gm, tb.campaign.ID, map[string]any{"name": "Goblin ambush"})
	addEncounterMonsters(t, tb.gm, encounter.ID, map[string]any{"compendiumKey": "goblin", "count": 2})

	got := campaignEncounters(t, tb.gm, tb.campaign.ID)
	if len(got) != 1 || got[0].Name != "Goblin ambush" || got[0].Danger != nil || got[0].Location != "" {
		t.Fatalf("encounters = %+v, want Goblin ambush with no danger or location", got)
	}
	if m := got[0].Monsters; len(m) != 1 || m[0].Count != 2 || m[0].StatBlock.Name != "Goblin" {
		t.Errorf("monsters = %+v, want one entry of 2 goblins", m)
	}
}

func TestEncounterWithAnotherCampaignsDanger(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	elsewhere := createCampaign(t, tb.gm, "Elsewhere", "")
	danger := createDanger(t, tb.gm, elsewhere.ID, map[string]any{"name": "D"})

	errs := postErrors(t, tb.gm, createEncounterMutation, client.Var("id", tb.campaign.ID), client.Var("input", map[string]any{"name": "E", "dangerId": danger.ID}))
	wantValidationError(t, errs, "dangerId")
}

func TestRunEncounter(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	encounter := createEncounter(t, tb.gm, tb.campaign.ID, map[string]any{"name": "Ambush"})
	addEncounterMonsters(t, tb.gm, encounter.ID, map[string]any{"compendiumKey": "goblin", "count": 2})
	addEncounterMonsters(t, tb.gm, encounter.ID, map[string]any{"compendiumKey": "ogre"})

	added := runEncounter(t, tb.gm, encounter.ID)

	var names []string
	for _, m := range added {
		names = append(names, m.Name)
		if m.HP != m.MaxHP || m.EncounterID == nil || *m.EncounterID != encounter.ID {
			t.Errorf("%+v, want full HP and the encounter", m)
		}
	}
	if diff := cmp.Diff([]string{"Goblin 1", "Goblin 2", "Ogre"}, names); diff != "" {
		t.Errorf("names (-want +got):\n%s", diff)
	}
	if got := campaignMessages(t, tb.gm, tb.campaign.ID).Messages; len(got) != 0 {
		t.Errorf("chat = %+v, want nothing", got)
	}

	var again []string
	for _, m := range runEncounter(t, tb.gm, encounter.ID) {
		again = append(again, m.Name)
	}
	if diff := cmp.Diff([]string{"Goblin 3", "Goblin 4", "Ogre 2"}, again); diff != "" {
		t.Errorf("second run (-want +got):\n%s", diff)
	}
}

func TestEncounterMonsterWithoutHPNeedsMaxHP(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	encounter := createEncounter(t, tb.gm, tb.campaign.ID, map[string]any{"name": "Market"})

	errs := postErrors(t, tb.gm, addEncounterMonstersMutation, client.Var("encounterId", encounter.ID), client.Var("input", map[string]any{"compendiumKey": "merchant"}))
	wantValidationError(t, errs, "maxHp")
}

func TestEncounterMonsterCount(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	encounter := createEncounter(t, tb.gm, tb.campaign.ID, map[string]any{"name": "Ambush"})
	encounter = addEncounterMonsters(t, tb.gm, encounter.ID, map[string]any{"compendiumKey": "goblin", "count": 2})
	entry := encounter.Monsters[0].ID

	var resp struct {
		Campaigns struct{ SetEncounterMonsterCount encounterResponse }
	}
	if err := tb.gm.Post(setEncounterMonsterCountMutation, &resp, client.Var("encounterMonsterId", entry), client.Var("count", 5)); err != nil {
		t.Fatalf("set count: %v", err)
	}
	if got := resp.Campaigns.SetEncounterMonsterCount.Monsters[0].Count; got != 5 {
		t.Errorf("count = %d, want 5", got)
	}

	errs := postErrors(t, tb.gm, setEncounterMonsterCountMutation, client.Var("encounterMonsterId", entry), client.Var("count", 21))
	wantValidationError(t, errs, "count")

	var removed struct {
		Campaigns struct{ RemoveEncounterMonster encounterResponse }
	}
	if err := tb.gm.Post(removeEncounterMonsterMutation, &removed, client.Var("encounterMonsterId", entry)); err != nil {
		t.Fatalf("remove entry: %v", err)
	}
	if got := removed.Campaigns.RemoveEncounterMonster.Monsters; len(got) != 0 {
		t.Errorf("monsters = %+v, want none", got)
	}
}

func TestEncounterKeepsDeletedCustomMonster(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	custom := createCustomMonster(t, tb.gm, map[string]any{"name": "Bog Hag", "hp": 12})
	encounter := createEncounter(t, tb.gm, tb.campaign.ID, map[string]any{"name": "Swamp"})
	addEncounterMonsters(t, tb.gm, encounter.ID, map[string]any{"customMonsterId": custom.ID})

	var resp struct{ Monsters struct{ DeleteCustom bool } }
	if err := tb.gm.Post(deleteCustomMonsterMutation, &resp, client.Var("id", custom.ID)); err != nil {
		t.Fatalf("delete custom monster: %v", err)
	}

	got := campaignEncounters(t, tb.gm, tb.campaign.ID)[0].Monsters
	if len(got) != 1 || got[0].StatBlock.Name != "Bog Hag" || got[0].MaxHP != 12 {
		t.Errorf("monsters = %+v, want the Bog Hag kept", got)
	}
}

func TestDeleteEncounterKeepsItsMonstersInPlay(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	encounter := createEncounter(t, tb.gm, tb.campaign.ID, map[string]any{"name": "Ambush"})
	addEncounterMonsters(t, tb.gm, encounter.ID, map[string]any{"compendiumKey": "ogre"})
	runEncounter(t, tb.gm, encounter.ID)

	var resp struct {
		Campaigns struct{ DeleteEncounter bool }
	}
	if err := tb.gm.Post(deleteEncounterMutation, &resp, client.Var("encounterId", encounter.ID)); err != nil {
		t.Fatalf("delete encounter: %v", err)
	}

	got := monstersWithEncounters(t, tb.gm, tb.campaign.ID)
	if len(got) != 1 || got[0].Name != "Ogre" || got[0].EncounterID != nil {
		t.Errorf("in play = %+v, want the Ogre with no encounter", got)
	}
}

func TestDeleteDangerUnlinksItsEncounters(t *testing.T) {
	t.Parallel()

	tb := newTable(t)
	danger := createDanger(t, tb.gm, tb.campaign.ID, map[string]any{"name": "The Orcs"})
	createEncounter(t, tb.gm, tb.campaign.ID, map[string]any{"name": "Raid", "dangerId": danger.ID})

	var resp struct{ Campaigns struct{ DeleteDanger bool } }
	if err := tb.gm.Post(deleteDangerMutation, &resp, client.Var("dangerId", danger.ID)); err != nil {
		t.Fatalf("delete danger: %v", err)
	}

	got := campaignEncounters(t, tb.gm, tb.campaign.ID)
	if len(got) != 1 || got[0].Name != "Raid" || got[0].Danger != nil {
		t.Errorf("encounters = %+v, want Raid with no danger", got)
	}
}
