//go:build integration

package graph_test

import (
	"slices"
	"testing"

	"github.com/99designs/gqlgen/client"
)

const adjustXPMutation = `
mutation ($id: ID!, $delta: Int!) {
	characters { adjustXp(id: $id, delta: $delta) { ...CharacterFields } }
}` + characterFields

const levelUpMutation = `
mutation ($id: ID!, $input: LevelUpInput!) {
	characters { levelUp(id: $id, input: $input) { ...CharacterFields } }
}` + characterFields

const classAdvancedMovesQuery = `
query ($key: ID!) {
	characterClasses { byKey(key: $key) { advancedMoves2to5 { key } advancedMoves6to10 { key replacesKey } } }
}`

func adjustXP(t *testing.T, c *client.Client, id string, delta int32) characterResponse {
	t.Helper()

	return postCharacter(t, c, adjustXPMutation, "characters", "adjustXp", client.Var("id", id), client.Var("delta", delta))
}

func levelUp(t *testing.T, c *client.Client, id, ability, move string) characterResponse {
	t.Helper()

	return postCharacter(t, c, levelUpMutation, "characters", "levelUp",
		client.Var("id", id), client.Var("input", map[string]any{"ability": ability, "advancedMoveKey": move}))
}

func moveKeys(moves []struct{ Key string }) []string {
	out := make([]string, len(moves))
	for i, m := range moves {
		out[i] = m.Key
	}
	return out
}

func availableKeys(c characterResponse) []string {
	out := make([]string, len(c.AvailableAdvancedMoves))
	for i, m := range c.AvailableAdvancedMoves {
		out[i] = m.Key
	}
	return out
}

func TestClassAdvancedMoves(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)

	var resp struct {
		CharacterClasses struct {
			ByKey struct {
				AdvancedMoves2to5  []struct{ Key string }
				AdvancedMoves6to10 []struct {
					Key         string
					ReplacesKey *string
				}
			}
		}
	}
	if err := c.Post(classAdvancedMovesQuery, &resp, client.Var("key", "fighter")); err != nil {
		t.Fatalf("class advanced moves: %v", err)
	}

	fighter := characterClass(t, "fighter")
	got := resp.CharacterClasses.ByKey
	if len(got.AdvancedMoves2to5) != len(fighter.AdvancedMoves25) || len(got.AdvancedMoves6to10) != len(fighter.AdvancedMoves610) {
		t.Errorf("got %d and %d advanced moves, want %d and %d",
			len(got.AdvancedMoves2to5), len(got.AdvancedMoves6to10), len(fighter.AdvancedMoves25), len(fighter.AdvancedMoves610))
	}
	if !slices.ContainsFunc(got.AdvancedMoves6to10, func(m struct {
		Key         string
		ReplacesKey *string
	}) bool {
		return m.Key == "bloodthirsty" && m.ReplacesKey != nil && *m.ReplacesKey == "merciless"
	}) {
		t.Error("bloodthirsty doesn't replace merciless")
	}
}

func TestXPAndLevelUp(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c) // level 1, CON 13, 23 HP

	if fighter.Level != 1 || fighter.Xp != 0 || fighter.XpToLevel != 8 || fighter.CanLevelUp || len(fighter.AdvancedMoves) != 0 {
		t.Errorf("new character: level %d, XP %d / %d, canLevelUp %v, advanced moves %v",
			fighter.Level, fighter.Xp, fighter.XpToLevel, fighter.CanLevelUp, fighter.AdvancedMoves)
	}
	// At level 2 only the 2–5 list is available, minus moves with unmet requirements.
	available := availableKeys(fighter)
	if !slices.Contains(available, "merciless") || slices.Contains(available, "bloodthirsty") {
		t.Errorf("available at level 1: %v", available)
	}
	for _, m := range fighter.AvailableAdvancedMoves {
		if m.RequiresKey != nil {
			t.Errorf("%s is available but requires %s", m.Key, *m.RequiresKey)
		}
	}

	if got := adjustXP(t, c, fighter.ID, 9); got.Xp != 9 || !got.CanLevelUp {
		t.Errorf("after +9 XP: XP %d, canLevelUp %v", got.Xp, got.CanLevelUp)
	}

	got := levelUp(t, c, fighter.ID, "CONSTITUTION", "merciless")
	if got.Level != 2 || got.Xp != 1 || got.XpToLevel != 9 || got.CanLevelUp {
		t.Errorf("after level up: level %d, XP %d / %d, canLevelUp %v", got.Level, got.Xp, got.XpToLevel, got.CanLevelUp)
	}
	if got.MaxHitPoints != 24 || got.HitPoints != 24 {
		t.Errorf("HP after +1 CON = %d / %d, want 24 / 24", got.HitPoints, got.MaxHitPoints)
	}
	if !slices.Equal(moveKeys(got.AdvancedMoves), []string{"merciless"}) || slices.Contains(availableKeys(got), "merciless") {
		t.Errorf("advanced moves %v, available %v", moveKeys(got.AdvancedMoves), availableKeys(got))
	}

	stored := characterByID(t, c, fighter.ID)
	if stored.Level != 2 || !slices.Equal(moveKeys(stored.AdvancedMoves), []string{"merciless"}) {
		t.Errorf("stored: level %d, advanced moves %v", stored.Level, moveKeys(stored.AdvancedMoves))
	}
}

func TestLevelUpReplacesMove(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c)

	// Take merciless at level 2, then any available move up to level 6.
	current := fighter
	for current.Level < 6 {
		adjustXP(t, c, fighter.ID, current.XpToLevel)
		move := "merciless"
		if current.Level > 1 {
			move = availableKeys(current)[0]
		}
		current = levelUp(t, c, fighter.ID, "WISDOM", move)
	}
	if !slices.Contains(moveKeys(current.AdvancedMoves), "merciless") || !slices.Contains(availableKeys(current), "bloodthirsty") {
		t.Fatalf("at level %d: advanced moves %v, available %v", current.Level, moveKeys(current.AdvancedMoves), availableKeys(current))
	}

	adjustXP(t, c, fighter.ID, current.XpToLevel)
	got := levelUp(t, c, fighter.ID, "WISDOM", "bloodthirsty")
	held := moveKeys(got.AdvancedMoves)
	if slices.Contains(held, "merciless") || !slices.Contains(held, "bloodthirsty") {
		t.Errorf("after taking bloodthirsty: advanced moves %v, want merciless replaced", held)
	}
	if slices.Contains(availableKeys(got), "merciless") {
		t.Error("merciless is available again after being replaced")
	}
}

func TestXPAndLevelUpErrors(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c)

	wantValidationError(t, postErrors(t, c, adjustXPMutation, client.Var("id", fighter.ID), client.Var("delta", -1)), "delta")

	levelUpErrors := func(ability, move string) []string {
		errs := postErrors(t, c, levelUpMutation, client.Var("id", fighter.ID),
			client.Var("input", map[string]any{"ability": ability, "advancedMoveKey": move}))
		fields := make([]string, len(errs))
		for i, e := range errs {
			fields[i], _ = e.Extensions["field"].(string)
		}
		return fields
	}

	if got := levelUpErrors("CONSTITUTION", "merciless"); !slices.Equal(got, []string{"xp"}) {
		t.Errorf("level up without XP reported %v", got)
	}

	adjustXP(t, c, fighter.ID, 8)
	if got := levelUpErrors("CONSTITUTION", "bloodthirsty"); !slices.Equal(got, []string{"advancedMoveKey"}) {
		t.Errorf("taking a 6–10 move at level 2 reported %v", got)
	}

	stored := characterByID(t, c, fighter.ID)
	if stored.Level != 1 || stored.Xp != 8 || len(stored.AdvancedMoves) != 0 {
		t.Errorf("rejected level ups changed the character: level %d, XP %d, moves %v", stored.Level, stored.Xp, stored.AdvancedMoves)
	}
}
