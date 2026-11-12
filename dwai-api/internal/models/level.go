package models

import (
	"fmt"
	"slices"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
)

// Rules for XP and leveling up. See docs/game/rules.md, "XP and Levels" and
// "Class Moves".

// MaxLevel is the highest level a character can reach.
const MaxLevel = 10

// MaxAbilityScore is the highest an ability score can be raised to.
const MaxAbilityScore = 18

// XPToLevel is the XP needed to level up from level: level + 7.
func XPToLevel(level int32) int32 {
	return level + 7
}

// CanLevelUp reports whether a character has the XP to level up and isn't
// at the maximum level.
func CanLevelUp(level, xp int32) bool {
	return level < MaxLevel && xp >= XPToLevel(level)
}

// AdjustXP returns the character's XP after adding delta, which may be
// negative. The result can't go below 0.
func AdjustXP(xp, delta int32) (int32, error) {
	if xp+delta < 0 {
		return xp, ValidationError{
			Field:   "delta",
			Message: fmt.Sprintf("XP can't go below 0: the character has %d.", xp),
		}
	}

	return xp + delta, nil
}

// HeldMoveKeys returns the keys of every class move a character has: their
// race move, the class's starting moves, and the advanced moves they've
// taken.
func HeldMoveKeys(class *CharacterClassModel, raceMoveKey string, advancedMoveKeys []string) []string {
	held := []string{raceMoveKey}
	for _, m := range class.StartingMoves {
		held = append(held, m.Key)
	}

	return append(held, advancedMoveKeys...)
}

// AdvancedMoves returns the class's advanced moves with the given keys, in
// the order given. Keys the class doesn't have are skipped.
func AdvancedMoves(class *CharacterClassModel, keys []string) []*ClassMoveModel {
	moves := make([]*ClassMoveModel, 0, len(keys))
	for _, key := range keys {
		if m := findAdvancedMove(class, key); m != nil {
			moves = append(moves, m)
		}
	}

	return moves
}

func findAdvancedMove(class *CharacterClassModel, key string) *ClassMoveModel {
	for _, list := range [][]*ClassMoveModel{class.AdvancedMoves25, class.AdvancedMoves610} {
		if i := slices.IndexFunc(list, func(m *ClassMoveModel) bool { return m.Key == key }); i >= 0 {
			return list[i]
		}
	}

	return nil
}

// AvailableAdvancedMoves returns the advanced moves a character may choose
// on reaching newLevel: from the 2–5 list, or either list at level 6+. A
// move is left out if it's already held, if its required move isn't held, or
// if a held move replaces it. A move that replaces another may be taken
// whether or not the replaced move is held; if it is, it's lost.
func AvailableAdvancedMoves(class *CharacterClassModel, newLevel int32, held []string) []*ClassMoveModel {
	candidates := slices.Clone(class.AdvancedMoves25)
	if newLevel >= 6 {
		candidates = append(candidates, class.AdvancedMoves610...)
	}

	superseded := make(map[string]bool)
	for _, key := range held {
		if m := findAdvancedMove(class, key); m != nil && m.ReplacesKey != nil {
			superseded[*m.ReplacesKey] = true
		}
	}

	available := make([]*ClassMoveModel, 0, len(candidates))
	for _, m := range candidates {
		switch {
		case slices.Contains(held, m.Key):
		case superseded[m.Key]:
		case m.RequiresKey != nil && !slices.Contains(held, *m.RequiresKey):
		default:
			available = append(available, m)
		}
	}

	return available
}

// LevelUpResult is a character after leveling up: its updated row, the
// advanced move it gained, and the move that one replaced, if it held it.
type LevelUpResult struct {
	Character    db.Character
	MoveAdded    string
	MoveReplaced *string
}

// abilityScore returns a pointer to the row's score for ability.
func abilityScore(c *db.Character, ability model.Ability) *int32 {
	switch ability {
	case model.AbilityCharisma:
		return &c.Charisma
	case model.AbilityConstitution:
		return &c.Constitution
	case model.AbilityDexterity:
		return &c.Dexterity
	case model.AbilityIntelligence:
		return &c.Intelligence
	case model.AbilityStrength:
		return &c.Strength
	case model.AbilityWisdom:
		return &c.Wisdom
	default:
		return nil
	}
}

// LevelUp applies the Level Up move to a character: it checks the XP and
// level, spends level + 7 XP, raises the level by 1 and the chosen ability
// score by 1 (to at most 18), and adds the chosen advanced move, which must
// be available. If Constitution rises, max HP rises, and current HP rises by
// the same amount. advancedMoveKeys are the advanced moves already taken.
func LevelUp(class *CharacterClassModel, c db.Character, advancedMoveKeys []string, input model.LevelUpInput) (LevelUpResult, []ValidationError) {
	var errs []ValidationError

	if c.Level >= MaxLevel {
		errs = append(errs, ValidationError{Field: "level", Message: fmt.Sprintf("The character is already at the maximum level, %d.", MaxLevel)})
	} else if c.Xp < XPToLevel(c.Level) {
		errs = append(errs, ValidationError{Field: "xp", Message: fmt.Sprintf("Leveling up needs %d XP; the character has %d.", XPToLevel(c.Level), c.Xp)})
	}

	score := abilityScore(&c, input.Ability)
	if score == nil {
		errs = append(errs, ValidationError{Field: "ability", Message: fmt.Sprintf("Unknown ability '%s'.", input.Ability)})
	} else if *score >= MaxAbilityScore {
		errs = append(errs, ValidationError{Field: "ability", Message: fmt.Sprintf("%s is already %d, the maximum.", abilityName(input.Ability), MaxAbilityScore)})
	}

	newLevel := c.Level + 1
	held := HeldMoveKeys(class, c.RaceMoveKey, advancedMoveKeys)
	available := AvailableAdvancedMoves(class, newLevel, held)
	i := slices.IndexFunc(available, func(m *ClassMoveModel) bool { return m.Key == input.AdvancedMoveKey })
	if i < 0 {
		errs = append(errs, ValidationError{Field: "advancedMoveKey", Message: fmt.Sprintf("'%s' isn't an advanced move this character can take at level %d.", input.AdvancedMoveKey, newLevel)})
	}

	if len(errs) > 0 {
		return LevelUpResult{}, errs
	}

	move := available[i]
	oldMaxHP := MaxHitPoints(class, c.Constitution)

	c.Xp -= XPToLevel(c.Level)
	c.Level = newLevel
	*score++
	c.HitPoints += MaxHitPoints(class, c.Constitution) - oldMaxHP

	result := LevelUpResult{Character: c, MoveAdded: move.Key}
	if move.ReplacesKey != nil && slices.Contains(advancedMoveKeys, *move.ReplacesKey) {
		result.MoveReplaced = move.ReplacesKey
	}

	return result, nil
}
