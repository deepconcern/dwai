package models

import (
	"maps"
	"slices"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
)

// GearItemModel represents a single item in starting gear.
// In YAML it can appear as either a plain string (key shorthand) or a mapping.
//
//	# Common item — key reference into equipment.yaml
//	- dungeon_rations
//
//	# Keyed item with explicit uses (overrides the default from equipment.yaml)
//	- key: dungeon_rations
//	  uses: 5
//
//	# Custom item — standalone, inline stats
//	- label: "Your father's mandolin, repaired"
//	  weight: 0
//
//	# Stackable resource — count without tracked uses
//	- label: 3 coins
//	  count: 3
//
//	# Custom item that inherits stats from a base item in equipment.yaml
//	- base: sword
//	  label: "Signature sword (your family heirloom)"
//	  description: "A worn but keen blade."
type GearItemModel struct {
	// Count is the quantity of a stackable, non-consumed resource (e.g. coins).
	// Distinct from Uses: count items are spent whole, not ticked off one at a time.
	Count *int32 `yaml:"count"`

	// Description is flavour/rules text for custom items.
	Description *string `yaml:"description"`

	// Key is set when the item is a plain string shorthand or an explicit key
	// field. It references an entry in equipment.yaml.
	Key *string `yaml:"key"`

	// Label is the display name for custom items (and optional override for
	// keyed items).
	Label *string `yaml:"label"`

	Tags []*TagModel `yaml:"tags"`
}

func (g *GearItemModel) ToObject(e *EquipmentModel, td *TagDefinitionMap) *model.GearItem {
	count := int32(1)
	if g.Count != nil {
		count = *g.Count
	}

	description := ""
	if g.Description != nil {
		description = *g.Description
	} else if e != nil && e.Description != nil {
		description = *e.Description
	}

	key := "custom"
	if g.Key != nil {
		key = *g.Key
	} else if e != nil {
		key = e.Key
	}

	label := ""
	if g.Label != nil {
		label = *g.Label
	} else if e != nil {
		label = e.Name
	}

	tagMap := make(map[string]*model.Tag, len(g.Tags))
	if e != nil {
		for _, t := range e.Tags {
			tagMap[t.Key] = t.ToObject(td)
		}
	}
	for _, t := range g.Tags {
		tagMap[t.Key] = t.ToObject(td)
	}

	return &model.GearItem{
		Count:       count,
		Description: description,
		Key:         key,
		Label:       label,
		Tags:        slices.Collect(maps.Values(tagMap)),
	}
}

// UnmarshalYAML handles the plain-string shorthand: a bare string becomes a Key
// reference. Mapping form is decoded normally.
func (g *GearItemModel) UnmarshalYAML(unmarshal func(any) error) error {
	// Try plain string first
	var key string
	if err := unmarshal(&key); err == nil {
		g.Key = &key
		return nil
	}

	// Fall back to full mapping — use an alias to avoid infinite recursion
	type alias GearItemModel
	var a alias
	if err := unmarshal(&a); err != nil {
		return err
	}
	*g = GearItemModel(a)
	return nil
}

// GearOptionGroupModel is a "pick N from these choices" group in starting gear.
type GearOptionGroupModel struct {
	Pick    int                `yaml:"pick"`
	Choices [][]*GearItemModel `yaml:"choices"`
}

func (g *GearOptionGroupModel) ToObject(e *EquipmentMap, td *TagDefinitionMap) *model.GearOptionGroup {
	choices := make([][]*model.GearItem, len(g.Choices))

	for choiceIndex, itemModels := range g.Choices {
		items := make([]*model.GearItem, len(itemModels))

		for itemIndex, i := range itemModels {
			if i.Key == nil {
				items[itemIndex] = i.ToObject(nil, td)
			} else {
				items[itemIndex] = i.ToObject((*e)[*i.Key], td)
			}
		}

		choices[choiceIndex] = items
	}

	return &model.GearOptionGroup{Choices: choices, Pick: int32(g.Pick)}
}

// StartingGearModel holds all starting gear for a character class.
type StartingGearModel struct {
	LoadBase int                    `yaml:"load_base"`
	Default  []*GearItemModel       `yaml:"default"`
	Options  []GearOptionGroupModel `yaml:"options"`
}

func (g *StartingGearModel) ToObject(e *EquipmentMap, td *TagDefinitionMap) *model.StartingGear {
	defaultItems := make([]*model.GearItem, len(g.Default))
	for i, d := range g.Default {
		if d.Key == nil {
			defaultItems[i] = d.ToObject(nil, td)
			continue
		}

		equipment := (*e)[*d.Key]
		defaultItems[i] = d.ToObject(equipment, td)
	}

	options := make([]*model.GearOptionGroup, len(g.Options))
	for i, opt := range g.Options {
		options[i] = opt.ToObject(e, td)
	}
	return &model.StartingGear{
		Default:  defaultItems,
		LoadBase: int32(g.LoadBase),
		Options:  options,
	}
}
