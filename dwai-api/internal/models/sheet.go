package models

import (
	"fmt"
	"slices"

	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
)

// Rules for the values a character sheet tracks during play: derived stats
// (max HP, armor, load) and the changes players make (damage, healing,
// gold). See docs/game/rules.md, "Derived Values".

// MaxHitPoints is the class's base HP plus the Constitution score (the full
// score, not the modifier).
func MaxHitPoints(class *CharacterClassModel, constitution int32) int32 {
	return class.HpBase + constitution
}

// MaxLoad is the class's base load plus the Strength modifier.
func MaxLoad(class *CharacterClassModel, strength int32) int32 {
	return int32(class.StartingGear.LoadBase) + AbilityModifier(strength)
}

// tagQuantity returns the quantity of the item's tag with key, and whether
// the item has that tag at all. A simple tag (no quantity) counts as 0.
func tagQuantity(item *model.Item, key string) (int32, bool) {
	for _, tag := range item.Tags {
		if tag.Key != key {
			continue
		}
		if tag.Quantity == nil {
			return 0, true
		}
		return *tag.Quantity, true
	}

	return 0, false
}

// Armor is the highest armor value among worn armor, plus every armor bonus
// on worn armor and on shields.
func Armor(items []*model.Item) int32 {
	var armor, bonus int32

	for _, item := range items {
		switch {
		case item.Type == "armor" && item.IsWorn:
			if value, ok := tagQuantity(item, "armor"); ok {
				armor = max(armor, value)
			}
			if value, ok := tagQuantity(item, "armor_bonus"); ok {
				bonus += value
			}
		case item.Type == "shield":
			if value, ok := tagQuantity(item, "armor_bonus"); ok {
				bonus += value
			}
		}
	}

	return armor + bonus
}

// Load is the total weight carried: each item's weight times its count.
func Load(items []*model.Item) int32 {
	var load int32

	for _, item := range items {
		if weight, ok := tagQuantity(item, "weight"); ok {
			load += weight * item.Count
		}
	}

	return load
}

// DamageInput is a hit taken by a character, before armor.
type DamageInput struct {
	Amount       int32
	IgnoresArmor bool
	Piercing     int32
}

// Validate reports problems with the damage input as validation errors.
func (d DamageInput) Validate() []ValidationError {
	var errs []ValidationError

	if d.Amount < 0 {
		errs = append(errs, ValidationError{Field: "amount", Message: "Damage can't be negative."})
	}
	if d.Piercing < 0 {
		errs = append(errs, ValidationError{Field: "piercing", Message: "Piercing can't be negative."})
	}

	return errs
}

// DamageTaken is the HP lost to a hit: the damage minus armor (armor reduced
// by piercing, or ignored entirely), never below 0.
func DamageTaken(d DamageInput, armor int32) int32 {
	effectiveArmor := max(0, armor-d.Piercing)
	if d.IgnoresArmor {
		effectiveArmor = 0
	}

	return max(0, d.Amount-effectiveArmor)
}

// ApplyDamage returns the character's HP after a hit. HP doesn't drop below 0.
func ApplyDamage(hitPoints int32, d DamageInput, armor int32) int32 {
	return max(0, hitPoints-DamageTaken(d, armor))
}

// Heal returns the character's HP after healing amount, capped at max HP.
// Healing never lowers HP that's already above the maximum (for example
// after the maximum dropped).
func Heal(hitPoints, maxHitPoints, amount int32) (int32, error) {
	if amount < 0 {
		return hitPoints, ValidationError{Field: "amount", Message: "Healing can't be negative."}
	}

	return max(hitPoints, min(maxHitPoints, hitPoints+amount)), nil
}

// AdjustGold returns the character's gold after adding delta, which may be
// negative. The result can't go below 0.
func AdjustGold(gold, delta int32) (int32, error) {
	if gold+delta < 0 {
		return gold, ValidationError{
			Field:   "delta",
			Message: fmt.Sprintf("Not enough gold: the character has %d.", gold),
		}
	}

	return gold + delta, nil
}

// SetDebility returns the character's debilities with debility set or
// cleared, sorted and without duplicates.
func SetDebility(debilities []string, debility model.Debility, active bool) []string {
	result := slices.DeleteFunc(slices.Clone(debilities), func(d string) bool {
		return d == string(debility)
	})
	if active {
		result = append(result, string(debility))
	}
	slices.Sort(result)

	return result
}

// ValidateItemCount reports a count below 1 as a validation error. Removing
// an item is a separate action.
func ValidateItemCount(count int32) error {
	if count < 1 {
		return ValidationError{Field: "count", Message: "Count must be at least 1. Remove the item instead."}
	}

	return nil
}

// ValidateAddItemInput reports every problem with an item being added: an
// unknown template, a custom item without a label, a count below 1, or a
// tag that isn't in the tag catalog.
func ValidateAddItemInput(input model.AddItemInput, templates *ItemTemplateMap, tags *TagDefinitionMap) []ValidationError {
	var errs []ValidationError

	if input.Key == "custom" {
		if input.Label == nil || *input.Label == "" {
			errs = append(errs, ValidationError{Field: "label", Message: "A custom item needs a label."})
		}
	} else if _, ok := (*templates)[input.Key]; !ok {
		errs = append(errs, ValidationError{Field: "key", Message: fmt.Sprintf("Unknown item template '%s'.", input.Key)})
	}

	if err := ValidateItemCount(input.Count); err != nil {
		errs = append(errs, err.(ValidationError))
	}

	for _, tag := range input.Tags {
		if _, ok := (*tags)[tag.Key]; !ok {
			errs = append(errs, ValidationError{Field: "tags", Message: fmt.Sprintf("Unknown tag '%s'.", tag.Key)})
		}
		if tag.Quantity != nil && *tag.Quantity < 0 {
			errs = append(errs, ValidationError{Field: "tags", Message: fmt.Sprintf("Tag '%s' can't have a negative quantity.", tag.Key)})
		}
	}

	return errs
}
