package models

import (
	"maps"
	"slices"
	"strings"
)

// SpecialItemContext is what a special item resolver gets beyond the
// ItemOptionModel itself: the class it belongs to (to look up its moves)
// and the creation-option choices the player made for those moves.
type SpecialItemContext struct {
	CharacterClass *CharacterClassModel
	MoveChoices    map[string]map[int32][]string
}

// specialItemFields is what a special item resolver produces: the item's
// final label/description/type/tags. Unlike the standard path, these are
// final, not overrides — a special item has no template to defer to.
type specialItemFields struct {
	Label       string
	Description string
	Type        string
	Tags        []*TagModel
}

// specialItemResolver computes an item's final fields from something other
// than a template plus static overrides — most often the player's
// creation-option choices for one of the class's moves.
type specialItemResolver func(ctx SpecialItemContext, item *ItemOptionModel) specialItemFields

// specialItemResolvers is the extension point for starting-gear items (and,
// if a future general rule needs it, any other item) whose data can't be
// expressed as a template plus static overrides. To add a new case: write a
// resolver function, register it here under a name, and set that name on
// the relevant ItemOptionModel's `special` field in the class's YAML.
// Nothing else needs to change — ResolveStartingGearItem (gear.go) and
// Create (characters.resolvers.go) dispatch through this map without
// knowing any individual case exists.
var specialItemResolvers = map[string]specialItemResolver{
	"signature_weapon": resolveSignatureWeapon,
}

// resolveSignatureWeapon builds the Fighter's Signature Weapon from the
// player's picks for the signature_weapon move's creation options: Base
// (group 0), Range (1), Enhancements (2), Look (3) — see fighter.yaml.
//
// Only picks with structured Tags contribute tags (a base's weight, a
// range, Sharp's piercing, Serrated Edges'/Hooks and Spikes' damage bonus,
// Well-crafted's weight reduction, Perfectly Weighted's precise). Huge and
// Versatile don't yet have a tag-catalog equivalent (tags.yaml has no
// "messy"/"forceful", and Versatile grants a choice rather than a fixed
// value) and Glows is pure flavour, so all three are folded into the
// description instead of being silently dropped.
func resolveSignatureWeapon(ctx SpecialItemContext, item *ItemOptionModel) specialItemFields {
	moves := ctx.CharacterClass.StartingMoves

	base := pickedChoices(ctx, "signature_weapon", 0, moves)
	rng := pickedChoices(ctx, "signature_weapon", 1, moves)
	enhancements := pickedChoices(ctx, "signature_weapon", 2, moves)
	look := pickedChoices(ctx, "signature_weapon", 3, moves)

	label := "Signature Weapon"
	switch {
	case len(look) > 0 && len(base) > 0:
		label = look[0].Label + " " + base[0].Label
	case len(base) > 0:
		label = base[0].Label
	}

	var description strings.Builder
	if item.Description != nil {
		description.WriteString(*item.Description)
	}

	var tagSources [][]*TagModel
	for _, choice := range slices.Concat(base, rng, enhancements, look) {
		if choice.Tags != nil {
			tagSources = append(tagSources, choice.Tags)
			continue
		}
		if choice.Description != nil {
			description.WriteString(" ")
			description.WriteString(*choice.Description)
		}
	}

	return specialItemFields{
		Label:       label,
		Description: strings.TrimSpace(description.String()),
		Type:        "weapon",
		Tags:        mergeTagsAdditive(tagSources...),
	}
}

// pickedChoices returns the creation-option choices the player picked at
// groupIndex within moveKey, in the order they appear in the move's data —
// or nil if the move, the group, or a pick doesn't exist.
func pickedChoices(ctx SpecialItemContext, moveKey string, groupIndex int, moves []*ClassMoveModel) []*MoveCreationChoiceModel {
	moveIndex := slices.IndexFunc(moves, func(m *ClassMoveModel) bool { return m.Key == moveKey })
	if moveIndex == -1 || groupIndex >= len(moves[moveIndex].CreationOptions) {
		return nil
	}

	group := moves[moveIndex].CreationOptions[groupIndex]
	pickedKeys := ctx.MoveChoices[moveKey][int32(groupIndex)]

	picked := make([]*MoveCreationChoiceModel, 0, len(pickedKeys))
	for _, choice := range group.Choices {
		if slices.Contains(pickedKeys, choice.Key) {
			picked = append(picked, choice)
		}
	}

	return picked
}

// mergeTagsAdditive combines tags from multiple creation-option choices
// contributing to one item. Quantified tags with the same key sum their
// quantities (so a base weapon's weight and an enhancement's weight
// modifier stack instead of one clobbering the other); simple tags are
// deduplicated. This differs from mergeTags (item-template.go), which is an
// override — appropriate for a single template plus a single set of
// instance overrides, but wrong here since every source is a peer
// contribution, not an override of the last.
func mergeTagsAdditive(sources ...[]*TagModel) []*TagModel {
	merged := make(map[string]*TagModel)

	for _, tags := range sources {
		for _, t := range tags {
			existing, ok := merged[t.Key]
			if !ok {
				tagCopy := *t
				merged[t.Key] = &tagCopy
				continue
			}

			if existing.Quantity != nil && t.Quantity != nil {
				sum := *existing.Quantity + *t.Quantity
				existing.Quantity = &sum
			}
		}
	}

	return slices.Collect(maps.Values(merged))
}
