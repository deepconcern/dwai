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
	alignment   string
	description string
}

func (m *AlignmentTemplateModel) ToObject() *model.AlignmentTemplate {
	return &model.AlignmentTemplate{
		Alignment:   m.alignment,
		Description: m.description,
	}
}

type CharacterClassModel struct {
	Alignments    []*AlignmentTemplateModel
	Bonds         []string
	DamageDie     int32
	HpBase        int32
	Key           string
	Looks         map[string][]string
	Name          string
	RaceMoves     []*MoveModel
	StartingMoves []*MoveModel
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

type LookTypeModel struct{}

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
