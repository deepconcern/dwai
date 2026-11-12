//go:build integration

package graph_test

import (
	"slices"
	"testing"

	"github.com/99designs/gqlgen/client"
	"github.com/deepconcern/dwai/dwai-api/internal/models/modelstest"
)

const takeDamageMutation = `
mutation ($id: ID!, $input: TakeDamageInput!) {
	characters { takeDamage(id: $id, input: $input) { ...CharacterFields } }
}` + characterFields

const healMutation = `
mutation ($id: ID!, $amount: Int!) {
	characters { heal(id: $id, amount: $amount) { ...CharacterFields } }
}` + characterFields

const adjustGoldMutation = `
mutation ($id: ID!, $delta: Int!) {
	characters { adjustGold(id: $id, delta: $delta) { ...CharacterFields } }
}` + characterFields

const setDebilityMutation = `
mutation ($id: ID!, $debility: Debility!, $active: Boolean!) {
	characters { setDebility(id: $id, debility: $debility, active: $active) { ...CharacterFields } }
}` + characterFields

// createFighter creates the fixture Fighter: STR 16, CON 13, base HP 10 and
// base load 12, with unworn scale armor (armor 2) and a shield (+1 armor).
func createFighter(t *testing.T, c *client.Client) characterResponse {
	t.Helper()

	return createCharacter(t, c, modelstest.ValidCreateCharacterInput(characterClass(t, "fighter")))
}

func takeDamage(t *testing.T, c *client.Client, id string, input map[string]any) characterResponse {
	t.Helper()

	return postCharacter(t, c, takeDamageMutation, "characters", "takeDamage", client.Var("id", id), client.Var("input", input))
}

func heal(t *testing.T, c *client.Client, id string, amount int) characterResponse {
	t.Helper()

	return postCharacter(t, c, healMutation, "characters", "heal", client.Var("id", id), client.Var("amount", amount))
}

func TestDerivedStats(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c)

	if fighter.MaxHitPoints != 23 || fighter.HitPoints != 23 {
		t.Errorf("HP = %d / %d, want 23 / 23 (base 10 + CON 13)", fighter.HitPoints, fighter.MaxHitPoints)
	}
	if fighter.MaxLoad != 14 {
		t.Errorf("maxLoad = %d, want 14 (base 12 + STR modifier 2)", fighter.MaxLoad)
	}
	if fighter.Armor != 1 {
		t.Errorf("armor = %d, want 1 (shield only; the armor isn't worn yet)", fighter.Armor)
	}
	if fighter.Load <= 0 {
		t.Errorf("load = %d, want the starting gear's weight", fighter.Load)
	}
	if fighter.IsDying || len(fighter.Debilities) != 0 {
		t.Errorf("new character isDying = %v, debilities = %v", fighter.IsDying, fighter.Debilities)
	}

	// Wearing the scale armor adds its armor.
	armor := findItem(t, fighter.Equipment, "scale armor", func(item itemResponse) bool { return item.Key == "scale_armor" })
	setWorn(t, c, armor.ID, true)
	if got := characterByID(t, c, fighter.ID).Armor; got != 3 {
		t.Errorf("armor with scale armor worn = %d, want 3", got)
	}
}

func TestTakeDamageAndHeal(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c) // 23 HP, armor 1

	steps := []struct {
		name   string
		damage map[string]any
		heal   int
		wantHP int32
	}{
		{name: "armor is subtracted", damage: map[string]any{"amount": 5}, wantHP: 19},
		{name: "piercing ignores armor", damage: map[string]any{"amount": 5, "piercing": 1}, wantHP: 14},
		{name: "ignores armor", damage: map[string]any{"amount": 3, "ignoresArmor": true}, wantHP: 11},
		{name: "armor absorbs a small hit", damage: map[string]any{"amount": 1}, wantHP: 11},
		{name: "heal", heal: 4, wantHP: 15},
		{name: "heal is capped at max HP", heal: 100, wantHP: 23},
		{name: "HP floors at 0", damage: map[string]any{"amount": 100}, wantHP: 0},
		{name: "heal from 0", heal: 2, wantHP: 2},
	}

	for _, step := range steps {
		var got characterResponse
		if step.damage != nil {
			got = takeDamage(t, c, fighter.ID, step.damage)
		} else {
			got = heal(t, c, fighter.ID, step.heal)
		}

		if got.HitPoints != step.wantHP {
			t.Fatalf("%s: HP = %d, want %d", step.name, got.HitPoints, step.wantHP)
		}
		if got.IsDying != (step.wantHP == 0) {
			t.Errorf("%s: isDying = %v at %d HP", step.name, got.IsDying, got.HitPoints)
		}
		if stored := characterByID(t, c, fighter.ID).HitPoints; stored != step.wantHP {
			t.Errorf("%s: stored HP = %d, want %d", step.name, stored, step.wantHP)
		}
	}
}

func TestTakeDamageAndHealErrors(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c)

	errs := postErrors(t, c, takeDamageMutation, client.Var("id", fighter.ID), client.Var("input", map[string]any{"amount": -1, "piercing": -1}))
	wantValidationError(t, errs, "amount")
	wantValidationError(t, errs, "piercing")

	wantValidationError(t, postErrors(t, c, healMutation, client.Var("id", fighter.ID), client.Var("amount", -1)), "amount")

	if got := characterByID(t, c, fighter.ID).HitPoints; got != 23 {
		t.Errorf("HP after rejected changes = %d, want 23", got)
	}

	for name, id := range map[string]string{
		"unknown":   "00000000-0000-0000-0000-000000000000",
		"malformed": "abc",
	} {
		t.Run(name, func(t *testing.T) {
			_ = postErrors(t, c, healMutation, client.Var("id", id), client.Var("amount", 1))
			_ = postErrors(t, c, takeDamageMutation, client.Var("id", id), client.Var("input", map[string]any{"amount": 1}))
		})
	}
}

func TestAdjustGold(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c)
	start := fighter.Gold

	adjust := func(delta int) characterResponse {
		return postCharacter(t, c, adjustGoldMutation, "characters", "adjustGold", client.Var("id", fighter.ID), client.Var("delta", delta))
	}

	if got := adjust(10).Gold; got != start+10 {
		t.Errorf("gold after +10 = %d, want %d", got, start+10)
	}
	if got := adjust(-int(start) - 10).Gold; got != 0 {
		t.Errorf("gold after spending it all = %d, want 0", got)
	}

	wantValidationError(t, postErrors(t, c, adjustGoldMutation, client.Var("id", fighter.ID), client.Var("delta", -1)), "delta")

	if got := characterByID(t, c, fighter.ID).Gold; got != 0 {
		t.Errorf("stored gold = %d, want 0", got)
	}
}

func TestSetDebility(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c)

	set := func(debility string, active bool) characterResponse {
		return postCharacter(t, c, setDebilityMutation, "characters", "setDebility",
			client.Var("id", fighter.ID), client.Var("debility", debility), client.Var("active", active))
	}

	set("WEAK", true)
	got := set("CONFUSED", true)
	if !slices.Equal(got.Debilities, []string{"CONFUSED", "WEAK"}) {
		t.Errorf("debilities = %v, want [CONFUSED WEAK]", got.Debilities)
	}

	// The API's modifiers don't include debilities; the app applies them.
	for _, ability := range got.Abilities {
		if ability.Ability == "STRENGTH" && ability.Modifier != 2 {
			t.Errorf("STR modifier while Weak = %d, want the base modifier 2", ability.Modifier)
		}
	}

	set("WEAK", false)
	if stored := characterByID(t, c, fighter.ID).Debilities; !slices.Equal(stored, []string{"CONFUSED"}) {
		t.Errorf("stored debilities = %v, want [CONFUSED]", stored)
	}
}
