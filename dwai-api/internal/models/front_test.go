package models_test

import (
	"strings"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
)

func loadDangerTemplate(t *testing.T) *models.DangerTemplate {
	t.Helper()

	template, err := models.LoadDangerTemplate()
	if err != nil {
		t.Fatalf("LoadDangerTemplate: %v", err)
	}

	return template
}

func TestLoadDangerTemplate(t *testing.T) {
	t.Parallel()

	template := loadDangerTemplate(t)

	t.Run("has five categories whose types all have a unique key and an impulse", func(t *testing.T) {
		t.Parallel()

		if got := len(template.Categories()); got != 5 {
			t.Fatalf("categories = %d, want 5", got)
		}
		seen := map[string]bool{}
		for _, c := range template.Categories() {
			for _, typ := range c.Types {
				if typ.Key == "" || typ.Impulse == "" {
					t.Errorf("%s: type %q has no key or impulse", c.Name, typ.Name)
				}
				if seen[typ.Key] {
					t.Errorf("key %q repeats", typ.Key)
				}
				seen[typ.Key] = true
			}
		}
	})

	t.Run("has the six kinds of impending doom", func(t *testing.T) {
		t.Parallel()

		var names []string
		for _, d := range template.ImpendingDooms() {
			names = append(names, d.Name)
		}
		want := []string{"Tyranny", "Pestilence", "Destruction", "Usurpation", "Impoverishment", "Rampant Chaos"}
		if diff := cmp.Diff(want, names); diff != "" {
			t.Errorf("dooms (-want +got):\n%s", diff)
		}
	})

	t.Run("a cult's impulse is to infest from within, in Ambitious Organizations", func(t *testing.T) {
		t.Parallel()

		category := template.CategoryOf("Cult")
		if category == nil || category.Name != "Ambitious Organizations" {
			t.Fatalf("CategoryOf(Cult) = %v, want Ambitious Organizations", category)
		}
		var impulse string
		for _, typ := range category.Types {
			if typ.Key == "cult" {
				impulse = typ.Impulse
			}
		}
		if impulse != "to infest from within" {
			t.Errorf("impulse = %q, want %q", impulse, "to infest from within")
		}
	})
}

func TestDangerTemplateCategoryOf(t *testing.T) {
	t.Parallel()

	template := loadDangerTemplate(t)

	tests := []struct {
		name     string
		typ      string
		wantName string
	}{
		{"a template type", "Dragon", "Arcane Enemies"},
		{"ignores case and spaces", "  dark portal ", "Cursed Places"},
		{"a type the GM made up", "Rival bard", ""},
		{"no type", "", ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var got string
			if c := template.CategoryOf(tt.typ); c != nil {
				got = c.Name
			}
			if got != tt.wantName {
				t.Errorf("CategoryOf(%q) = %q, want %q", tt.typ, got, tt.wantName)
			}
		})
	}
}

func TestValidateFrontInput(t *testing.T) {
	t.Parallel()

	tenStakes := make([]models.Stake, 10)
	for i := range tenStakes {
		tenStakes[i] = models.Stake{Question: "Who?"}
	}

	tests := []struct {
		name       string
		input      models.FrontInput
		want       models.FrontInput
		wantFields []string
	}{
		{
			"valid, trimmed",
			models.FrontInput{Name: " The White Gate ", Notes: " Cold. ", Stakes: []models.Stake{{Question: " Who will be the Champion? ", Answer: " Avon "}}},
			models.FrontInput{Name: "The White Gate", Notes: "Cold.", Stakes: []models.Stake{{Question: "Who will be the Champion?", Answer: "Avon"}}},
			nil,
		},
		{"blank name", models.FrontInput{Name: "  "}, models.FrontInput{Stakes: []models.Stake{}}, []string{"name"}},
		{"long name", models.FrontInput{Name: strings.Repeat("a", 101)}, models.FrontInput{Name: strings.Repeat("a", 101), Stakes: []models.Stake{}}, []string{"name"}},
		{"long notes", models.FrontInput{Name: "F", Notes: strings.Repeat("a", 5001)}, models.FrontInput{Name: "F", Notes: strings.Repeat("a", 5001), Stakes: []models.Stake{}}, []string{"notes"}},
		{"ten stakes", models.FrontInput{Name: "F", Stakes: tenStakes}, models.FrontInput{Name: "F", Stakes: tenStakes}, nil},
		{"eleven stakes", models.FrontInput{Name: "F", Stakes: append(tenStakes, models.Stake{Question: "Why?"})}, models.FrontInput{Name: "F", Stakes: append(tenStakes, models.Stake{Question: "Why?"})}, []string{"stakes"}},
		{"blank question", models.FrontInput{Name: "F", Stakes: []models.Stake{{Question: " "}}}, models.FrontInput{Name: "F", Stakes: []models.Stake{{}}}, []string{"stakes"}},
		{"long answer", models.FrontInput{Name: "F", Stakes: []models.Stake{{Question: "Q", Answer: strings.Repeat("a", 1001)}}}, models.FrontInput{Name: "F", Stakes: []models.Stake{{Question: "Q", Answer: strings.Repeat("a", 1001)}}}, []string{"stakes"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, errs := models.ValidateFrontInput(tt.input)
			if diff := cmp.Diff(tt.want, got, cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("input (-want +got):\n%s", diff)
			}
			if diff := cmp.Diff(tt.wantFields, fields(errs), cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("error fields (-want +got):\n%s", diff)
			}
		})
	}
}

func TestValidateDangerInput(t *testing.T) {
	t.Parallel()

	portents := func(n int) []models.PortentInput {
		list := make([]models.PortentInput, n)
		for i := range list {
			list[i] = models.PortentInput{Text: "Something happens"}
		}
		return list
	}

	tests := []struct {
		name       string
		input      models.DangerInput
		want       models.DangerInput
		wantFields []string
	}{
		{
			"valid, trimmed",
			models.DangerInput{Name: " The College ", Type: " Cabal ", Impulse: " to grow ", ImpendingDoom: " Usurpation ", Notes: " Wizards. ", Portents: []models.PortentInput{{ID: "a", Text: " Expedition sent "}}},
			models.DangerInput{Name: "The College", Type: "Cabal", Impulse: "to grow", ImpendingDoom: "Usurpation", Notes: "Wizards.", Portents: []models.PortentInput{{ID: "a", Text: "Expedition sent"}}},
			nil,
		},
		{"only a name", models.DangerInput{Name: "Orcs"}, models.DangerInput{Name: "Orcs"}, nil},
		{"blank name", models.DangerInput{Name: " "}, models.DangerInput{}, []string{"name"}},
		{"long type", models.DangerInput{Name: "D", Type: strings.Repeat("a", 101)}, models.DangerInput{Name: "D", Type: strings.Repeat("a", 101)}, []string{"type"}},
		{"long impulse", models.DangerInput{Name: "D", Impulse: strings.Repeat("a", 201)}, models.DangerInput{Name: "D", Impulse: strings.Repeat("a", 201)}, []string{"impulse"}},
		{"long doom", models.DangerInput{Name: "D", ImpendingDoom: strings.Repeat("a", 201)}, models.DangerInput{Name: "D", ImpendingDoom: strings.Repeat("a", 201)}, []string{"impendingDoom"}},
		{"long notes", models.DangerInput{Name: "D", Notes: strings.Repeat("a", 2001)}, models.DangerInput{Name: "D", Notes: strings.Repeat("a", 2001)}, []string{"notes"}},
		{"twenty portents", models.DangerInput{Name: "D", Portents: portents(20)}, models.DangerInput{Name: "D", Portents: portents(20)}, nil},
		{"twenty-one portents", models.DangerInput{Name: "D", Portents: portents(21)}, models.DangerInput{Name: "D", Portents: portents(21)}, []string{"portents"}},
		{"blank portent", models.DangerInput{Name: "D", Portents: []models.PortentInput{{Text: " "}}}, models.DangerInput{Name: "D", Portents: []models.PortentInput{{}}}, []string{"portents"}},
		{"long portent", models.DangerInput{Name: "D", Portents: []models.PortentInput{{Text: strings.Repeat("a", 201)}}}, models.DangerInput{Name: "D", Portents: []models.PortentInput{{Text: strings.Repeat("a", 201)}}}, []string{"portents"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, errs := models.ValidateDangerInput(tt.input)
			if diff := cmp.Diff(tt.want, got, cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("input (-want +got):\n%s", diff)
			}
			if diff := cmp.Diff(tt.wantFields, fields(errs), cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("error fields (-want +got):\n%s", diff)
			}
		})
	}
}

func TestValidateEncounterInput(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		input      models.EncounterInput
		want       models.EncounterInput
		wantFields []string
	}{
		{"valid, trimmed", models.EncounterInput{Name: " Goblin ambush ", Location: " The pass ", Notes: " At dusk. "}, models.EncounterInput{Name: "Goblin ambush", Location: "The pass", Notes: "At dusk."}, nil},
		{"only a name", models.EncounterInput{Name: "Ambush"}, models.EncounterInput{Name: "Ambush"}, nil},
		{"blank name", models.EncounterInput{Name: ""}, models.EncounterInput{}, []string{"name"}},
		{"long location", models.EncounterInput{Name: "E", Location: strings.Repeat("a", 101)}, models.EncounterInput{Name: "E", Location: strings.Repeat("a", 101)}, []string{"location"}},
		{"long notes", models.EncounterInput{Name: "E", Notes: strings.Repeat("a", 2001)}, models.EncounterInput{Name: "E", Notes: strings.Repeat("a", 2001)}, []string{"notes"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, errs := models.ValidateEncounterInput(tt.input)
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("input (-want +got):\n%s", diff)
			}
			if diff := cmp.Diff(tt.wantFields, fields(errs), cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("error fields (-want +got):\n%s", diff)
			}
		})
	}
}

func TestPlanPortents(t *testing.T) {
	t.Parallel()

	t.Run("keeps listed portents in their new order, adds new ones, and removes the rest", func(t *testing.T) {
		t.Parallel()

		plan, err := models.PlanPortents([]string{"a", "b", "c"}, []models.PortentInput{{ID: "b", Text: "B"}, {Text: "D"}, {ID: "a", Text: "A"}})
		if err != nil {
			t.Fatalf("PlanPortents: %v", err)
		}

		want := models.PortentPlan{
			Add:    []models.PlannedPortent{{Position: 1, Text: "D"}},
			Keep:   []models.PlannedPortent{{ID: "b", Position: 0, Text: "B"}, {ID: "a", Position: 2, Text: "A"}},
			Remove: []string{"c"},
		}
		if diff := cmp.Diff(want, plan, cmpopts.EquateEmpty()); diff != "" {
			t.Errorf("plan (-want +got):\n%s", diff)
		}
	})

	t.Run("refuses a portent of another danger", func(t *testing.T) {
		t.Parallel()

		if _, err := models.PlanPortents([]string{"a"}, []models.PortentInput{{ID: "z", Text: "Z"}}); err == nil {
			t.Error("err = nil, want an error")
		}
	})

	t.Run("refuses a portent listed twice", func(t *testing.T) {
		t.Parallel()

		if _, err := models.PlanPortents([]string{"a"}, []models.PortentInput{{ID: "a", Text: "A"}, {ID: "a", Text: "A"}}); err == nil {
			t.Error("err = nil, want an error")
		}
	})
}
