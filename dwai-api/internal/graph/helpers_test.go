//go:build integration

package graph_test

import (
	"encoding/json"
	"strconv"
	"testing"

	"github.com/99designs/gqlgen/client"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

// characterFields is everything the tests assert on for a character. Every
// query returning a Character selects it, so they all decode into
// characterResponse.
const characterFields = `
fragment CharacterFields on Character {
	id
	name
	alignmentType
	alignmentDescription
	gold
	hitPoints
	maxHitPoints
	isDying
	armor
	load
	maxLoad
	debilities
	characterClass { key }
	raceMove { key }
	abilities { ability score modifier }
	classMoves { key }
	looks { lookType { key } value }
	equipment {
		id
		key
		label
		description
		type
		count
		isWorn
		tags { key quantity }
	}
}`

type characterResponse struct {
	ID                   string
	Name                 string
	AlignmentType        string
	AlignmentDescription string
	Gold                 int32
	HitPoints            int32
	MaxHitPoints         int32
	IsDying              bool
	Armor                int32
	Load                 int32
	MaxLoad              int32
	Debilities           []string
	CharacterClass       struct{ Key string }
	RaceMove             struct{ Key string }
	Abilities            []struct {
		Ability  string
		Score    int32
		Modifier int32
	}
	ClassMoves []struct{ Key string }
	Looks      []struct {
		LookType struct{ Key string }
		Value    string
	}
	Equipment []itemResponse
}

type itemResponse struct {
	ID          string
	Key         string
	Label       string
	Description string
	Type        string
	Count       int32
	IsWorn      bool
	Tags        []struct {
		Key      string
		Quantity *int32
	}
}

const createCharacterMutation = `
mutation ($input: CreateCharacterInput!) {
	characters { create(input: $input) { ...CharacterFields } }
}` + characterFields

const characterByIDQuery = `
query ($id: ID!) {
	characters { byId(id: $id) { ...CharacterFields } }
}` + characterFields

const allCharactersQuery = `
{
	characters { all { ...CharacterFields } }
}` + characterFields

// createCharacter creates a character through the API, failing the test on
// any error.
func createCharacter(t *testing.T, c *client.Client, input model.CreateCharacterInput) characterResponse {
	t.Helper()

	var resp struct {
		Characters struct{ Create characterResponse }
	}
	if err := c.Post(createCharacterMutation, &resp, client.Var("input", input)); err != nil {
		t.Fatalf("create character: %v", err)
	}

	return resp.Characters.Create
}

// characterByID reads a character back through the API, failing the test on
// any error.
func characterByID(t *testing.T, c *client.Client, id string) characterResponse {
	t.Helper()

	var resp struct {
		Characters struct{ ByID characterResponse }
	}
	if err := c.Post(characterByIDQuery, &resp, client.Var("id", id)); err != nil {
		t.Fatalf("get character %s: %v", id, err)
	}

	return resp.Characters.ByID
}

// allCharacters lists every character through the API, failing the test on
// any error.
func allCharacters(t *testing.T, c *client.Client) []characterResponse {
	t.Helper()

	var resp struct {
		Characters struct{ All []characterResponse }
	}
	if err := c.Post(allCharactersQuery, &resp); err != nil {
		t.Fatalf("list characters: %v", err)
	}

	return resp.Characters.All
}

// postErrors sends a request that's expected to fail and returns its GraphQL
// errors, with their extensions, failing the test if there are none.
func postErrors(t *testing.T, c *client.Client, query string, options ...client.Option) gqlerror.List {
	t.Helper()

	resp, err := c.RawPost(query, options...)
	if err != nil {
		t.Fatalf("post: %v", err)
	}

	var errs gqlerror.List
	if len(resp.Errors) > 0 {
		if err := json.Unmarshal(resp.Errors, &errs); err != nil {
			t.Fatalf("decode errors %s: %v", resp.Errors, err)
		}
	}
	if len(errs) == 0 {
		t.Fatal("expected GraphQL errors, got none")
	}

	return errs
}

// postCharacter sends a mutation that returns a Character at the path
// namespace.field (e.g. characters.takeDamage), failing the test on any
// error.
func postCharacter(t *testing.T, c *client.Client, mutation, namespace, field string, options ...client.Option) characterResponse {
	t.Helper()

	var resp map[string]map[string]characterResponse
	if err := c.Post(mutation, &resp, options...); err != nil {
		t.Fatalf("%s.%s: %v", namespace, field, err)
	}

	return resp[namespace][field]
}

// wantValidationError fails the test unless errs has a validation error on
// field.
func wantValidationError(t *testing.T, errs gqlerror.List, field string) {
	t.Helper()

	for _, err := range errs {
		if err.Extensions["code"] == models.ValidationErrorCode && err.Extensions["field"] == field {
			return
		}
	}
	t.Errorf("no validation error on %q in %v", field, errs)
}

// characterClass returns the class with key from the game data.
func characterClass(t *testing.T, key string) *models.CharacterClassModel {
	t.Helper()

	class, ok := (*env.GameData.CharacterClassMap)[key]
	if !ok {
		t.Fatalf("no character class %q in the game data", key)
	}

	return &class
}

// findItem returns the first item in equipment matching match, failing the
// test if there isn't one.
func findItem(t *testing.T, equipment []itemResponse, description string, match func(itemResponse) bool) itemResponse {
	t.Helper()

	for _, item := range equipment {
		if match(item) {
			return item
		}
	}
	t.Fatalf("no %s in equipment %+v", description, equipment)

	return itemResponse{}
}

// tagQuantities maps an item's tag keys to their quantities ("" for simple
// tags), so tests can compare tags with maps.Equal regardless of order.
func tagQuantities(item itemResponse) map[string]string {
	tags := make(map[string]string, len(item.Tags))
	for _, tag := range item.Tags {
		tags[tag.Key] = ""
		if tag.Quantity != nil {
			tags[tag.Key] = strconv.Itoa(int(*tag.Quantity))
		}
	}

	return tags
}
