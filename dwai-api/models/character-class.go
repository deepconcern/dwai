package models

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
	"github.com/goccy/go-yaml"
)

type AlignmentTemplateModel struct {
	Alignment   string
	Description string
}

func (m *AlignmentTemplateModel) ToObject() *model.AlignmentTemplate {
	return &model.AlignmentTemplate{
		Alignment:   m.Alignment,
		Description: m.Description,
	}
}

// MoveCreationChoiceModel maps to the YAML creation_options[].choices[] entry.
type MoveCreationChoiceModel struct {
	Key         string
	Label       string
	Description *string
	// Tags are the mechanical effects of picking this choice (e.g. a
	// Signature Weapon base's weight, or an enhancement's damage bonus).
	// Optional: choices that are purely flavour (a Look) or that don't yet
	// have a tag-catalog equivalent (see tags.yaml) leave this nil.
	Tags []*TagModel
}

// MoveCreationOptionGroupModel maps to the YAML creation_options[] entry.
type MoveCreationOptionGroupModel struct {
	Label   string
	Pick    int32
	Choices []*MoveCreationChoiceModel
}

// BuildMoveChoiceMap groups move creation option choices — from either a
// CreateCharacterInput or persisted db.MoveCreationOptionChoice rows — by
// move key and creation-option group index, for looking up what a player
// picked. keyOf extracts (moveKey, choiceIndex, optionKey) from each item so
// callers with different row types don't need to duplicate the grouping.
func BuildMoveChoiceMap[T any](items []T, keyOf func(T) (moveKey string, choiceIndex int32, optionKey string)) map[string]map[int32][]string {
	choiceMap := make(map[string]map[int32][]string)

	for _, item := range items {
		moveKey, choiceIndex, optionKey := keyOf(item)

		if choiceMap[moveKey] == nil {
			choiceMap[moveKey] = make(map[int32][]string)
		}
		choiceMap[moveKey][choiceIndex] = append(choiceMap[moveKey][choiceIndex], optionKey)
	}

	return choiceMap
}

// ClassMoveModel extends MoveModel with creation_options used only in class files.
type ClassMoveModel struct {
	MoveModel       `yaml:",inline"`
	CreationOptions []MoveCreationOptionGroupModel `yaml:"creation_options"`
}

func (m *ClassMoveModel) ToObject() *model.Move {
	move := m.MoveModel.ToObject()

	// Add creation options if they exist
	if len(m.CreationOptions) > 0 {
		creationOptions := make([]*model.CreationOption, len(m.CreationOptions))
		for i, group := range m.CreationOptions {
			choices := make([]*model.CreationOptionChoice, len(group.Choices))
			for j, choice := range group.Choices {
				choices[j] = &model.CreationOptionChoice{
					IsPicked: false,
					Key:      choice.Key,
					Label:    choice.Label,
				}
			}
			creationOptions[i] = &model.CreationOption{
				Label:   group.Label,
				Pick:    group.Pick,
				Choices: choices,
			}
		}
		move.CreationOptions = creationOptions
	}

	return move
}

type CharacterClassModel struct {
	Alignments       []*AlignmentTemplateModel
	Bonds            []string
	DamageDie        int32 `yaml:"damage_die"`
	HpBase           int32 `yaml:"hp_base"`
	Key              string
	Looks            map[string][]string
	Name             string
	RaceMoves        []*ClassMoveModel  `yaml:"race_moves"`
	StartingMoves    []*ClassMoveModel  `yaml:"starting_moves"`
	AdvancedMoves25  []*ClassMoveModel  `yaml:"advanced_moves_2_5"`
	AdvancedMoves610 []*ClassMoveModel  `yaml:"advanced_moves_6_10"`
	StartingGear     *StartingGearModel `yaml:"starting_gear"`
}

type CharacterClassMap map[string]CharacterClassModel

func (m *CharacterClassModel) ToObject() *model.CharacterClass {
	// Build alignment templates

	alignmentTemplate := make([]*model.AlignmentTemplate, len(m.Alignments))
	for i, a := range m.Alignments {
		alignmentTemplate[i] = a.ToObject()
	}

	// Build look examples

	lookExamples := make([]*model.LookExample, 0)
	for lookType, examples := range m.Looks {
		lookExamples = append(lookExamples, &model.LookExample{
			Type:     lookType,
			Examples: examples,
		})
	}

	// Build moves

	raceMoves := make([]*model.Move, len(m.RaceMoves))
	for i, r := range m.RaceMoves {
		raceMoves[i] = r.ToObject()
	}

	startingMoves := make([]*model.Move, len(m.StartingMoves))
	for i, s := range m.StartingMoves {
		startingMoves[i] = s.ToObject()
	}

	return &model.CharacterClass{
		AlignmentTemplates: alignmentTemplate,
		Bonds:              m.Bonds,
		DamageDie:          m.DamageDie,
		HpBase:             m.HpBase,
		Key:                m.Key,
		LookExamples:       lookExamples,
		Name:               m.Name,
		RaceMoves:          raceMoves,
		StartingMoves:      startingMoves,
	}
}

type LookTypeModel struct {
	Examples []string
	Key      string
	Name     string
}

type LookTypeMap map[string]LookTypeModel

func LoadCharacterClasses() *CharacterClassMap {
	dir_path := filepath.Join("data", "classes")

	// Load all the files in the directory

	entries, err := os.ReadDir(dir_path)
	if err != nil {
		log.Fatal(err)
	}

	// Read each file and store in map
	characterClassMap := make(CharacterClassMap)

	for _, entry := range entries {
		content, err := os.ReadFile(filepath.Join(dir_path, entry.Name()))
		if err != nil {
			log.Fatal(err)
		}

		var characterClassData CharacterClassModel

		err = yaml.Unmarshal(content, &characterClassData)
		if err != nil {
			log.Fatal(err)
		}

		// Add the key based off of the file name
		characterClassData.Key = strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name()))

		characterClassMap[characterClassData.Key] = characterClassData
	}

	return &characterClassMap

}

func LoadLookTypes() *LookTypeMap {
	characterClassMap := LoadCharacterClasses()

	lookTypeMap := make(LookTypeMap)

	for _, characterClass := range *characterClassMap {
		for lookType, examples := range characterClass.Looks {
			lookTypeMap[lookType] = LookTypeModel{
				Key:      lookType,
				Name:     lookType,
				Examples: examples,
			}
		}
	}

	return &lookTypeMap
}
