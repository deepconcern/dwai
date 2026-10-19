// Package modelstest provides test fixtures built from the models package,
// shared by the models unit tests and the API integration tests.
package modelstest

import (
	"maps"
	"slices"

	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
)

// ValidCreateCharacterInput returns input that passes validation for class,
// built from the class's own data: the standard stat array, the first
// alignment and race move, the first example of each look, and the first N
// picks of every starting-gear and move-creation-option group.
func ValidCreateCharacterInput(class *models.CharacterClassModel) model.CreateCharacterInput {
	input := model.CreateCharacterInput{
		Abilities: []*model.AbilityScoreInput{
			{Ability: model.AbilityStrength, Score: 16},
			{Ability: model.AbilityDexterity, Score: 15},
			{Ability: model.AbilityConstitution, Score: 13},
			{Ability: model.AbilityIntelligence, Score: 12},
			{Ability: model.AbilityWisdom, Score: 9},
			{Ability: model.AbilityCharisma, Score: 8},
		},
		AlignmentDescription:      "Defend those weaker than you.",
		AlignmentType:             "good",
		CharacterClassKey:         class.Key,
		GearOptionChoices:         []*model.GearOptionChoiceInput{},
		Looks:                     []*model.NewLookInput{},
		MoveCreationOptionChoices: []*model.MoveCreationOptionChoiceInput{},
		Name:                      "Test " + class.Name,
	}

	if len(class.Alignments) > 0 {
		input.AlignmentType = class.Alignments[0].Alignment
		input.AlignmentDescription = class.Alignments[0].Description
	}

	if len(class.RaceMoves) > 0 {
		input.RaceMoveKey = class.RaceMoves[0].Key
	}

	// Sorted so the input is the same on every run.
	for _, lookType := range slices.Sorted(maps.Keys(class.Looks)) {
		if examples := class.Looks[lookType]; len(examples) > 0 {
			input.Looks = append(input.Looks, &model.NewLookInput{LookTypeKey: lookType, Value: examples[0]})
		}
	}

	if class.StartingGear != nil {
		for i, group := range class.StartingGear.Options {
			choice := &model.GearOptionChoiceInput{OptionIndex: int32(i), ChoiceIndices: []int32{}}
			for j := range group.Pick {
				choice.ChoiceIndices = append(choice.ChoiceIndices, int32(j))
			}
			input.GearOptionChoices = append(input.GearOptionChoices, choice)
		}
	}

	for _, move := range class.StartingMoves {
		for i, group := range move.CreationOptions {
			for _, choice := range group.Choices[:group.Pick] {
				input.MoveCreationOptionChoices = append(input.MoveCreationOptionChoices, &model.MoveCreationOptionChoiceInput{
					ChoiceIndex: int32(i),
					MoveKey:     move.Key,
					OptionKey:   choice.Key,
				})
			}
		}
	}

	return input
}
