package models

import (
	"log"
	"os"
	"path/filepath"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
	"github.com/goccy/go-yaml"
)

type MoveModel struct {
	Key     string
	Name    string
	On10    string
	On79    string
	Roll    string
	Trigger string
	Type    string
}

func (m *MoveModel) ToObject() *model.Move {
	return &model.Move{
		Key:     m.Key,
		Name:    m.Name,
		Trigger: m.Trigger,
		Type:    m.Type,
	}
}

type MoveMap map[string]*MoveModel

func LoadBasicMoves() *MoveMap {
	path := filepath.Join("data", "basic_moves.yaml")

	content, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	var moveData []*MoveModel

	err = yaml.Unmarshal(content, &moveData)
	if err != nil {
		log.Fatal(err)
	}

	moveMap := make(MoveMap)

	for _, move := range moveData {
		moveMap[move.Key] = move
	}

	return &moveMap
}
