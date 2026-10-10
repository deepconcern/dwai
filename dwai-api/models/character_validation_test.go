package models

import (
	"slices"
	"strings"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
)

func testClass() *CharacterClassModel {
	return &CharacterClassModel{
		Key:  "fighter",
		Name: "Fighter",
		RaceMoves: []*ClassMoveModel{
			{MoveModel: MoveModel{Key: "dwarf", Name: "Dwarf"}},
			{MoveModel: MoveModel{Key: "elf", Name: "Elf"}},
		},
		StartingMoves: []*ClassMoveModel{
			{MoveModel: MoveModel{Key: "bend_bars", Name: "Bend Bars"}},
			{
				MoveModel: MoveModel{Key: "signature_weapon", Name: "Signature Weapon"},
				CreationOptions: []MoveCreationOptionGroupModel{
					{Label: "Base", Pick: 1, Choices: []*MoveCreationChoiceModel{{Key: "sword"}, {Key: "axe"}}},
					{Label: "Enhancement", Pick: 2, Choices: []*MoveCreationChoiceModel{{Key: "hooks"}, {Key: "spikes"}, {Key: "sharp"}}},
				},
			},
		},
		StartingGear: &StartingGearModel{
			Options: []GearOptionGroupModel{
				{Pick: 1, Choices: [][]*ItemOptionModel{{}, {}}},
				{Pick: 2, Choices: [][]*ItemOptionModel{{}, {}, {}}},
			},
		},
	}
}

func testLookTypes() *LookTypeMap {
	return &LookTypeMap{
		"eyes": {Key: "eyes", Name: "eyes"},
	}
}

func validInput() model.CreateCharacterInput {
	return model.CreateCharacterInput{
		Abilities: []*model.AbilityScoreInput{
			{Ability: model.AbilityStrength, Score: 16},
			{Ability: model.AbilityDexterity, Score: 15},
			{Ability: model.AbilityConstitution, Score: 13},
			{Ability: model.AbilityIntelligence, Score: 12},
			{Ability: model.AbilityWisdom, Score: 9},
			{Ability: model.AbilityCharisma, Score: 8},
		},
		AlignmentDescription: "Defend those weaker than you.",
		AlignmentType:        "good",
		CharacterClassKey:    "fighter",
		GearOptionChoices: []*model.GearOptionChoiceInput{
			{OptionIndex: 0, ChoiceIndices: []int32{1}},
			{OptionIndex: 1, ChoiceIndices: []int32{0, 2}},
		},
		Looks: []*model.NewLookInput{{LookTypeKey: "eyes", Value: "Hard eyes"}},
		MoveCreationOptionChoices: []*model.MoveCreationOptionChoiceInput{
			{MoveKey: "signature_weapon", ChoiceIndex: 0, OptionKey: "axe"},
			{MoveKey: "signature_weapon", ChoiceIndex: 1, OptionKey: "hooks"},
			{MoveKey: "signature_weapon", ChoiceIndex: 1, OptionKey: "sharp"},
		},
		Name:        "Gregor",
		RaceMoveKey: "dwarf",
	}
}

// fields returns the Field of each error, in order.
func fields(errs []ValidationError) []string {
	out := make([]string, len(errs))
	for i, e := range errs {
		out[i] = e.Field
	}
	return out
}

func TestValidateCreateCharacterInputAcceptsValidInput(t *testing.T) {
	if errs := ValidateCreateCharacterInput(validInput(), testClass(), testLookTypes()); len(errs) != 0 {
		t.Fatalf("expected no errors, got %+v", errs)
	}
}

func TestValidateCreateCharacterInputReportsEverythingMissing(t *testing.T) {
	errs := ValidateCreateCharacterInput(model.CreateCharacterInput{}, nil, testLookTypes())

	got := fields(errs)
	for _, want := range []string{"name", "abilities", "alignmentType", "alignmentDescription", "characterClassKey"} {
		if !slices.Contains(got, want) {
			t.Errorf("expected an error for %s, got %v", want, got)
		}
	}

	abilityErrors := 0
	for _, e := range errs {
		if e.Field == "abilities" {
			abilityErrors++
		}
	}
	if abilityErrors != 6 {
		t.Errorf("expected one error per unassigned ability (6), got %d", abilityErrors)
	}
}

func TestValidateCreateCharacterInputAbilities(t *testing.T) {
	t.Run("rejects scores outside the standard array", func(t *testing.T) {
		input := validInput()
		input.Abilities[0].Score = 18

		errs := ValidateCreateCharacterInput(input, testClass(), testLookTypes())
		if len(errs) != 1 || !strings.Contains(errs[0].Message, "exactly once") {
			t.Fatalf("expected one standard-array error, got %+v", errs)
		}
	})

	t.Run("rejects an ability assigned twice", func(t *testing.T) {
		input := validInput()
		input.Abilities[5].Ability = model.AbilityStrength

		errs := ValidateCreateCharacterInput(input, testClass(), testLookTypes())
		if !slices.Equal(fields(errs), []string{"abilities", "abilities"}) {
			t.Fatalf("expected a duplicate and a missing ability error, got %+v", errs)
		}
	})
}

// Guards against class data the validator would reject even when the player
// makes every required pick (e.g. a group whose pick exceeds its choices).
func TestValidateCreateCharacterInputAcceptsEveryClass(t *testing.T) {
	t.Chdir("..") // The loaders read from data/, relative to the module root.

	classes, err := LoadCharacterClasses()
	if err != nil {
		t.Fatal(err)
	}

	for key, class := range *classes {
		t.Run(key, func(t *testing.T) {
			input := validInput()
			input.CharacterClassKey = key
			input.Looks = nil
			input.RaceMoveKey = class.RaceMoves[0].Key

			input.GearOptionChoices = nil
			for i, group := range class.StartingGear.Options {
				choice := &model.GearOptionChoiceInput{OptionIndex: int32(i)}
				for j := range group.Pick {
					choice.ChoiceIndices = append(choice.ChoiceIndices, int32(j))
				}
				input.GearOptionChoices = append(input.GearOptionChoices, choice)
			}

			input.MoveCreationOptionChoices = nil
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

			if errs := ValidateCreateCharacterInput(input, &class, NewLookTypeMap(classes)); len(errs) != 0 {
				t.Fatalf("expected no errors, got %+v", errs)
			}
		})
	}
}

func TestValidateCreateCharacterInputRaceMove(t *testing.T) {
	input := validInput()
	input.RaceMoveKey = "halfling"

	errs := ValidateCreateCharacterInput(input, testClass(), testLookTypes())
	if !slices.Equal(fields(errs), []string{"raceMoveKey"}) {
		t.Fatalf("expected a race move error, got %+v", errs)
	}
}

func TestValidateCreateCharacterInputLooks(t *testing.T) {
	input := validInput()
	input.Looks = []*model.NewLookInput{{LookTypeKey: "fins", Value: " "}}

	errs := ValidateCreateCharacterInput(input, testClass(), testLookTypes())
	if !slices.Equal(fields(errs), []string{"looks", "looks"}) {
		t.Fatalf("expected unknown-type and empty-value errors, got %+v", errs)
	}
}

func TestValidateCreateCharacterInputGear(t *testing.T) {
	t.Run("requires the full pick for every group", func(t *testing.T) {
		input := validInput()
		input.GearOptionChoices = input.GearOptionChoices[:1]
		input.GearOptionChoices[0].ChoiceIndices = []int32{}

		errs := ValidateCreateCharacterInput(input, testClass(), testLookTypes())
		if !slices.Equal(fields(errs), []string{"gearOptionChoices", "gearOptionChoices"}) {
			t.Fatalf("expected an error per under-picked group, got %+v", errs)
		}
	})

	t.Run("rejects unknown and repeated choices", func(t *testing.T) {
		input := validInput()
		input.GearOptionChoices[1].ChoiceIndices = []int32{0, 0}
		input.GearOptionChoices = append(input.GearOptionChoices, &model.GearOptionChoiceInput{OptionIndex: 5})

		errs := ValidateCreateCharacterInput(input, testClass(), testLookTypes())
		messages := make([]string, len(errs))
		for i, e := range errs {
			messages[i] = e.Message
		}
		joined := strings.Join(messages, "\n")

		for _, want := range []string{"picked twice", "Unknown starting gear group 6"} {
			if !strings.Contains(joined, want) {
				t.Errorf("expected an error containing %q, got:\n%s", want, joined)
			}
		}
	})
}

func TestValidateCreateCharacterInputMoveCreationOptions(t *testing.T) {
	t.Run("requires the full pick for every option", func(t *testing.T) {
		input := validInput()
		input.MoveCreationOptionChoices = input.MoveCreationOptionChoices[:2]

		errs := ValidateCreateCharacterInput(input, testClass(), testLookTypes())
		if len(errs) != 1 || !strings.Contains(errs[0].Message, "choose 2 Enhancement (1 chosen)") {
			t.Fatalf("expected an under-picked enhancement error, got %+v", errs)
		}
	})

	t.Run("rejects options from the wrong group and unknown moves", func(t *testing.T) {
		input := validInput()
		input.MoveCreationOptionChoices[0].OptionKey = "hooks"
		input.MoveCreationOptionChoices = append(input.MoveCreationOptionChoices, &model.MoveCreationOptionChoiceInput{MoveKey: "fireball"})

		errs := ValidateCreateCharacterInput(input, testClass(), testLookTypes())
		if !slices.Equal(fields(errs), []string{"moveCreationOptionChoices", "moveCreationOptionChoices"}) {
			t.Fatalf("expected unknown-move and wrong-group errors, got %+v", errs)
		}
	})
}
