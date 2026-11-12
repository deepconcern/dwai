//go:build integration

package graph_test

import (
	"cmp"
	"slices"
	"testing"

	"github.com/99designs/gqlgen/client"
)

const addItemMutation = `
mutation ($characterId: ID!, $input: AddItemInput!) {
	items { add(characterId: $characterId, input: $input) { ...CharacterFields } }
}` + characterFields

const removeItemMutation = `
mutation ($id: ID!) {
	items { remove(id: $id) { ...CharacterFields } }
}` + characterFields

const setCountMutation = `
mutation ($id: ID!, $count: Int!) {
	items { setCount(id: $id, count: $count) { count } }
}`

const itemTemplatesQuery = `
{
	itemTemplates { all { key label tags { name } } }
}`

func addItem(t *testing.T, c *client.Client, characterID string, input map[string]any) characterResponse {
	t.Helper()

	return postCharacter(t, c, addItemMutation, "items", "add", client.Var("characterId", characterID), client.Var("input", input))
}

// newItem returns the item in after that isn't in before.
func newItem(t *testing.T, before, after characterResponse) itemResponse {
	t.Helper()

	return findItem(t, after.Equipment, "new item", func(item itemResponse) bool {
		return !slices.ContainsFunc(before.Equipment, func(old itemResponse) bool { return old.ID == item.ID })
	})
}

func TestAddAndRemoveItems(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c)

	// A template item: its data comes from the template, weight 1 each.
	withGear := addItem(t, c, fighter.ID, map[string]any{"key": "adventuring_gear", "count": 2})
	gear := newItem(t, fighter, withGear)
	if gear.Label != "Adventuring Gear" || gear.Count != 2 || tagQuantities(gear)["weight"] != "1" {
		t.Errorf("added template item %+v", gear)
	}
	if withGear.Load != fighter.Load+2 {
		t.Errorf("load after adding 2 adventuring gear = %d, want %d", withGear.Load, fighter.Load+2)
	}

	// A custom item: label, description, type, and tags come from the input.
	withIdol := addItem(t, c, fighter.ID, map[string]any{
		"description": "Heavy and ugly.",
		"label":       "Stone idol",
		"tags":        []map[string]any{{"key": "weight", "quantity": 3}},
		"type":        "treasure",
	})
	idol := newItem(t, withGear, withIdol)
	if idol.Key != "custom" || idol.Label != "Stone idol" || idol.Description != "Heavy and ugly." || idol.Type != "treasure" || idol.Count != 1 {
		t.Errorf("added custom item %+v", idol)
	}
	if withIdol.Load != withGear.Load+3 {
		t.Errorf("load after adding the idol = %d, want %d", withIdol.Load, withGear.Load+3)
	}

	// Changing the count changes the load.
	var countResp struct {
		Items struct{ SetCount struct{ Count int32 } }
	}
	if err := c.Post(setCountMutation, &countResp, client.Var("id", gear.ID), client.Var("count", 5)); err != nil {
		t.Fatalf("setCount: %v", err)
	}
	if countResp.Items.SetCount.Count != 5 {
		t.Errorf("setCount returned count %d, want 5", countResp.Items.SetCount.Count)
	}
	if got := characterByID(t, c, fighter.ID).Load; got != withIdol.Load+3 {
		t.Errorf("load after setting gear count to 5 = %d, want %d", got, withIdol.Load+3)
	}

	// Removing items brings the load back down.
	postCharacter(t, c, removeItemMutation, "items", "remove", client.Var("id", gear.ID))
	afterRemove := postCharacter(t, c, removeItemMutation, "items", "remove", client.Var("id", idol.ID))
	if len(afterRemove.Equipment) != len(fighter.Equipment) || afterRemove.Load != fighter.Load {
		t.Errorf("after removing both: %d items, load %d; want %d items, load %d",
			len(afterRemove.Equipment), afterRemove.Load, len(fighter.Equipment), fighter.Load)
	}
}

func TestAddItemErrors(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c)

	for _, tc := range []struct {
		name      string
		input     map[string]any
		wantField string
	}{
		{name: "unknown template", input: map[string]any{"key": "no_such_item"}, wantField: "key"},
		{name: "custom without a label", input: map[string]any{"key": "custom"}, wantField: "label"},
		{name: "zero count", input: map[string]any{"key": "adventuring_gear", "count": 0}, wantField: "count"},
		{name: "unknown tag", input: map[string]any{"label": "Thing", "tags": []map[string]any{{"key": "shiny"}}}, wantField: "tags"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			errs := postErrors(t, c, addItemMutation, client.Var("characterId", fighter.ID), client.Var("input", tc.input))
			wantValidationError(t, errs, tc.wantField)
		})
	}

	if got := characterByID(t, c, fighter.ID); len(got.Equipment) != len(fighter.Equipment) {
		t.Errorf("rejected adds changed the equipment: %d items, want %d", len(got.Equipment), len(fighter.Equipment))
	}

	t.Run("unknown character", func(t *testing.T) {
		_ = postErrors(t, c, addItemMutation,
			client.Var("characterId", "00000000-0000-0000-0000-000000000000"),
			client.Var("input", map[string]any{"key": "adventuring_gear"}))
	})
}

func TestRemoveAndSetCountErrors(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	fighter := createFighter(t, c)
	item := fighter.Equipment[0]

	wantValidationError(t, postErrors(t, c, setCountMutation, client.Var("id", item.ID), client.Var("count", 0)), "count")

	for name, id := range map[string]string{
		"unknown":   "999999",
		"malformed": "abc",
	} {
		t.Run(name, func(t *testing.T) {
			_ = postErrors(t, c, removeItemMutation, client.Var("id", id))
			_ = postErrors(t, c, setCountMutation, client.Var("id", id), client.Var("count", 2))
		})
	}
}

type itemTemplateResponse struct {
	Key   string
	Label string
	Tags  []struct{ Name string }
}

func TestItemTemplates(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)

	var resp struct {
		ItemTemplates struct {
			All []itemTemplateResponse
		}
	}
	if err := c.Post(itemTemplatesQuery, &resp); err != nil {
		t.Fatalf("itemTemplates: %v", err)
	}

	templates := resp.ItemTemplates.All
	if len(templates) != len(*env.GameData.ItemTemplateMap) {
		t.Errorf("got %d templates, want %d", len(templates), len(*env.GameData.ItemTemplateMap))
	}
	if !slices.IsSortedFunc(templates, func(a, b itemTemplateResponse) int { return cmp.Compare(a.Label, b.Label) }) {
		t.Error("templates aren't sorted by label")
	}
}
