package models

import (
	"fmt"
	"maps"
	"os"
	"path/filepath"
	"slices"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
	"github.com/goccy/go-yaml"
)

// Tag represents a single tag on an item template.
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

// ItemTemplateModel is a catalog entry from item_templates.yaml. Any item that
// isn't "custom" (a class's starting gear pick, or a character's owned item)
// references one of these by key and either inherits its data as-is or
// overrides parts of it.
type ItemTemplateModel struct {
	Key         string
	Name        string
	Type        string
	Tags        []*TagModel
	Description *string
}

func (m *ItemTemplateModel) ToObject(td *TagDefinitionMap) *model.ItemTemplate {
	tags := make([]*model.Tag, len(m.Tags))
	for i, t := range m.Tags {
		tags[i] = t.ToObject(td)
	}

	description := ""
	if m.Description != nil {
		description = *m.Description
	}

	return &model.ItemTemplate{
		Description: description,
		Key:         m.Key,
		Label:       m.Name,
		Tags:        tags,
	}
}

type ItemTemplateMap map[string]*ItemTemplateModel

func LoadItemTemplates() (*ItemTemplateMap, error) {
	path := filepath.Join("data", "item_templates.yaml")

	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", path, err)
	}

	var itemTemplateData []*ItemTemplateModel

	err = yaml.Unmarshal(content, &itemTemplateData)
	if err != nil {
		return nil, fmt.Errorf("parse %s: %w", path, err)
	}

	itemTemplateMap := make(ItemTemplateMap)

	for _, item := range itemTemplateData {
		itemTemplateMap[item.Key] = item
	}

	return &itemTemplateMap, nil
}

// resolvedItemFields is the final label, description, type, and tag set for
// an item after merging per-instance overrides on top of an optional template.
type resolvedItemFields struct {
	Label       string
	Description string
	Type        string
	Tags        []*model.Tag
}

// resolveItemFields merges an optional template (nil for custom items) with
// per-instance overrides into final display values. An override wins over the
// template's value when set; tags are merged by key so an override can add to
// or replace individual template tags without restating the whole set. Shared
// by ItemOptionModel (class starting gear, not persisted) and ItemModel (a
// character's owned equipment, persisted) since both follow the same
// template-plus-overrides shape.
func resolveItemFields(label, description, itemType *string, tags []*TagModel, t *ItemTemplateModel, td *TagDefinitionMap) resolvedItemFields {
	resolvedDescription := ""
	if description != nil {
		resolvedDescription = *description
	} else if t != nil && t.Description != nil {
		resolvedDescription = *t.Description
	}

	resolvedLabel := ""
	if label != nil {
		resolvedLabel = *label
	} else if t != nil {
		resolvedLabel = t.Name
	}

	resolvedType := ""
	if itemType != nil {
		resolvedType = *itemType
	} else if t != nil {
		resolvedType = t.Type
	}

	var templateTags []*TagModel
	if t != nil {
		templateTags = t.Tags
	}

	mergedTags := mergeTags(templateTags, tags)
	tagObjects := make([]*model.Tag, len(mergedTags))
	for i, tg := range mergedTags {
		tagObjects[i] = tg.ToObject(td)
	}

	return resolvedItemFields{
		Label:       resolvedLabel,
		Description: resolvedDescription,
		Type:        resolvedType,
		Tags:        tagObjects,
	}
}

// mergeTags overrides base (a template's tags) with any tag in overrides
// that shares its key, keeping the rest of base as-is. Appropriate when one
// side is the "default" and the other is a deliberate instance override —
// contrast mergeTagsAdditive (item_hooks.go), which sums quantities across
// several peer contributions instead.
func mergeTags(base, overrides []*TagModel) []*TagModel {
	tagMap := make(map[string]*TagModel, len(base)+len(overrides))
	for _, t := range base {
		tagMap[t.Key] = t
	}
	for _, t := range overrides {
		tagMap[t.Key] = t
	}

	return slices.Collect(maps.Values(tagMap))
}
