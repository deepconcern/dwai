//go:build integration

package graph_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/99designs/gqlgen/client"
	"github.com/deepconcern/dwai/dwai-api/internal/auth"
	"github.com/deepconcern/dwai/dwai-api/internal/models/modelstest"
	"github.com/deepconcern/dwai/dwai-api/internal/testutil"
	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
)

// recorder sends a request straight to the handler.
func recorder(h http.Handler, req *http.Request) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	return rec
}

// sessionClient returns a client that sends a fixed session token, like a
// client that kept a cookie the server has since revoked.
func sessionClient(h http.Handler, token string) *client.Client {
	return client.New(h, client.Path("/graphql"), client.AddCookie(&http.Cookie{Name: auth.CookieName, Value: token}))
}

// characterCalls is every query and mutation that takes a character or item
// ID, with variables pointing at the given fighter, wizard, and item.
func characterCalls(fighterID, wizardID, itemID string) []struct {
	name  string
	query string
	vars  map[string]any
} {
	return []struct {
		name  string
		query string
		vars  map[string]any
	}{
		{"characters.byId", characterByIDQuery, map[string]any{"id": fighterID}},
		{"characters.adjustGold", adjustGoldMutation, map[string]any{"id": fighterID, "delta": 5}},
		{"characters.adjustXp", adjustXPMutation, map[string]any{"id": fighterID, "delta": 5}},
		{"characters.heal", healMutation, map[string]any{"id": fighterID, "amount": 1}},
		{"characters.levelUp", levelUpMutation, map[string]any{"id": fighterID, "input": map[string]any{"ability": "STRENGTH", "advancedMoveKey": "merciless"}}},
		{"characters.setDebility", setDebilityMutation, map[string]any{"id": fighterID, "debility": "WEAK", "active": true}},
		{"characters.takeDamage", takeDamageMutation, map[string]any{"id": fighterID, "input": map[string]any{"amount": 3}}},
		{"items.add", addItemMutation, map[string]any{"characterId": fighterID, "input": map[string]any{"label": "Stolen thing"}}},
		{"items.remove", removeItemMutation, map[string]any{"id": itemID}},
		{"items.setCount", setCountMutation, map[string]any{"id": itemID, "count": 3}},
		{"items.setWorn", setWornMutation, map[string]any{"id": itemID, "worn": true}},
		{"spells.addToSpellbook", addToSpellbookMutation, map[string]any{"characterId": wizardID, "spellKey": "magic_missile"}},
		{"spells.prepare", prepareSpellsMutation, map[string]any{"characterId": wizardID, "spellKeys": []string{}}},
		{"spells.removeFromSpellbook", removeFromSpellbookMutation, map[string]any{"characterId": wizardID, "spellKey": "magic_missile"}},
		{"spells.setForgotten", setForgottenMutation, map[string]any{"characterId": wizardID, "spellKey": "magic_missile", "forgotten": true}},
	}
}

func options(vars map[string]any) []client.Option {
	opts := make([]client.Option, 0, len(vars))
	for k, v := range vars {
		opts = append(opts, client.Var(k, v))
	}

	return opts
}

// Another user's characters and items behave exactly like nonexistent ones,
// and nothing about them changes.
func TestOtherUsersCharactersAreNotFound(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)

	owner := testutil.NewBrowser(h)
	owner.Register(t, "owner@example.com")
	fighter := createFighter(t, owner.Client)
	wizard := createClass(t, owner.Client, "wizard")
	itemID := fighter.Equipment[0].ID

	// Read both back the same way they're checked at the end.
	fighter = characterByID(t, owner.Client, fighter.ID)
	wizard = characterByID(t, owner.Client, wizard.ID)

	other := testutil.NewBrowser(h)
	other.Register(t, "other@example.com")

	if got := myCharacters(t, other.Client); len(got) != 0 {
		t.Errorf("another user's characters.mine returned %d characters, want 0", len(got))
	}

	for _, call := range characterCalls(fighter.ID, wizard.ID, itemID) {
		t.Run(call.name, func(t *testing.T) {
			errs := postErrors(t, other.Client, call.query, options(call.vars)...)
			if len(errs) != 1 || !strings.HasSuffix(errs[0].Message, "not found") {
				t.Errorf("errors = %v, want one \"not found\"", errs)
			}
		})
	}

	// The owner's characters are untouched.
	// Item tags come back in no particular order.
	sortTags := cmpopts.SortSlices(func(a, b struct {
		Key      string
		Quantity *int32
	},
	) bool {
		return a.Key < b.Key
	})
	if diff := cmp.Diff(fighter, characterByID(t, owner.Client, fighter.ID), sortTags); diff != "" {
		t.Errorf("fighter changed after another user's calls (-before +after):\n%s", diff)
	}
	if diff := cmp.Diff(wizard, characterByID(t, owner.Client, wizard.ID), sortTags); diff != "" {
		t.Errorf("wizard changed after another user's calls (-before +after):\n%s", diff)
	}
}

// A missing character gives the same error as another user's.
func TestMissingCharacterIsNotFound(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)

	errs := postErrors(t, c, characterByIDQuery, client.Var("id", "01970000-0000-7000-8000-000000000000"))
	if len(errs) != 1 || !strings.HasSuffix(errs[0].Message, "not found") {
		t.Errorf("errors = %v, want one \"not found\"", errs)
	}
}

func TestLoggedOutCallsAreUnauthenticated(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)

	owner := testutil.NewBrowser(h)
	owner.Register(t, "owner@example.com")
	fighter := createFighter(t, owner.Client)
	wizard := createClass(t, owner.Client, "wizard")

	anonymous := testutil.NewBrowser(h).Client

	calls := characterCalls(fighter.ID, wizard.ID, fighter.Equipment[0].ID)
	calls = append(calls,
		struct {
			name  string
			query string
			vars  map[string]any
		}{"characters.mine", myCharactersQuery, nil},
		struct {
			name  string
			query string
			vars  map[string]any
		}{"characters.create", createCharacterMutation, map[string]any{"input": modelstest.ValidCreateCharacterInput(characterClass(t, "fighter"))}},
	)

	for _, call := range calls {
		t.Run(call.name, func(t *testing.T) {
			errs := postErrors(t, anonymous, call.query, options(call.vars)...)
			if len(errs) != 1 || errs[0].Extensions["code"] != auth.UnauthenticatedErrorCode {
				t.Errorf("errors = %v, want one with code %s", errs, auth.UnauthenticatedErrorCode)
			}
		})
	}
}

// Game content stays public.
func TestGameContentIsPublic(t *testing.T) {
	t.Parallel()

	h, _ := env.NewServer(t)
	anonymous := testutil.NewBrowser(h).Client

	var resp map[string]any
	err := anonymous.Post(`{
		apiVersion
		characterClasses { all { key } }
		itemTemplates { all { key } }
		lookTypes { all { key } }
		moves { all { key } }
		spells { byClass(classKey: "wizard") { key } }
	}`, &resp)
	if err != nil {
		t.Errorf("game content queries while logged out: %v", err)
	}
}

// Creating a character makes the caller its owner.
func TestCreateSetsOwner(t *testing.T) {
	t.Parallel()

	h, pool := env.NewServer(t)
	browser := testutil.NewBrowser(h)
	browser.Register(t, "owner@example.com")
	fighter := createFighter(t, browser.Client)

	var email string
	err := pool.QueryRow(t.Context(),
		"SELECT users.email FROM characters JOIN users ON users.id = characters.owner_id WHERE characters.id = $1",
		fighter.ID,
	).Scan(&email)
	if err != nil {
		t.Fatalf("select owner: %v", err)
	}
	if email != "owner@example.com" {
		t.Errorf("owner = %s, want owner@example.com", email)
	}
}
