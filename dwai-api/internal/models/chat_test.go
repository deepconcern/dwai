package models_test

import (
	"strings"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
	"github.com/jackc/pgx/v5/pgtype"
)

func TestNewMoveRoll(t *testing.T) {
	t.Parallel()

	strongHit, weakHit, miss := models.RollBandStrongHit, models.RollBandWeakHit, models.RollBandMiss

	tests := []struct {
		name  string
		input models.RollInput
		want  models.Roll
	}{
		{
			// Spec example: 2d6 [4, 5] +2 STR −1 weak +1 forward (Aid from Lux) = 11.
			name: "app roll adds exactly the chosen modifiers",
			input: models.RollInput{
				Dice:      []models.Die{{Sides: 6, Value: 4}, {Sides: 6, Value: 5}},
				Label:     "Hack and Slash",
				Modifiers: []models.Modifier{{Label: "STR", Value: 2}, {Label: "weak", Value: -1}, {Label: "forward (Aid from Lux)", Value: 1}},
				MoveKey:   "hack_and_slash",
			},
			want: models.Roll{
				Band:      &strongHit,
				Dice:      []models.Die{{Sides: 6, Value: 4}, {Sides: 6, Value: 5}},
				DiceTotal: 9,
				Label:     "Hack and Slash",
				Modifiers: []models.Modifier{{Label: "STR", Value: 2}, {Label: "weak", Value: -1}, {Label: "forward (Aid from Lux)", Value: 1}},
				MoveKey:   "hack_and_slash",
				Source:    models.RollSourceApp,
				Total:     11,
			},
		},
		{
			name:  "physical dice: the player enters the 2d6 total",
			input: models.RollInput{DiceTotal: ptr[int32](5), Label: "Roll +DEX", Modifiers: []models.Modifier{{Label: "DEX", Value: 1}}},
			want: models.Roll{
				Band:      &miss,
				DiceTotal: 5,
				Label:     "Roll +DEX",
				Modifiers: []models.Modifier{{Label: "DEX", Value: 1}},
				Source:    models.RollSourceManual,
				Total:     6,
			},
		},
		{
			name:  "no modifiers chosen: the total is the dice",
			input: models.RollInput{DiceTotal: ptr[int32](8), Label: "Last Breath"},
			want:  models.Roll{Band: &weakHit, DiceTotal: 8, Label: "Last Breath", Modifiers: []models.Modifier{}, Source: models.RollSourceManual, Total: 8},
		},
		{
			name:  "label is trimmed",
			input: models.RollInput{DiceTotal: ptr[int32](12), Label: "  Parley "},
			want:  models.Roll{Band: &strongHit, DiceTotal: 12, Label: "Parley", Modifiers: []models.Modifier{}, Source: models.RollSourceManual, Total: 12},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, errs := models.NewMoveRoll(tt.input)
			if len(errs) > 0 {
				t.Fatalf("errors = %v", errs)
			}
			if diff := cmp.Diff(tt.want, got, cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("roll (-want +got):\n%s", diff)
			}
		})
	}
}

func TestRollBandFor(t *testing.T) {
	t.Parallel()

	// docs/game/rules.md § Rolls: 10+ full success, 7–9 partial, 6− miss.
	tests := []struct {
		total int32
		want  models.RollBand
	}{
		{-1, models.RollBandMiss},
		{6, models.RollBandMiss},
		{7, models.RollBandWeakHit},
		{9, models.RollBandWeakHit},
		{10, models.RollBandStrongHit},
		{15, models.RollBandStrongHit},
	}
	for _, tt := range tests {
		if got := models.RollBandFor(tt.total); got != tt.want {
			t.Errorf("RollBandFor(%d) = %s, want %s", tt.total, got, tt.want)
		}
	}
}

func TestNewMoveRollRejectsInvalidInput(t *testing.T) {
	t.Parallel()

	d6 := func(v int32) models.Die { return models.Die{Sides: 6, Value: v} }

	tests := []struct {
		name       string
		input      models.RollInput
		wantFields []string
	}{
		{"neither dice nor a total", models.RollInput{Label: "Parley"}, []string{"dice"}},
		{"both dice and a total", models.RollInput{Dice: []models.Die{d6(1), d6(2)}, DiceTotal: ptr[int32](3), Label: "Parley"}, []string{"dice"}},
		{"one die", models.RollInput{Dice: []models.Die{d6(4)}, Label: "Parley"}, []string{"dice"}},
		{"a die above 6", models.RollInput{Dice: []models.Die{d6(7), d6(2)}, Label: "Parley"}, []string{"dice"}},
		{"a d8", models.RollInput{Dice: []models.Die{{Sides: 8, Value: 3}, d6(2)}, Label: "Parley"}, []string{"dice"}},
		{"total below 2", models.RollInput{DiceTotal: ptr[int32](1), Label: "Parley"}, []string{"diceTotal"}},
		{"total above 12", models.RollInput{DiceTotal: ptr[int32](13), Label: "Parley"}, []string{"diceTotal"}},
		{"blank label", models.RollInput{DiceTotal: ptr[int32](7), Label: " "}, []string{"label"}},
		{"blank modifier label", models.RollInput{DiceTotal: ptr[int32](7), Label: "Parley", Modifiers: []models.Modifier{{Label: "", Value: 1}}}, []string{"modifiers"}},
		{"modifier out of range", models.RollInput{DiceTotal: ptr[int32](7), Label: "Parley", Modifiers: []models.Modifier{{Label: "CHA", Value: 21}}}, []string{"modifiers"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			_, errs := models.NewMoveRoll(tt.input)
			if diff := cmp.Diff(tt.wantFields, fields(errs), cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("error fields (-want +got):\n%s", diff)
			}
		})
	}
}

func TestNewDamageRoll(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		input models.RollInput
		want  models.Roll
	}{
		{
			name:  "class die plus a flat bonus",
			input: models.RollInput{Dice: []models.Die{{Sides: 10, Value: 7}}, Label: "d10+2", Modifiers: []models.Modifier{{Label: "+2", Value: 2}}},
			want:  models.Roll{Dice: []models.Die{{Sides: 10, Value: 7}}, DiceTotal: 7, Label: "d10+2", Modifiers: []models.Modifier{{Label: "+2", Value: 2}}, Source: models.RollSourceApp, Total: 9},
		},
		{
			name: "best of two leaves out the dropped die",
			input: models.RollInput{
				Dice:  []models.Die{{Dropped: true, Sides: 8, Value: 3}, {Sides: 8, Value: 6}},
				Label: "b[2d8]",
			},
			want: models.Roll{
				Dice:      []models.Die{{Dropped: true, Sides: 8, Value: 3}, {Sides: 8, Value: 6}},
				DiceTotal: 6,
				Label:     "b[2d8]",
				Source:    models.RollSourceApp,
				Total:     6,
			},
		},
		{
			name:  "physical dice: the player enters the total",
			input: models.RollInput{DiceTotal: ptr[int32](4), Label: "d6"},
			want:  models.Roll{DiceTotal: 4, Label: "d6", Source: models.RollSourceManual, Total: 4},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, errs := models.NewDamageRoll(tt.input)
			if len(errs) > 0 {
				t.Fatalf("errors = %v", errs)
			}
			if diff := cmp.Diff(tt.want, got, cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("roll (-want +got):\n%s", diff)
			}
		})
	}
}

func TestNewDamageRollRejectsInvalidInput(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		input      models.RollInput
		wantFields []string
	}{
		{"a die that doesn't exist", models.RollInput{Dice: []models.Die{{Sides: 7, Value: 3}}, Label: "d7"}, []string{"dice"}},
		{"a value above the die", models.RollInput{Dice: []models.Die{{Sides: 4, Value: 5}}, Label: "d4"}, []string{"dice"}},
		{"a value of 0", models.RollInput{Dice: []models.Die{{Sides: 4, Value: 0}}, Label: "d4"}, []string{"dice"}},
		{"a negative total", models.RollInput{DiceTotal: ptr[int32](-1), Label: "d4"}, []string{"diceTotal"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			_, errs := models.NewDamageRoll(tt.input)
			if diff := cmp.Diff(tt.wantFields, fields(errs), cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("error fields (-want +got):\n%s", diff)
			}
		})
	}
}

func TestCanSeeMessage(t *testing.T) {
	t.Parallel()

	uuid := func(b byte) pgtype.UUID { return pgtype.UUID{Bytes: [16]byte{b}, Valid: true} }
	gm, ana, bo := uuid(1), uuid(2), uuid(3)

	public := db.CampaignMessage{AuthorUserID: ana}
	whisperToGM := db.CampaignMessage{AuthorUserID: ana, RecipientUserID: gm}
	whisperToBo := db.CampaignMessage{AuthorUserID: gm, RecipientUserID: bo}
	gmOnlyRoll := db.CampaignMessage{AuthorUserID: ana, GmOnly: true}

	tests := []struct {
		name       string
		viewer     pgtype.UUID
		viewerIsGM bool
		message    db.CampaignMessage
		want       bool
	}{
		{"a player sees a public message", bo, false, public, true},
		{"the GM sees a public message", gm, true, public, true},
		{"the author sees their whisper", ana, false, whisperToGM, true},
		{"the GM sees a whisper to them", gm, true, whisperToGM, true},
		{"another player doesn't see a whisper to the GM", bo, false, whisperToGM, false},
		{"the recipient sees the GM's whisper", bo, false, whisperToBo, true},
		{"another player doesn't see the GM's whisper", ana, false, whisperToBo, false},
		{"the roller sees their GM-only roll", ana, false, gmOnlyRoll, true},
		{"the GM sees a GM-only roll", gm, true, gmOnlyRoll, true},
		{"another player doesn't see a GM-only roll", bo, false, gmOnlyRoll, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if got := models.CanSeeMessage(tt.viewer, tt.viewerIsGM, &tt.message); got != tt.want {
				t.Errorf("CanSeeMessage = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestValidateChatText(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		text      string
		want      string
		wantError bool
	}{
		{"trimmed", "  I draw my sword. ", "I draw my sword.", false},
		{"blank", "   ", "", true},
		{"too long", strings.Repeat("a", 2001), "", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := models.ValidateChatText(tt.text)
			if (err != nil) != tt.wantError {
				t.Fatalf("error = %v, want error %v", err, tt.wantError)
			}
			if err == nil && got != tt.want {
				t.Errorf("text = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestValidateBonus(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		input      models.BonusInput
		want       models.BonusInput
		wantFields []string
	}{
		{"forward, trimmed", models.BonusInput{Amount: 1, Kind: models.BonusKindForward, Label: " Aid from Lux "}, models.BonusInput{Amount: 1, Kind: models.BonusKindForward, Label: "Aid from Lux"}, nil},
		{"a penalty", models.BonusInput{Amount: -1, Kind: models.BonusKindOngoing, Label: "Casting fatigue"}, models.BonusInput{Amount: -1, Kind: models.BonusKindOngoing, Label: "Casting fatigue"}, nil},
		{"zero", models.BonusInput{Amount: 0, Kind: models.BonusKindForward, Label: "Nothing"}, models.BonusInput{Kind: models.BonusKindForward, Label: "Nothing"}, []string{"amount"}},
		{"blank label", models.BonusInput{Amount: 1, Kind: models.BonusKindForward, Label: " "}, models.BonusInput{Amount: 1, Kind: models.BonusKindForward}, []string{"label"}},
		{"long label", models.BonusInput{Amount: 1, Kind: models.BonusKindForward, Label: strings.Repeat("a", 101)}, models.BonusInput{Amount: 1, Kind: models.BonusKindForward, Label: strings.Repeat("a", 101)}, []string{"label"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, errs := models.ValidateBonus(tt.input)
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("input (-want +got):\n%s", diff)
			}
			if diff := cmp.Diff(tt.wantFields, fields(errs), cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("error fields (-want +got):\n%s", diff)
			}
		})
	}
}
