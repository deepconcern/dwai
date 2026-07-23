package models

import (
	"fmt"

	"github.com/deepconcern/dwai/dwai-api/graph/model"
)

// ItemOptionModel represents a single item in a class's starting gear — a
// choice a player may receive automatically or pick from during character
// creation, not yet an owned Item. In YAML it can appear as either a plain
// string (key shorthand) or a mapping.
//
//	# Common item — key reference into item_templates.yaml
//	- dungeon_rations
//
//	# Keyed item with explicit uses (overrides the default from item_templates.yaml)
//	- key: dungeon_rations
//	  uses: 5
//
//	# Custom item — standalone, inline stats
//	- label: "Your father's mandolin, repaired"
//	  weight: 0
//
//	# Starting gold — not an item, adds directly to Character.gold
//	- gold: 3
type ItemOptionModel struct {
	// Count is the quantity of a stackable, non-consumed resource (e.g. coins).
	// Distinct from Uses: count items are spent whole, not ticked off one at a time.
	Count *int32 `yaml:"count"`

	// Description is flavour/rules text for custom items.
	Description *string `yaml:"description"`

	// Gold marks this entry as a fixed amount of starting gold rather than
	// an item: at character creation it's added to Character.gold and no
	// item row is created for it. When set, Count/Description/Key/Label/
	// Special/Tags are unused.
	Gold *int32 `yaml:"gold"`

	// Key is set when the item is a plain string shorthand or an explicit key
	// field. It references an entry in item_templates.yaml.
	Key *string `yaml:"key"`

	// Label is the display name for custom items (and optional override for
	// keyed items).
	Label *string `yaml:"label"`

	// Special names a hook in specialItemResolvers (see item_hooks.go) that
	// computes this item's final label/description/tags at character
	// creation instead of the standard template-plus-overrides resolution —
	// for items whose data depends on other choices the player made (e.g.
	// the Fighter's Signature Weapon). Empty for the common case.
	Special string `yaml:"special"`

	Tags []*TagModel `yaml:"tags"`
}

func (g *ItemOptionModel) ToObject(t *ItemTemplateModel, td *TagDefinitionMap) *model.ItemOption {
	if g.Gold != nil {
		return &model.ItemOption{
			Count:       *g.Gold,
			Description: "",
			Key:         "gold",
			Label:       fmt.Sprintf("%d Gold", *g.Gold),
			Tags:        []*model.Tag{},
		}
	}

	count := int32(1)
	if g.Count != nil {
		count = *g.Count
	}

	key := "custom"
	if g.Key != nil {
		key = *g.Key
	} else if t != nil {
		key = t.Key
	}

	fields := resolveItemFields(g.Label, g.Description, g.Tags, t, td)

	return &model.ItemOption{
		Count:       count,
		Description: fields.Description,
		Key:         key,
		Label:       fields.Label,
		Tags:        fields.Tags,
	}
}

// UnmarshalYAML handles the plain-string shorthand: a bare string becomes a Key
// reference. Mapping form is decoded normally.
func (g *ItemOptionModel) UnmarshalYAML(unmarshal func(any) error) error {
	// Try plain string first
	var key string
	if err := unmarshal(&key); err == nil {
		g.Key = &key
		return nil
	}

	// Fall back to full mapping — use an alias to avoid infinite recursion
	type alias ItemOptionModel
	var a alias
	if err := unmarshal(&a); err != nil {
		return err
	}
	*g = ItemOptionModel(a)
	return nil
}

// GearOptionGroupModel is a "pick N from these choices" group in starting gear.
type GearOptionGroupModel struct {
	Pick    int                  `yaml:"pick"`
	Choices [][]*ItemOptionModel `yaml:"choices"`
}

func (g *GearOptionGroupModel) ToObject(t *ItemTemplateMap, td *TagDefinitionMap) *model.GearOptionGroup {
	choices := make([][]*model.ItemOption, len(g.Choices))

	for choiceIndex, itemModels := range g.Choices {
		items := make([]*model.ItemOption, len(itemModels))

		for itemIndex, i := range itemModels {
			if i.Key == nil {
				items[itemIndex] = i.ToObject(nil, td)
			} else {
				items[itemIndex] = i.ToObject((*t)[*i.Key], td)
			}
		}

		choices[choiceIndex] = items
	}

	return &model.GearOptionGroup{Choices: choices, Pick: int32(g.Pick)}
}

// StartingGearModel holds all starting gear for a character class.
type StartingGearModel struct {
	LoadBase int                    `yaml:"load_base"`
	Default  []*ItemOptionModel     `yaml:"default"`
	Options  []GearOptionGroupModel `yaml:"options"`
}

func (g *StartingGearModel) ToObject(t *ItemTemplateMap, td *TagDefinitionMap) *model.StartingGear {
	defaultItems := make([]*model.ItemOption, len(g.Default))
	for i, d := range g.Default {
		if d.Key == nil {
			defaultItems[i] = d.ToObject(nil, td)
			continue
		}

		itemTemplate := (*t)[*d.Key]
		defaultItems[i] = d.ToObject(itemTemplate, td)
	}

	options := make([]*model.GearOptionGroup, len(g.Options))
	for i, opt := range g.Options {
		options[i] = opt.ToObject(t, td)
	}
	return &model.StartingGear{
		Default:  defaultItems,
		LoadBase: int32(g.LoadBase),
		Options:  options,
	}
}

// StartingGearContext carries what's needed to turn a class's starting gear
// into concrete owned items at character creation: the class itself and the
// creation-option picks the player made for its moves, for items resolved
// by a hook in item_hooks.go rather than the standard key/template path.
type StartingGearContext struct {
	CharacterClass *CharacterClassModel
	MoveChoices    map[string]map[int32][]string
}

// ResolvedStartingItem is a starting-gear item ready to persist as an owned
// item row. For keyed items it deliberately carries only the item's own
// overrides — not merged with the template — so the item stays linked to
// its template and picks up future template edits, the same way ToItemObject
// resolves an owned item's fields against the template at read time.
type ResolvedStartingItem struct {
	Count       int32
	Description *string
	Key         string
	Label       *string
	Tags        []*TagModel
}

// ResolveStartingGearItem turns a single ItemOptionModel into a
// ResolvedStartingItem. If item.Special names a registered hook, the hook
// computes the final (not merely override) fields, since a special item has
// no template to defer to; otherwise the item's own key/label/description/
// tags pass through unchanged for storage.
func ResolveStartingGearItem(ctx StartingGearContext, item *ItemOptionModel) ResolvedStartingItem {
	count := int32(1)
	if item.Count != nil {
		count = *item.Count
	}

	if hook, ok := specialItemResolvers[item.Special]; ok {
		fields := hook(SpecialItemContext{
			CharacterClass: ctx.CharacterClass,
			MoveChoices:    ctx.MoveChoices,
		}, item)

		return ResolvedStartingItem{
			Count:       count,
			Description: &fields.Description,
			Key:         "custom",
			Label:       &fields.Label,
			Tags:        fields.Tags,
		}
	}

	key := "custom"
	if item.Key != nil {
		key = *item.Key
	}

	return ResolvedStartingItem{
		Count:       count,
		Description: item.Description,
		Key:         key,
		Label:       item.Label,
		Tags:        item.Tags,
	}
}

// ResolvedStartingGear is a class's starting gear resolved for a specific
// character at creation: items ready to persist as owned equipment, plus
// gold to add directly to the character (see ItemOptionModel.Gold).
type ResolvedStartingGear struct {
	Gold  int32
	Items []ResolvedStartingItem
}

// ResolveItems returns everything a character receives from this starting
// gear: the class's defaults, plus the items and gold behind each picked
// choice in optionChoices. Out-of-range option/choice indices are skipped
// rather than erroring, so a stale or partial selection doesn't block
// character creation.
func (g *StartingGearModel) ResolveItems(ctx StartingGearContext, optionChoices []*model.GearOptionChoiceInput) ResolvedStartingGear {
	resolved := ResolvedStartingGear{Items: make([]ResolvedStartingItem, 0, len(g.Default))}

	resolveOne := func(item *ItemOptionModel) {
		if item.Gold != nil {
			resolved.Gold += *item.Gold
			return
		}

		resolved.Items = append(resolved.Items, ResolveStartingGearItem(ctx, item))
	}

	for _, d := range g.Default {
		resolveOne(d)
	}

	for _, picked := range optionChoices {
		if picked.OptionIndex < 0 || int(picked.OptionIndex) >= len(g.Options) {
			continue
		}

		choices := g.Options[picked.OptionIndex].Choices

		for _, choiceIndex := range picked.ChoiceIndices {
			if choiceIndex < 0 || int(choiceIndex) >= len(choices) {
				continue
			}

			for _, item := range choices[choiceIndex] {
				resolveOne(item)
			}
		}
	}

	return resolved
}
