package models

import (
	"fmt"
	"io/fs"

	"github.com/deepconcern/dwai/dwai-api/internal/data"
	"github.com/goccy/go-yaml"
)

// TagDefinition is an entry from tags.yaml — the canonical definition of a tag.
type TagDefinition struct {
	Key         string
	Name        string
	Description string
}

type TagDefinitionMap map[string]*TagDefinition

func LoadTags() (*TagDefinitionMap, error) {
	path := "tags.yaml"

	content, err := fs.ReadFile(data.FS, path)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", path, err)
	}

	var tagData []*TagDefinition

	err = yaml.Unmarshal(content, &tagData)
	if err != nil {
		return nil, fmt.Errorf("parse %s: %w", path, err)
	}

	tagMap := make(TagDefinitionMap)

	for _, tag := range tagData {
		tagMap[tag.Key] = tag
	}

	return &tagMap, nil
}
