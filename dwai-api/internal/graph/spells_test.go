//go:build integration

package graph_test

import (
	"slices"
	"testing"

	"github.com/99designs/gqlgen/client"
	"github.com/deepconcern/dwai/dwai-api/internal/models/modelstest"
)

const spellsByClassQuery = `
query ($classKey: ID!) {
	spells { byClass(classKey: $classKey) { key level name tags options description } }
}`

const addToSpellbookMutation = `
mutation ($characterId: ID!, $spellKey: ID!) {
	spells { addToSpellbook(characterId: $characterId, spellKey: $spellKey) { ...CharacterFields } }
}` + characterFields

const removeFromSpellbookMutation = `
mutation ($characterId: ID!, $spellKey: ID!) {
	spells { removeFromSpellbook(characterId: $characterId, spellKey: $spellKey) { ...CharacterFields } }
}` + characterFields

const prepareSpellsMutation = `
mutation ($characterId: ID!, $spellKeys: [ID!]!) {
	spells { prepare(characterId: $characterId, spellKeys: $spellKeys) { ...CharacterFields } }
}` + characterFields

const setForgottenMutation = `
mutation ($characterId: ID!, $spellKey: ID!, $forgotten: Boolean!) {
	spells { setForgotten(characterId: $characterId, spellKey: $spellKey, forgotten: $forgotten) { ...CharacterFields } }
}` + characterFields

func createClass(t *testing.T, c *client.Client, classKey string) characterResponse {
	t.Helper()

	return createCharacter(t, c, modelstest.ValidCreateCharacterInput(characterClass(t, classKey)))
}

func spellbookKeys(c characterResponse) []string {
	return moveKeys(c.Spellbook)
}

func preparedKeys(c characterResponse) []string {
	out := make([]string, len(c.PreparedSpells))
	for i, s := range c.PreparedSpells {
		out[i] = s.Spell.Key
	}
	return out
}

func spellVars(characterID, spellKey string, more ...client.Option) []client.Option {
	return append([]client.Option{client.Var("characterId", characterID), client.Var("spellKey", spellKey)}, more...)
}

func TestSpellsByClass(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)

	for class, wantCount := range map[string]int{
		"cleric":  len((*env.GameData.SpellMap)["cleric"]),
		"wizard":  len((*env.GameData.SpellMap)["wizard"]),
		"fighter": 0,
	} {
		var resp struct {
			Spells struct {
				ByClass []struct {
					Key, Name, Description string
					Level                  int32
					Tags, Options          []string
				}
			}
		}
		if err := c.Post(spellsByClassQuery, &resp, client.Var("classKey", class)); err != nil {
			t.Fatalf("spells for %s: %v", class, err)
		}
		if len(resp.Spells.ByClass) != wantCount {
			t.Errorf("%s: %d spells, want %d", class, len(resp.Spells.ByClass), wantCount)
		}
		for _, s := range resp.Spells.ByClass {
			if s.Key == "fireball" && (s.Level != 3 || s.Name != "Fireball" || !slices.Equal(s.Tags, []string{"evocation"})) {
				t.Errorf("fireball = %+v", s)
			}
		}
	}
}

func TestWizardSpellbookAndPreparation(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	wizard := createClass(t, c, "wizard")

	if wizard.ExpectedSpellbookSize == nil || *wizard.ExpectedSpellbookSize != 3 ||
		wizard.MaxPreparedSpellLevels == nil || *wizard.MaxPreparedSpellLevels != 2 ||
		len(wizard.Spellbook) != 0 || len(wizard.PreparedSpells) != 0 {
		t.Errorf("new wizard: spellbook %v of %v, prepared %v, limit %v",
			wizard.Spellbook, wizard.ExpectedSpellbookSize, wizard.PreparedSpells, wizard.MaxPreparedSpellLevels)
	}

	var got characterResponse
	for _, spell := range []string{"magic_missile", "charm_person", "alarm"} {
		got = postCharacter(t, c, addToSpellbookMutation, "spells", "addToSpellbook", spellVars(wizard.ID, spell)...)
	}
	if !slices.Equal(spellbookKeys(got), []string{"magic_missile", "charm_person", "alarm"}) {
		t.Errorf("spellbook = %v", spellbookKeys(got))
	}

	// Level 3 spells are above a level 1 wizard.
	wantValidationError(t, postErrors(t, c, addToSpellbookMutation, spellVars(wizard.ID, "fireball")...), "spellKey")
	// Already in the spellbook.
	wantValidationError(t, postErrors(t, c, addToSpellbookMutation, spellVars(wizard.ID, "alarm")...), "spellKey")

	prepare := func(keys ...string) characterResponse {
		return postCharacter(t, c, prepareSpellsMutation, "spells", "prepare",
			client.Var("characterId", wizard.ID), client.Var("spellKeys", keys))
	}

	got = prepare("magic_missile", "charm_person")
	if !slices.Equal(preparedKeys(got), []string{"magic_missile", "charm_person"}) || got.PreparedSpellLevels != 2 {
		t.Errorf("prepared %v (%d levels)", preparedKeys(got), got.PreparedSpellLevels)
	}

	// Three level 1 spells is over the limit of 2; nothing changes.
	wantValidationError(t, postErrors(t, c, prepareSpellsMutation,
		client.Var("characterId", wizard.ID), client.Var("spellKeys", []string{"magic_missile", "charm_person", "alarm"})), "spellKeys")
	if got := preparedKeys(characterByID(t, c, wizard.ID)); !slices.Equal(got, []string{"magic_missile", "charm_person"}) {
		t.Errorf("after a rejected prepare: %v", got)
	}

	// Forgetting a spell, then preparing again, clears it.
	got = postCharacter(t, c, setForgottenMutation, "spells", "setForgotten",
		spellVars(wizard.ID, "magic_missile", client.Var("forgotten", true))...)
	if !got.PreparedSpells[0].IsForgotten || got.PreparedSpells[1].IsForgotten {
		t.Errorf("after forgetting magic missile: %+v", got.PreparedSpells)
	}
	wantValidationError(t, postErrors(t, c, setForgottenMutation,
		spellVars(wizard.ID, "alarm", client.Var("forgotten", true))...), "spellKey")

	got = prepare("magic_missile", "alarm")
	for _, s := range got.PreparedSpells {
		if s.IsForgotten {
			t.Errorf("%s is still forgotten after preparing again", s.Spell.Key)
		}
	}

	// Removing a spell from the spellbook unprepares it.
	got = postCharacter(t, c, removeFromSpellbookMutation, "spells", "removeFromSpellbook", spellVars(wizard.ID, "alarm")...)
	if slices.Contains(spellbookKeys(got), "alarm") || !slices.Equal(preparedKeys(got), []string{"magic_missile"}) {
		t.Errorf("after removing alarm: spellbook %v, prepared %v", spellbookKeys(got), preparedKeys(got))
	}
	wantValidationError(t, postErrors(t, c, removeFromSpellbookMutation, spellVars(wizard.ID, "alarm")...), "spellKey")
}

func TestClericCommune(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	cleric := createClass(t, c, "cleric")

	if cleric.ExpectedSpellbookSize != nil || cleric.MaxPreparedSpellLevels == nil || *cleric.MaxPreparedSpellLevels != 2 {
		t.Errorf("new cleric: expected spellbook %v, limit %v", cleric.ExpectedSpellbookSize, cleric.MaxPreparedSpellLevels)
	}

	// Clerics prepare from the whole cleric list, without a spellbook.
	got := postCharacter(t, c, prepareSpellsMutation, "spells", "prepare",
		client.Var("characterId", cleric.ID), client.Var("spellKeys", []string{"bless", "sanctuary"}))
	if !slices.Equal(preparedKeys(got), []string{"bless", "sanctuary"}) {
		t.Errorf("prepared %v", preparedKeys(got))
	}

	// No spell above their level, and no spellbook.
	wantValidationError(t, postErrors(t, c, prepareSpellsMutation,
		client.Var("characterId", cleric.ID), client.Var("spellKeys", []string{"animate_dead"})), "spellKeys")
	wantValidationError(t, postErrors(t, c, addToSpellbookMutation, spellVars(cleric.ID, "bless")...), "characterId")
}

func TestSpellsOnNonCaster(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c)

	if fighter.MaxPreparedSpellLevels != nil || fighter.ExpectedSpellbookSize != nil || len(fighter.Spellbook) != 0 {
		t.Errorf("fighter spell fields: limit %v, expected %v, spellbook %v",
			fighter.MaxPreparedSpellLevels, fighter.ExpectedSpellbookSize, fighter.Spellbook)
	}

	wantValidationError(t, postErrors(t, c, prepareSpellsMutation,
		client.Var("characterId", fighter.ID), client.Var("spellKeys", []string{})), "characterId")
	wantValidationError(t, postErrors(t, c, addToSpellbookMutation, spellVars(fighter.ID, "magic_missile")...), "characterId")
	wantValidationError(t, postErrors(t, c, setForgottenMutation,
		spellVars(fighter.ID, "magic_missile", client.Var("forgotten", true))...), "characterId")
}
