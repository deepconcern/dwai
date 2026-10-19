//go:build integration

package graph_test

import (
	"testing"

	"github.com/99designs/gqlgen/client"
	"github.com/deepconcern/dwai/dwai-api/internal/models/modelstest"
)

const setWornMutation = `
mutation ($id: ID!, $worn: Boolean!) {
	items {
		setWorn(id: $id, worn: $worn) {
			id
			key
			label
			description
			type
			count
			isWorn
			tags { key quantity }
		}
	}
}`

func setWorn(t *testing.T, c *client.Client, id string, worn bool) itemResponse {
	t.Helper()

	var resp struct {
		Items struct{ SetWorn itemResponse }
	}
	if err := c.Post(setWornMutation, &resp, client.Var("id", id), client.Var("worn", worn)); err != nil {
		t.Fatalf("set worn %v on item %s: %v", worn, id, err)
	}

	return resp.Items.SetWorn
}

func TestSetWorn(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)

	// The first pick in the Fighter's first gear group is scale armor.
	created := createCharacter(t, c, modelstest.ValidCreateCharacterInput(characterClass(t, "fighter")))
	armor := findItem(t, created.Equipment, "scale armor", func(item itemResponse) bool {
		return item.Key == "scale_armor"
	})
	if armor.IsWorn {
		t.Fatal("new armor is already worn")
	}

	for _, worn := range []bool{true, false} {
		got := setWorn(t, c, armor.ID, worn)

		if got.ID != armor.ID || got.IsWorn != worn {
			t.Errorf("setWorn(%v) returned item %s with isWorn %v", worn, got.ID, got.IsWorn)
		}
		// The returned item is resolved like any other, from its template.
		if got.Label != armor.Label || tagQuantities(got)["armor"] != "2" {
			t.Errorf("setWorn(%v) returned label %q, tags %v; want %q with armor 2", worn, got.Label, tagQuantities(got), armor.Label)
		}

		// Only the armor changed, and the change was stored.
		for _, item := range characterByID(t, c, created.ID).Equipment {
			want := item.ID == armor.ID && worn
			if item.IsWorn != want {
				t.Errorf("after setWorn(%v): %s isWorn = %v, want %v", worn, item.Label, item.IsWorn, want)
			}
		}
	}
}

func TestSetWornErrors(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)

	for name, id := range map[string]string{
		"unknown":   "999999",
		"malformed": "abc",
	} {
		t.Run(name, func(t *testing.T) {
			_ = postErrors(t, c, setWornMutation, client.Var("id", id), client.Var("worn", true)) // fails the test if there are no errors
		})
	}
}
