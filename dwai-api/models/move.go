package models

import (
	"log"
	"os"
	"path/filepath"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
	"github.com/goccy/go-yaml"
)

type MoveModel struct {
	Key         string
	Name        string
	Type        string
	Trigger     *string
	Roll        *string
	On10        *string `yaml:"on_10"`
	On7to9      *string `yaml:"on_7_9"`
	OnMiss      *string `yaml:"on_miss"`
	Options     []string
	Description *string
	RequiresKey *string `yaml:"requires"`
	ReplacesKey *string `yaml:"replaces"`
}

func (m *MoveModel) ToObject() *model.Move {
	options := m.Options
	if options == nil {
		options = []string{}
	}
	return &model.Move{
		Key:         m.Key,
		Name:        m.Name,
		Type:        m.Type,
		Trigger:     m.Trigger,
		Roll:        m.Roll,
		On10:        m.On10,
		On7to9:      m.On7to9,
		OnMiss:      m.OnMiss,
		Options:     options,
		Description: m.Description,
		RequiresKey: m.RequiresKey,
		ReplacesKey: m.ReplacesKey,
	}
}

type MoveMap map[string]*MoveModel

func LoadBasicMoves() *MoveMap {
	path := filepath.Join("data", "player_moves.yaml")

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
