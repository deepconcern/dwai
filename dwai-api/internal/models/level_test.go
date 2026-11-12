package models_test

import (
	"slices"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
)

func classMove(key string, requires, replaces *string) *models.ClassMoveModel {
	return &models.ClassMoveModel{MoveModel: models.MoveModel{Key: key, Name: key, RequiresKey: requires, ReplacesKey: replaces}}
}

// levelClass has starting move "start", race move "race", 2–5 moves "a",
// "b" (requires "a"), and "c", and 6–10 moves "d" (replaces "a") and "e".
func levelClass() *models.CharacterClassModel {
	return &models.CharacterClassModel{
		HpBase:    10,
		RaceMoves: []*models.ClassMoveModel{classMove("race", nil, nil)},
		StartingMoves: []*models.ClassMoveModel{
			classMove("start", nil, nil),
		},
		AdvancedMoves25: []*models.ClassMoveModel{
			classMove("a", nil, nil),
			classMove("b", ptr("a"), nil),
			classMove("c", nil, nil),
		},
		AdvancedMoves610: []*models.ClassMoveModel{
			classMove("d", nil, ptr("a")),
			classMove("e", nil, nil),
		},
	}
}

func keys(moves []*models.ClassMoveModel) []string {
	out := make([]string, len(moves))
	for i, m := range moves {
		out[i] = m.Key
	}
	return out
}

func TestXPToLevelAndCanLevelUp(t *testing.T) {
	if got := models.XPToLevel(1); got != 8 {
		t.Errorf("XPToLevel(1) = %d, want 8", got)
	}

	for _, tc := range []struct {
		level, xp int32
		want      bool
	}{
		{level: 1, xp: 7, want: false},
		{level: 1, xp: 8, want: true},
		{level: 3, xp: 12, want: true},
		{level: 10, xp: 100, want: false},
	} {
		if got := models.CanLevelUp(tc.level, tc.xp); got != tc.want {
			t.Errorf("CanLevelUp(level %d, %d XP) = %v, want %v", tc.level, tc.xp, got, tc.want)
		}
	}
}

func TestAdjustXP(t *testing.T) {
	if got, err := models.AdjustXP(3, 2); err != nil || got != 5 {
		t.Errorf("AdjustXP(3, +2) = %d, %v; want 5", got, err)
	}
	if got, err := models.AdjustXP(3, -3); err != nil || got != 0 {
		t.Errorf("AdjustXP(3, -3) = %d, %v; want 0", got, err)
	}
	if _, err := models.AdjustXP(3, -4); err == nil {
		t.Error("AdjustXP(3, -4) wasn't rejected")
	}
}

func TestHeldMoveKeys(t *testing.T) {
	got := models.HeldMoveKeys(levelClass(), "race", []string{"a"})
	if !slices.Equal(got, []string{"race", "start", "a"}) {
		t.Errorf("HeldMoveKeys = %v", got)
	}
}

func TestAvailableAdvancedMoves(t *testing.T) {
	class := levelClass()

	for _, tc := range []struct {
		name     string
		newLevel int32
		held     []string
		want     []string
	}{
		{name: "level 2: only the 2–5 list, and b needs a", newLevel: 2, held: []string{"start"}, want: []string{"a", "c"}},
		{name: "a held unlocks b", newLevel: 3, held: []string{"start", "a"}, want: []string{"b", "c"}},
		{name: "level 6 adds the 6–10 list", newLevel: 6, held: []string{"start"}, want: []string{"a", "c", "d", "e"}},
		{name: "a move replaced by a held move isn't available", newLevel: 7, held: []string{"start", "d"}, want: []string{"c", "e"}},
		{name: "taken moves aren't available", newLevel: 6, held: []string{"start", "a", "b", "c", "d", "e"}, want: []string{}},
	} {
		if got := keys(models.AvailableAdvancedMoves(class, tc.newLevel, tc.held)); !slices.Equal(got, tc.want) {
			t.Errorf("%s: got %v, want %v", tc.name, got, tc.want)
		}
	}
}

func TestAdvancedMoves(t *testing.T) {
	got := keys(models.AdvancedMoves(levelClass(), []string{"d", "c", "nope"}))
	if !slices.Equal(got, []string{"d", "c"}) {
		t.Errorf("AdvancedMoves = %v, want [d c]", got)
	}
}

// levelCharacter is a level 1 character with 8 XP, CON 13, STR 18, and
// full HP (23).
func levelCharacter() db.Character {
	return db.Character{
		Charisma: 8, Constitution: 13, Dexterity: 15, HitPoints: 23, Intelligence: 12,
		Level: 1, RaceMoveKey: "race", Strength: 18, Wisdom: 9, Xp: 8,
	}
}

func TestLevelUp(t *testing.T) {
	class := levelClass()

	got, errs := models.LevelUp(class, levelCharacter(), nil, model.LevelUpInput{Ability: model.AbilityDexterity, AdvancedMoveKey: "a"})
	if len(errs) > 0 {
		t.Fatalf("LevelUp: %v", errs)
	}
	if got.Character.Level != 2 || got.Character.Xp != 0 || got.Character.Dexterity != 16 {
		t.Errorf("after level up: level %d, XP %d, DEX %d; want 2, 0, 16", got.Character.Level, got.Character.Xp, got.Character.Dexterity)
	}
	if got.Character.HitPoints != 23 {
		t.Errorf("HP = %d, want 23 (CON didn't change)", got.Character.HitPoints)
	}
	if got.MoveAdded != "a" || got.MoveReplaced != nil {
		t.Errorf("moves: added %q, replaced %v", got.MoveAdded, got.MoveReplaced)
	}
}

func TestLevelUpKeepsLeftoverXP(t *testing.T) {
	c := levelCharacter()
	c.Xp = 11

	got, errs := models.LevelUp(levelClass(), c, nil, model.LevelUpInput{Ability: model.AbilityWisdom, AdvancedMoveKey: "c"})
	if len(errs) > 0 || got.Character.Xp != 3 {
		t.Errorf("XP after spending 8 of 11 = %d, %v; want 3", got.Character.Xp, errs)
	}
}

func TestLevelUpConstitutionRaisesHP(t *testing.T) {
	c := levelCharacter()
	c.HitPoints = 10 // wounded

	got, errs := models.LevelUp(levelClass(), c, nil, model.LevelUpInput{Ability: model.AbilityConstitution, AdvancedMoveKey: "a"})
	if len(errs) > 0 {
		t.Fatalf("LevelUp: %v", errs)
	}
	if got.Character.Constitution != 14 || got.Character.HitPoints != 11 {
		t.Errorf("CON %d, HP %d; want 14 and 11 (max HP and current HP both +1)", got.Character.Constitution, got.Character.HitPoints)
	}
}

func TestLevelUpReplacesHeldMove(t *testing.T) {
	c := levelCharacter()
	c.Level = 5
	c.Xp = 12

	got, errs := models.LevelUp(levelClass(), c, []string{"a"}, model.LevelUpInput{Ability: model.AbilityDexterity, AdvancedMoveKey: "d"})
	if len(errs) > 0 {
		t.Fatalf("LevelUp: %v", errs)
	}
	if got.MoveAdded != "d" || got.MoveReplaced == nil || *got.MoveReplaced != "a" {
		t.Errorf("moves: added %q, replaced %v; want d replacing a", got.MoveAdded, got.MoveReplaced)
	}

	// Without the replaced move, nothing is lost.
	got, errs = models.LevelUp(levelClass(), c, nil, model.LevelUpInput{Ability: model.AbilityDexterity, AdvancedMoveKey: "d"})
	if len(errs) > 0 || got.MoveReplaced != nil {
		t.Errorf("taking d without a: replaced %v, errors %v", got.MoveReplaced, errs)
	}
}

func TestLevelUpErrors(t *testing.T) {
	class := levelClass()

	notEnoughXP := levelCharacter()
	notEnoughXP.Xp = 7

	maxLevel := levelCharacter()
	maxLevel.Level = 10
	maxLevel.Xp = 50

	for _, tc := range []struct {
		name      string
		character db.Character
		held      []string
		input     model.LevelUpInput
		want      []string
	}{
		{name: "not enough XP", character: notEnoughXP, input: model.LevelUpInput{Ability: model.AbilityDexterity, AdvancedMoveKey: "a"}, want: []string{"xp"}},
		{name: "already level 10", character: maxLevel, input: model.LevelUpInput{Ability: model.AbilityDexterity, AdvancedMoveKey: "a"}, want: []string{"level"}},
		{name: "ability at 18", character: levelCharacter(), input: model.LevelUpInput{Ability: model.AbilityStrength, AdvancedMoveKey: "a"}, want: []string{"ability"}},
		{name: "6–10 move before level 6", character: levelCharacter(), input: model.LevelUpInput{Ability: model.AbilityDexterity, AdvancedMoveKey: "e"}, want: []string{"advancedMoveKey"}},
		{name: "requirement not held", character: levelCharacter(), input: model.LevelUpInput{Ability: model.AbilityDexterity, AdvancedMoveKey: "b"}, want: []string{"advancedMoveKey"}},
		{name: "already taken", character: levelCharacter(), held: []string{"a"}, input: model.LevelUpInput{Ability: model.AbilityDexterity, AdvancedMoveKey: "a"}, want: []string{"advancedMoveKey"}},
		{name: "unknown move", character: levelCharacter(), input: model.LevelUpInput{Ability: model.AbilityDexterity, AdvancedMoveKey: "nope"}, want: []string{"advancedMoveKey"}},
		{name: "everything wrong at once", character: notEnoughXP, input: model.LevelUpInput{Ability: model.AbilityStrength, AdvancedMoveKey: "nope"}, want: []string{"xp", "ability", "advancedMoveKey"}},
	} {
		_, errs := models.LevelUp(class, tc.character, tc.held, tc.input)
		if got := fields(errs); !slices.Equal(got, tc.want) {
			t.Errorf("%s: reported fields %v, want %v", tc.name, got, tc.want)
		}
	}
}

func TestClassAdvancedMovesExposed(t *testing.T) {
	obj := levelClass().ToObject()
	if len(obj.AdvancedMoves2to5) != 3 || len(obj.AdvancedMoves6to10) != 2 {
		t.Errorf("CharacterClass has %d 2–5 and %d 6–10 moves, want 3 and 2", len(obj.AdvancedMoves2to5), len(obj.AdvancedMoves6to10))
	}
	if r := obj.AdvancedMoves6to10[0].ReplacesKey; r == nil || *r != "a" {
		t.Errorf("d's replacesKey = %v, want a", r)
	}
}
