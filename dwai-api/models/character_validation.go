package models

import (
	"fmt"
	"slices"
	"strings"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
)

// ValidationErrorCode is the GraphQL error extension code for invalid input.
const ValidationErrorCode = "VALIDATION_FAILED"

// ValidationError is a problem with user input. Field names the input field
// it concerns, and Message is written to be shown to the player as-is.
type ValidationError struct {
	Field   string
	Message string
}

// StartingAbilityScores is the standard array: at creation, each value is
// assigned to exactly one ability.
var StartingAbilityScores = []int32{16, 15, 13, 12, 9, 8}

// Alignments are the alignment types a character may choose.
var Alignments = []string{"chaotic", "evil", "good", "lawful", "neutral"}

// abilityOrder is the conventional character-sheet order, used so messages
// read in a predictable order.
var abilityOrder = []model.Ability{
	model.AbilityStrength,
	model.AbilityDexterity,
	model.AbilityConstitution,
	model.AbilityIntelligence,
	model.AbilityWisdom,
	model.AbilityCharisma,
}

// ValidateCreateCharacterInput checks everything a new character needs
// before anything is written, returning every problem found rather than just
// the first. characterClass is nil when input.CharacterClassKey doesn't name
// a class; the class-dependent checks are skipped in that case.
func ValidateCreateCharacterInput(input model.CreateCharacterInput, characterClass *CharacterClassModel, lookTypes *LookTypeMap) []ValidationError {
	var errs []ValidationError
	add := func(field, format string, args ...any) {
		errs = append(errs, ValidationError{Field: field, Message: fmt.Sprintf(format, args...)})
	}

	if strings.TrimSpace(input.Name) == "" {
		add("name", "Enter a name.")
	}

	validateAbilities(input.Abilities, add)

	if !slices.Contains(Alignments, strings.ToLower(input.AlignmentType)) {
		add("alignmentType", "Choose an alignment.")
	}
	if strings.TrimSpace(input.AlignmentDescription) == "" {
		add("alignmentDescription", "Describe your alignment.")
	}

	for i, look := range input.Looks {
		if _, ok := (*lookTypes)[look.LookTypeKey]; !ok {
			add("looks", "Look %d has an unknown type '%s'.", i+1, look.LookTypeKey)
		}
		if strings.TrimSpace(look.Value) == "" {
			add("looks", "Look %d needs a value.", i+1)
		}
	}

	if characterClass == nil {
		if input.CharacterClassKey == "" {
			add("characterClassKey", "Choose a class.")
		} else {
			add("characterClassKey", "Unknown class '%s'.", input.CharacterClassKey)
		}
		return errs
	}

	validateRaceMove(input.RaceMoveKey, characterClass, add)
	validateGearChoices(input.GearOptionChoices, characterClass.StartingGear, add)
	validateMoveCreationOptions(input.MoveCreationOptionChoices, characterClass, add)

	return errs
}

type addValidationError func(field, format string, args ...any)

func validateAbilities(abilities []*model.AbilityScoreInput, add addValidationError) {
	counts := make(map[model.Ability]int, len(abilities))
	for _, a := range abilities {
		counts[a.Ability]++
	}

	complete := true
	for _, ability := range abilityOrder {
		switch counts[ability] {
		case 0:
			add("abilities", "Assign a score to %s.", abilityName(ability))
			complete = false
		case 1:
		default:
			add("abilities", "%s is assigned more than once.", abilityName(ability))
			complete = false
		}
	}

	// Only check the values once every ability has exactly one score, so a
	// half-filled form gets "assign a score" messages instead of this one too.
	if !complete {
		return
	}

	scores := make([]int32, len(abilities))
	for i, a := range abilities {
		scores[i] = a.Score
	}
	slices.Sort(scores)

	expected := slices.Clone(StartingAbilityScores)
	slices.Sort(expected)

	if !slices.Equal(scores, expected) {
		add("abilities", "Use each of the scores %s exactly once.", joinScores(StartingAbilityScores))
	}
}

func validateRaceMove(raceMoveKey string, characterClass *CharacterClassModel, add addValidationError) {
	if raceMoveKey == "" {
		add("raceMoveKey", "Choose a race.")
		return
	}

	isValid := slices.ContainsFunc(characterClass.RaceMoves, func(m *ClassMoveModel) bool {
		return m.Key == raceMoveKey
	})
	if !isValid {
		add("raceMoveKey", "Unknown race move '%s' for the %s.", raceMoveKey, characterClass.Name)
	}
}

func validateGearChoices(choices []*model.GearOptionChoiceInput, startingGear *StartingGearModel, add addValidationError) {
	var groups []GearOptionGroupModel
	if startingGear != nil {
		groups = startingGear.Options
	}

	picked := make(map[int32][]int32, len(choices))
	for _, choice := range choices {
		if choice.OptionIndex < 0 || int(choice.OptionIndex) >= len(groups) {
			add("gearOptionChoices", "Unknown starting gear group %d.", choice.OptionIndex+1)
			continue
		}
		if _, ok := picked[choice.OptionIndex]; ok {
			add("gearOptionChoices", "Starting gear group %d is listed more than once.", choice.OptionIndex+1)
			continue
		}

		group := groups[choice.OptionIndex]
		picked[choice.OptionIndex] = choice.ChoiceIndices

		for i, choiceIndex := range choice.ChoiceIndices {
			if choiceIndex < 0 || int(choiceIndex) >= len(group.Choices) {
				add("gearOptionChoices", "Starting gear group %d has no option %d.", choice.OptionIndex+1, choiceIndex+1)
			} else if slices.Contains(choice.ChoiceIndices[:i], choiceIndex) {
				add("gearOptionChoices", "Starting gear group %d has option %d picked twice.", choice.OptionIndex+1, choiceIndex+1)
			}
		}
	}

	for i, group := range groups {
		if count := len(picked[int32(i)]); count != group.Pick {
			add("gearOptionChoices", "Choose %d from starting gear group %d (%d chosen).", group.Pick, i+1, count)
		}
	}
}

func validateMoveCreationOptions(choices []*model.MoveCreationOptionChoiceInput, characterClass *CharacterClassModel, add addValidationError) {
	movesByKey := make(map[string]*ClassMoveModel, len(characterClass.StartingMoves))
	for _, move := range characterClass.StartingMoves {
		movesByKey[move.Key] = move
	}

	for _, choice := range choices {
		move, ok := movesByKey[choice.MoveKey]
		if !ok {
			add("moveCreationOptionChoices", "Unknown move '%s' for the %s.", choice.MoveKey, characterClass.Name)
			continue
		}
		if choice.ChoiceIndex < 0 || int(choice.ChoiceIndex) >= len(move.CreationOptions) {
			add("moveCreationOptionChoices", "%s has no creation option %d.", move.Name, choice.ChoiceIndex+1)
		}
	}

	picked := BuildMoveChoiceMap(choices, func(c *model.MoveCreationOptionChoiceInput) (string, int32, string) {
		return c.MoveKey, c.ChoiceIndex, c.OptionKey
	})

	for _, move := range characterClass.StartingMoves {
		for i, group := range move.CreationOptions {
			keys := picked[move.Key][int32(i)]

			for j, key := range keys {
				isValid := slices.ContainsFunc(group.Choices, func(c *MoveCreationChoiceModel) bool {
					return c.Key == key
				})
				if !isValid {
					add("moveCreationOptionChoices", "%s: '%s' is not a %s option.", move.Name, key, group.Label)
				} else if slices.Contains(keys[:j], key) {
					add("moveCreationOptionChoices", "%s: '%s' is picked twice.", move.Name, key)
				}
			}

			if len(keys) != int(group.Pick) {
				add("moveCreationOptionChoices", "%s: choose %d %s (%d chosen).", move.Name, group.Pick, group.Label, len(keys))
			}
		}
	}
}

// abilityName turns an Ability enum value (e.g. STRENGTH) into "Strength".
func abilityName(a model.Ability) string {
	s := strings.ToLower(string(a))
	return strings.ToUpper(s[:1]) + s[1:]
}

func joinScores(scores []int32) string {
	parts := make([]string, len(scores))
	for i, s := range scores {
		parts[i] = fmt.Sprint(s)
	}
	return strings.Join(parts, ", ")
}
