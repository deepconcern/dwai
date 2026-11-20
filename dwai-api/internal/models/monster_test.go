package models_test

import (
	"slices"
	"strings"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
)

func loadCompendium(t *testing.T) *models.MonsterCompendium {
	t.Helper()

	compendium, err := models.LoadMonsters()
	if err != nil {
		t.Fatalf("LoadMonsters: %v", err)
	}

	return compendium
}

func TestLoadMonsters(t *testing.T) {
	t.Parallel()

	compendium := loadCompendium(t)

	t.Run("every monster has a unique key and a damage expression that parses", func(t *testing.T) {
		t.Parallel()

		seen := map[string]bool{}
		for _, m := range compendium.All() {
			if m.Key == "" {
				t.Errorf("%s has no key", m.Name)
			}
			if seen[m.Key] {
				t.Errorf("key %q repeats", m.Key)
			}
			seen[m.Key] = true
			if m.Attack != nil {
				if err := models.ValidateDamageExpression(m.Attack.Damage); err != nil {
					t.Errorf("%s: damage %q: %v", m.Name, m.Attack.Damage, err)
				}
			}
		}
	})

	t.Run("lists all 154 monsters sorted by setting then name", func(t *testing.T) {
		t.Parallel()

		all := compendium.All()
		if len(all) != 154 {
			t.Fatalf("len = %d, want 154", len(all))
		}
		sorted := slices.IsSortedFunc(all, func(a, b *models.CompendiumMonster) int {
			if c := strings.Compare(compendium.Setting(a.SettingKey).Name, compendium.Setting(b.SettingKey).Name); c != 0 {
				return c
			}
			return strings.Compare(a.Name, b.Name)
		})
		if !sorted {
			t.Error("not sorted by setting name, then monster name")
		}
	})

	t.Run("splits the Cave Rat's attack", func(t *testing.T) {
		t.Parallel()

		rat := compendium.Find("cave_rat")
		if rat == nil {
			t.Fatal("cave_rat not found")
		}
		if rat.SettingKey != "caverns" {
			t.Errorf("setting = %q, want caverns", rat.SettingKey)
		}
		want := &models.MonsterAttack{Damage: "d6", Name: "Gnaw", Piercing: 1, Tags: []string{"Close", "Messy"}}
		if diff := cmp.Diff(want, rat.Attack); diff != "" {
			t.Errorf("attack (-want +got):\n%s", diff)
		}
	})

	t.Run("leaves the Merchant without stats", func(t *testing.T) {
		t.Parallel()

		merchant := compendium.Find("merchant")
		if merchant == nil {
			t.Fatal("merchant not found")
		}
		if merchant.HP != nil || merchant.Armor != nil || merchant.Attack != nil {
			t.Errorf("HP, armor, attack = %v, %v, %v; want all nil", merchant.HP, merchant.Armor, merchant.Attack)
		}
	})
}

func TestValidateDamageExpression(t *testing.T) {
	t.Parallel()

	for _, expr := range []string{"d8", "2d6+1", "b[2d10]", "w[2d8]-2", "d6-2", "b[2d12]+9"} {
		t.Run("accepts "+expr, func(t *testing.T) {
			t.Parallel()

			if err := models.ValidateDamageExpression(expr); err != nil {
				t.Errorf("ValidateDamageExpression(%q) = %v, want nil", expr, err)
			}
		})
	}

	for _, expr := range []string{"2d7", "d8+", "11d6", "", "-d6"} {
		t.Run("rejects "+expr, func(t *testing.T) {
			t.Parallel()

			if err := models.ValidateDamageExpression(expr); err == nil {
				t.Errorf("ValidateDamageExpression(%q) = nil, want an error", expr)
			}
		})
	}
}

func TestValidateMonster(t *testing.T) {
	t.Parallel()

	bogHag := models.MonsterStatBlock{
		Armor:  ptr[int32](1),
		Attack: &models.MonsterAttack{Damage: "d8+1", Name: "Claw"},
		HP:     ptr[int32](12),
		Name:   "Bog Hag",
	}

	tests := []struct {
		name       string
		input      models.MonsterStatBlock
		want       models.MonsterStatBlock
		wantFields []string
	}{
		{"a full stat block", bogHag, bogHag, nil},
		{"only a name", models.MonsterStatBlock{Name: " Peasant "}, models.MonsterStatBlock{Name: "Peasant"}, nil},
		{"blank name", models.MonsterStatBlock{Name: "  "}, models.MonsterStatBlock{}, []string{"name"}},
		{"HP 0", models.MonsterStatBlock{Name: "x", HP: ptr[int32](0)}, models.MonsterStatBlock{Name: "x", HP: ptr[int32](0)}, []string{"hp"}},
		{"armor 11", models.MonsterStatBlock{Name: "x", Armor: ptr[int32](11)}, models.MonsterStatBlock{Name: "x", Armor: ptr[int32](11)}, []string{"armor"}},
		{
			"damage 2d7",
			models.MonsterStatBlock{Name: "x", Attack: &models.MonsterAttack{Damage: "2d7", Name: "Bite"}},
			models.MonsterStatBlock{Name: "x", Attack: &models.MonsterAttack{Damage: "2d7", Name: "Bite"}},
			[]string{"attack.damage"},
		},
		{
			"21 moves",
			models.MonsterStatBlock{Name: "x", Moves: slices.Repeat([]string{"Lurk"}, 21)},
			models.MonsterStatBlock{Name: "x", Moves: slices.Repeat([]string{"Lurk"}, 21)},
			[]string{"moves"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, errs := models.ValidateMonster(tt.input)
			if diff := cmp.Diff(tt.want, got, cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("stat block (-want +got):\n%s", diff)
			}
			if diff := cmp.Diff(tt.wantFields, fields(errs), cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("error fields (-want +got):\n%s", diff)
			}
		})
	}
}

func TestNextMonsterNames(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		base     string
		count    int
		existing []string
		want     []string
	}{
		{"one keeps the name", "Ogre", 1, nil, []string{"Ogre"}},
		{"several are numbered from 1", "Goblin", 4, nil, []string{"Goblin 1", "Goblin 2", "Goblin 3", "Goblin 4"}},
		{"numbering continues after the highest in play", "Goblin", 2, []string{"Goblin 1", "Goblin 4", "Ogre"}, []string{"Goblin 5", "Goblin 6"}},
		{"an unnumbered one in play counts as 1", "Ogre", 1, []string{"Ogre"}, []string{"Ogre 2"}},
		{"other names don't count", "Goblin", 1, []string{"Goblin Chief 3"}, []string{"Goblin"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := models.NextMonsterNames(tt.base, tt.count, tt.existing)
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("names (-want +got):\n%s", diff)
			}
		})
	}
}
