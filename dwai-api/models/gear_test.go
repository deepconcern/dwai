package models

import (
	"slices"
	"testing"
)

func ptr[T any](v T) *T {
	return &v
}

func TestMergeIdenticalItems(t *testing.T) {
	items := []ResolvedStartingItem{
		{Count: 1, Key: "healing_potion"},
		{Count: 3, Key: "adventuring_gear"},
		{Count: 1, Key: "healing_potion"},
	}

	merged := mergeIdenticalItems(items)

	if len(merged) != 2 {
		t.Fatalf("expected 2 items, got %d", len(merged))
	}
	if merged[0].Key != "healing_potion" || merged[0].Count != 2 {
		t.Errorf("expected healing_potion x2 first, got %s x%d", merged[0].Key, merged[0].Count)
	}
	if merged[1].Key != "adventuring_gear" || merged[1].Count != 3 {
		t.Errorf("expected adventuring_gear x3 second, got %s x%d", merged[1].Key, merged[1].Count)
	}
}

func TestMergeIdenticalItemsKeepsDistinctOverrides(t *testing.T) {
	items := []ResolvedStartingItem{
		{Count: 1, Key: "custom", Label: ptr("Rope")},
		{Count: 1, Key: "custom", Label: ptr("Torch")},
	}

	if merged := mergeIdenticalItems(items); len(merged) != 2 {
		t.Fatalf("expected items with different labels to stay separate, got %d", len(merged))
	}
}

func TestMergeIdenticalItemsIgnoresTagOrder(t *testing.T) {
	items := []ResolvedStartingItem{
		{Count: 1, Key: "custom", Tags: []*TagModel{{Key: "close"}, {Key: "weight", Quantity: ptr(int32(1))}}},
		{Count: 1, Key: "custom", Tags: []*TagModel{{Key: "weight", Quantity: ptr(int32(1))}, {Key: "close"}}},
	}

	merged := mergeIdenticalItems(items)

	if len(merged) != 1 || merged[0].Count != 2 {
		t.Fatalf("expected one merged item with count 2, got %d items", len(merged))
	}
}

func TestResolveItemFields(t *testing.T) {
	td := &TagDefinitionMap{
		"close":  {Key: "close", Name: "Close"},
		"weight": {Key: "weight", Name: "n Weight"},
	}
	template := &ItemTemplateModel{
		Description: ptr("A sturdy blade."),
		Key:         "short_sword",
		Name:        "Short Sword",
		Tags:        []*TagModel{{Key: "close"}, {Key: "weight", Quantity: ptr(int32(1))}},
		Type:        "weapon",
	}

	t.Run("falls back to the template", func(t *testing.T) {
		fields := resolveItemFields(nil, nil, nil, nil, template, td)

		if fields.Label != "Short Sword" || fields.Description != "A sturdy blade." || fields.Type != "weapon" {
			t.Errorf("unexpected fields: %+v", fields)
		}
		if len(fields.Tags) != 2 {
			t.Errorf("expected 2 template tags, got %d", len(fields.Tags))
		}
	})

	t.Run("overrides win over the template", func(t *testing.T) {
		tags := []*TagModel{{Key: "weight", Quantity: ptr(int32(2))}}
		fields := resolveItemFields(ptr("Old Sword"), ptr("Rusty."), ptr("heirloom"), tags, template, td)

		if fields.Label != "Old Sword" || fields.Description != "Rusty." || fields.Type != "heirloom" {
			t.Errorf("unexpected fields: %+v", fields)
		}

		keys := make([]string, len(fields.Tags))
		for i, tag := range fields.Tags {
			keys[i] = tag.Key
			if tag.Key == "weight" && (tag.Quantity == nil || *tag.Quantity != 2) {
				t.Errorf("expected overridden weight 2, got %v", tag.Quantity)
			}
		}
		slices.Sort(keys)
		if !slices.Equal(keys, []string{"close", "weight"}) {
			t.Errorf("expected tags [close weight], got %v", keys)
		}
	})

	t.Run("custom items have no template", func(t *testing.T) {
		fields := resolveItemFields(ptr("Lucky Coin"), nil, nil, nil, nil, td)

		if fields.Label != "Lucky Coin" || fields.Description != "" || fields.Type != "" || len(fields.Tags) != 0 {
			t.Errorf("unexpected fields: %+v", fields)
		}
	})
}
