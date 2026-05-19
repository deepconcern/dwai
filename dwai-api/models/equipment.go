package models

import (
	"log"
	"os"
	"path/filepath"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
	"github.com/goccy/go-yaml"
)

// Tag represents a single tag on an equipment item.
// In YAML it can appear as either a plain string (simple tag) or a mapping
// (quantified tag with a numeric value).
//
//	# Simple tag — references a tag key from tags.yaml
//	- close
//
//	# Quantified tag
//	- key: cost
//	  quantity: 15
type TagModel struct {
	Key      string `yaml:"key"`
	Quantity *int32 `yaml:"quantity"`
}

func (t *TagModel) ToObject(td *TagDefinitionMap) *model.Tag {
	tagDef := (*td)[t.Key]

	return &model.Tag{
		Key:      t.Key,
		Name:     tagDef.Name,
		Quantity: t.Quantity,
	}
}

func (t *TagModel) UnmarshalYAML(unmarshal func(any) error) error {
	// Plain string shorthand: the string is the key.
	var key string
	if err := unmarshal(&key); err == nil {
		t.Key = key
		return nil
	}

	type alias TagModel
	var a alias
	if err := unmarshal(&a); err != nil {
		return err
	}
	*t = TagModel(a)
	return nil
}

type EquipmentModel struct {
	Key         string
	Name        string
	Type        string
	Tags        []*TagModel
	Description *string
}

type EquipmentMap map[string]*EquipmentModel

func LoadEquipment() *EquipmentMap {
	path := filepath.Join("data", "equipment.yaml")

	content, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	var equipmentData []*EquipmentModel

	err = yaml.Unmarshal(content, &equipmentData)
	if err != nil {
		log.Fatal(err)
	}

	equipmentMap := make(EquipmentMap)

	for _, item := range equipmentData {
		equipmentMap[item.Key] = item
	}

	return &equipmentMap
}
