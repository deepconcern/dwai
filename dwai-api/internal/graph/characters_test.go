//go:build integration

package graph_test

import (
	"maps"
	"slices"
	"testing"

	"github.com/99designs/gqlgen/client"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/deepconcern/dwai/dwai-api/internal/models/modelstest"
)

// Creates one character of every class, then reads it back with byId so the
// assertions check what was committed, not just what the mutation echoed.
func TestCreateCharacter(t *testing.T) {
	t.Parallel()

	for key, class := range *env.GameData.CharacterClassMap {
		t.Run(key, func(t *testing.T) {
			t.Parallel()

			c, _ := env.NewClient(t)
			input := modelstest.ValidCreateCharacterInput(&class)

			created := createCharacter(t, c, input)
			got := characterByID(t, c, created.ID)

			if got.Name != input.Name {
				t.Errorf("name = %q, want %q", got.Name, input.Name)
			}
			if got.CharacterClass.Key != key {
				t.Errorf("class = %q, want %q", got.CharacterClass.Key, key)
			}
			if got.AlignmentType != input.AlignmentType || got.AlignmentDescription != input.AlignmentDescription {
				t.Errorf("alignment = %q %q, want %q %q", got.AlignmentType, got.AlignmentDescription, input.AlignmentType, input.AlignmentDescription)
			}
			if got.RaceMove.Key != input.RaceMoveKey {
				t.Errorf("race move = %q, want %q", got.RaceMove.Key, input.RaceMoveKey)
			}

			assertAbilities(t, got, input)
			assertLooks(t, got, input)

			// Max HP = class base HP + CON score (the score, not the modifier).
			if want := class.HpBase + abilityScore(input, model.AbilityConstitution); got.HitPoints != want {
				t.Errorf("hit points = %d, want %d (base %d + CON score)", got.HitPoints, want, class.HpBase)
			}

			moveKeys := make([]string, len(got.ClassMoves))
			for i, move := range got.ClassMoves {
				moveKeys[i] = move.Key
			}
			for _, move := range class.StartingMoves {
				if !slices.Contains(moveKeys, move.Key) {
					t.Errorf("class moves %v are missing starting move %q", moveKeys, move.Key)
				}
			}

			if len(got.Equipment) == 0 {
				t.Error("character has no starting equipment")
			}
			if want := pickedGold(&class, input); got.Gold != want {
				t.Errorf("gold = %d, want %d", got.Gold, want)
			}
		})
	}
}

// The Fighter's Signature Weapon has no item template: a hook builds it from
// the player's picks for the signature_weapon move (see item_hooks.go).
func TestCreateCharacterSignatureWeapon(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	input := modelstest.ValidCreateCharacterInput(characterClass(t, "fighter"))

	pick := func(group int32, option string) *model.MoveCreationOptionChoiceInput {
		return &model.MoveCreationOptionChoiceInput{MoveKey: "signature_weapon", ChoiceIndex: group, OptionKey: option}
	}
	input.MoveCreationOptionChoices = []*model.MoveCreationOptionChoiceInput{
		pick(0, "axe"),              // Base: weight 2
		pick(1, "reach"),            // Range: reach
		pick(2, "hooks_and_spikes"), // +1 damage, +1 weight
		pick(2, "well_crafted"),     // -1 weight
		pick(3, "ornate"),           // Look
	}

	created := createCharacter(t, c, input)
	got := characterByID(t, c, created.ID)

	weapon := findItem(t, got.Equipment, "signature weapon", func(item itemResponse) bool {
		return item.Key == "custom" && item.Type == "weapon"
	})

	if weapon.Label != "Ornate Axe" {
		t.Errorf("label = %q, want %q", weapon.Label, "Ornate Axe")
	}

	// Quantified tags from every pick add up: weight 2 + 1 - 1.
	want := map[string]string{"weight": "2", "reach": "", "damage_bonus": "1"}
	if tags := tagQuantities(weapon); !maps.Equal(tags, want) {
		t.Errorf("tags = %v, want %v", tags, want)
	}
}

// Picks that give the same item more than once are stored as one item with
// the combined count, not a row per copy.
func TestCreateCharacterMergesDuplicateGear(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)
	input := modelstest.ValidCreateCharacterInput(characterClass(t, "fighter"))

	// fighter.yaml, second gear group: choice 0 is two healing potions, and
	// choice 2 includes dungeon rations, which the Fighter also gets by
	// default.
	input.GearOptionChoices[1].ChoiceIndices = []int32{0, 2}

	created := createCharacter(t, c, input)
	got := characterByID(t, c, created.ID)

	for _, key := range []string{"healing_potion", "dungeon_rations"} {
		matching := 0
		var count int32
		for _, item := range got.Equipment {
			if item.Key == key {
				matching++
				count = item.Count
			}
		}

		if matching != 1 || count != 2 {
			t.Errorf("%s: %d items with count %d, want 1 item with count 2", key, matching, count)
		}
	}
}

func TestCreateCharacterRejectsInvalidInput(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		modify    func(*model.CreateCharacterInput)
		wantField string
	}{
		{"missing name", func(in *model.CreateCharacterInput) { in.Name = "" }, "name"},
		{"score outside the standard array", func(in *model.CreateCharacterInput) { in.Abilities[0].Score = 18 }, "abilities"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			c, _ := env.NewClient(t)
			input := modelstest.ValidCreateCharacterInput(characterClass(t, "fighter"))
			tt.modify(&input)

			errs := postErrors(t, c, createCharacterMutation, client.Var("input", input))

			found := false
			for _, err := range errs {
				if err.Extensions["code"] == models.ValidationErrorCode && err.Extensions["field"] == tt.wantField {
					found = true
				}
			}
			if !found {
				t.Errorf("no %s error for field %q in %v", models.ValidationErrorCode, tt.wantField, errs)
			}

			if all := allCharacters(t, c); len(all) != 0 {
				t.Errorf("invalid input stored %d characters", len(all))
			}
		})
	}
}

func TestCharacterByIDNotFound(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)

	for name, id := range map[string]string{
		"unknown":   "01900000-0000-7000-8000-000000000000",
		"malformed": "not-a-uuid",
	} {
		t.Run(name, func(t *testing.T) {
			_ = postErrors(t, c, characterByIDQuery, client.Var("id", id)) // fails the test if there are no errors
		})
	}
}

// Loaders cache per request, so a change made after one request is visible
// to the next. Creating a character loads it through the character loader,
// which would serve the old name here if loaders outlived the request.
func TestCharacterLoaderCacheIsPerRequest(t *testing.T) {
	t.Parallel()

	c, pool := env.NewClient(t)
	created := createCharacter(t, c, modelstest.ValidCreateCharacterInput(characterClass(t, "fighter")))

	if _, err := pool.Exec(t.Context(), "UPDATE characters SET name = 'Renamed' WHERE id = $1", created.ID); err != nil {
		t.Fatalf("rename character: %v", err)
	}

	if got := characterByID(t, c, created.ID); got.Name != "Renamed" {
		t.Errorf("name = %q after renaming in the database, want %q", got.Name, "Renamed")
	}
}

// Lists several characters at once, so the dataloaders batch their looks and
// equipment; each must end up attached to the right character.
func TestCharactersAll(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)

	inputs := map[string]model.CreateCharacterInput{}
	created := map[string]characterResponse{}
	for _, key := range []string{"fighter", "wizard", "thief"} {
		input := modelstest.ValidCreateCharacterInput(characterClass(t, key))
		character := createCharacter(t, c, input)
		inputs[character.ID] = input
		created[character.ID] = character
	}

	all := allCharacters(t, c)
	if len(all) != len(created) {
		t.Fatalf("characters.all returned %d characters, want %d", len(all), len(created))
	}

	for _, got := range all {
		input, ok := inputs[got.ID]
		if !ok {
			t.Errorf("characters.all returned unknown character %s", got.ID)
			continue
		}

		if got.Name != input.Name {
			t.Errorf("%s: name = %q, want %q", got.ID, got.Name, input.Name)
		}
		assertLooks(t, got, input)

		if want := equipmentIDs(created[got.ID]); !slices.Equal(equipmentIDs(got), want) {
			t.Errorf("%s (%s): equipment %v, want %v", got.Name, got.ID, equipmentIDs(got), want)
		}
	}
}

func assertAbilities(t *testing.T, got characterResponse, input model.CreateCharacterInput) {
	t.Helper()

	if len(got.Abilities) != len(input.Abilities) {
		t.Errorf("%d abilities, want %d", len(got.Abilities), len(input.Abilities))
	}

	for _, ability := range got.Abilities {
		want := abilityScore(input, model.Ability(ability.Ability))
		if ability.Score != want {
			t.Errorf("%s score = %d, want %d", ability.Ability, ability.Score, want)
		}
		if wantMod := models.AbilityModifier(want); ability.Modifier != wantMod {
			t.Errorf("%s modifier = %d, want %d for score %d", ability.Ability, ability.Modifier, wantMod, want)
		}
	}
}

func assertLooks(t *testing.T, got characterResponse, input model.CreateCharacterInput) {
	t.Helper()

	gotLooks := map[string]string{}
	for _, look := range got.Looks {
		gotLooks[look.LookType.Key] = look.Value
	}

	if len(gotLooks) != len(input.Looks) {
		t.Errorf("%s: %d looks, want %d", got.Name, len(gotLooks), len(input.Looks))
	}
	for _, look := range input.Looks {
		if gotLooks[look.LookTypeKey] != look.Value {
			t.Errorf("%s: look %q = %q, want %q", got.Name, look.LookTypeKey, gotLooks[look.LookTypeKey], look.Value)
		}
	}
}

func abilityScore(input model.CreateCharacterInput, ability model.Ability) int32 {
	for _, a := range input.Abilities {
		if a.Ability == ability {
			return a.Score
		}
	}

	return 0
}

// pickedGold sums the starting gold from the class's default gear and the
// gear choices in input.
func pickedGold(class *models.CharacterClassModel, input model.CreateCharacterInput) int32 {
	var gold int32
	addGold := func(items []*models.ItemOptionModel) {
		for _, item := range items {
			if item.Gold != nil {
				gold += *item.Gold
			}
		}
	}

	addGold(class.StartingGear.Default)
	for _, choice := range input.GearOptionChoices {
		group := class.StartingGear.Options[choice.OptionIndex]
		for _, i := range choice.ChoiceIndices {
			addGold(group.Choices[i])
		}
	}

	return gold
}

func equipmentIDs(character characterResponse) []string {
	ids := make([]string, len(character.Equipment))
	for i, item := range character.Equipment {
		ids[i] = item.ID
	}
	slices.Sort(ids)

	return ids
}
