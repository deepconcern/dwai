package models

import "fmt"

type GameData struct {
	CharacterClassMap *CharacterClassMap
	ItemTemplateMap   *ItemTemplateMap
	MoveMap           *MoveMap
	TagDefinitionMap  *TagDefinitionMap
}

func LoadGameData() (*GameData, error) {
	characterClassMap, err := LoadCharacterClasses()
	if err != nil {
		return nil, fmt.Errorf("unable to load character classes: %w", err)
	}

	itemTemplateMap, err := LoadItemTemplates()
	if err != nil {
		return nil, fmt.Errorf("unable to load item templates: %w", err)
	}

	moveMap, err := LoadPlayerMoves()
	if err != nil {
		return nil, fmt.Errorf("unable to load player moves: %w", err)
	}

	tagDefinitionMap, err := LoadTags()
	if err != nil {
		return nil, fmt.Errorf("unable to load tag definitions: %w", err)
	}

	return &GameData{characterClassMap, itemTemplateMap, moveMap, tagDefinitionMap}, nil
}
