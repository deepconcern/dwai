package models_test

import (
	"slices"
	"strings"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/models"
)

func loadSpells(t *testing.T) *models.SpellMap {
	t.Helper()

	spells, err := models.LoadSpells()
	if err != nil {
		t.Fatalf("LoadSpells: %v", err)
	}
	return spells
}

func TestLoadSpells(t *testing.T) {
	spells := loadSpells(t)
	schools := []string{"divination", "enchantment", "evocation", "illusion", "ongoing", "summoning"}

	for _, class := range []string{"cleric", "wizard"} {
		list := (*spells)[class]
		if len(list) < 30 {
			t.Errorf("%s: only %d spells", class, len(list))
		}

		seen := map[string]bool{}
		levels := map[int32]int{}
		for _, s := range list {
			if s.Key == "" || s.Name == "" || s.Description == "" {
				t.Errorf("%s: incomplete spell %+v", class, s)
			}
			if seen[s.Key] {
				t.Errorf("%s: duplicate key %s", class, s.Key)
			}
			seen[s.Key] = true
			levels[s.Level]++

			// Level and tags used to be packed into names.
			for _, word := range []string{"Level", "Cantrip", "Rote", "Ongoing"} {
				if strings.Contains(s.Name, word) {
					t.Errorf("%s: name %q still contains %q", class, s.Name, word)
				}
			}
			for _, tag := range s.Tags {
				if !slices.Contains(schools, tag) {
					t.Errorf("%s: %s has unknown tag %q", class, s.Key, tag)
				}
			}
		}

		for _, level := range []int32{0, 1, 3, 5, 7, 9} {
			if levels[level] == 0 {
				t.Errorf("%s: no level %d spells", class, level)
			}
		}
		if !slices.IsSortedFunc(list, func(a, b *models.SpellModel) int { return int(a.Level - b.Level) }) {
			t.Errorf("%s: spells aren't sorted by level", class)
		}
	}

	if fireball := spells.Find("wizard", "fireball"); fireball == nil || fireball.Level != 3 || !slices.Equal(fireball.Tags, []string{"evocation"}) {
		t.Errorf("fireball = %+v", fireball)
	}
	if poly := spells.Find("wizard", "polymorph"); poly == nil || len(poly.Options) != 3 {
		t.Errorf("polymorph = %+v, want 3 options", poly)
	}
}

func TestSpellcasterHelpers(t *testing.T) {
	spells := loadSpells(t)

	if !spells.IsSpellcaster("wizard") || !spells.IsSpellcaster("cleric") || spells.IsSpellcaster("fighter") {
		t.Error("IsSpellcaster is wrong for wizard, cleric, or fighter")
	}
	if !models.UsesSpellbook("wizard") || models.UsesSpellbook("cleric") {
		t.Error("only Wizards use a spellbook")
	}
	if got := models.ExpectedSpellbookSize(1); got != 3 {
		t.Errorf("ExpectedSpellbookSize(1) = %d, want 3", got)
	}
	if got := models.ExpectedSpellbookSize(4); got != 6 {
		t.Errorf("ExpectedSpellbookSize(4) = %d, want 6", got)
	}
	if got := models.MaxPreparedSpellLevels(3); got != 4 {
		t.Errorf("MaxPreparedSpellLevels(3) = %d, want 4", got)
	}
	if got := models.PreparedSpellLevels(spells.SpellsByKey("wizard", []string{"magic_missile", "fireball", "light"})); got != 4 {
		t.Errorf("PreparedSpellLevels = %d, want 4", got)
	}
}

func TestValidateAddToSpellbook(t *testing.T) {
	spells := loadSpells(t)

	for _, tc := range []struct {
		name      string
		class     string
		level     int32
		spellbook []string
		spell     string
		wantErr   bool
	}{
		{name: "level 1 spell", class: "wizard", level: 1, spell: "magic_missile"},
		{name: "spell of the character's level", class: "wizard", level: 3, spell: "fireball"},
		{name: "above the character's level", class: "wizard", level: 2, spell: "fireball", wantErr: true},
		{name: "cantrip", class: "wizard", level: 1, spell: "light", wantErr: true},
		{name: "already there", class: "wizard", level: 1, spellbook: []string{"magic_missile"}, spell: "magic_missile", wantErr: true},
		{name: "unknown spell", class: "wizard", level: 1, spell: "nope", wantErr: true},
		{name: "cleric spell", class: "wizard", level: 1, spell: "bless", wantErr: true},
		{name: "not a wizard", class: "cleric", level: 1, spell: "bless", wantErr: true},
	} {
		err := models.ValidateAddToSpellbook(spells, tc.class, tc.level, tc.spellbook, tc.spell)
		if (err != nil) != tc.wantErr {
			t.Errorf("%s: err = %v, want error %v", tc.name, err, tc.wantErr)
		}
	}
}

func TestValidatePreparedSpells(t *testing.T) {
	spells := loadSpells(t)
	book := []string{"magic_missile", "charm_person", "alarm", "fireball"}

	for _, tc := range []struct {
		name   string
		class  string
		level  int32
		spells []string
		want   int
	}{
		{name: "wizard: within level + 1", class: "wizard", level: 1, spells: []string{"magic_missile", "charm_person"}},
		{name: "wizard: nothing prepared", class: "wizard", level: 1, spells: []string{}},
		{name: "wizard: over level + 1", class: "wizard", level: 1, spells: []string{"magic_missile", "charm_person", "alarm"}, want: 1},
		{name: "wizard: not in the spellbook", class: "wizard", level: 3, spells: []string{"sleep"}, want: 1},
		{name: "wizard: cantrip listed", class: "wizard", level: 1, spells: []string{"light"}, want: 1},
		{name: "wizard: listed twice", class: "wizard", level: 3, spells: []string{"alarm", "alarm"}, want: 1},
		{name: "cleric: any cleric spell up to their level", class: "cleric", level: 3, spells: []string{"bless", "animate_dead"}},
		{name: "cleric: above their level", class: "cleric", level: 2, spells: []string{"animate_dead"}, want: 1},
		{name: "cleric: over level + 1", class: "cleric", level: 1, spells: []string{"bless", "sanctuary", "cause_fear"}, want: 1},
		{name: "cleric: wizard spell", class: "cleric", level: 1, spells: []string{"magic_missile"}, want: 1},
		{name: "not a spellcaster", class: "fighter", level: 1, spells: []string{}, want: 1},
		{name: "several problems", class: "wizard", level: 1, spells: []string{"nope", "light", "sleep"}, want: 3},
	} {
		errs := models.ValidatePreparedSpells(spells, tc.class, tc.level, book, tc.spells)
		if len(errs) != tc.want {
			t.Errorf("%s: %d errors %v, want %d", tc.name, len(errs), errs, tc.want)
		}
	}
}
