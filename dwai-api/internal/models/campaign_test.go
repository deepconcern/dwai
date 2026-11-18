package models_test

import (
	"strings"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
)

func TestNewInviteCode(t *testing.T) {
	t.Parallel()

	seen := map[string]bool{}
	for range 100 {
		code := models.NewInviteCode()
		if len(code) != 10 {
			t.Fatalf("len(%q) = %d, want 10", code, len(code))
		}
		if strings.Trim(code, "0123456789ABCDEFGHJKMNPQRSTVWXYZ") != "" {
			t.Fatalf("code %q has characters outside Crockford base32", code)
		}
		if seen[code] {
			t.Fatalf("code %q repeated", code)
		}
		seen[code] = true
	}
}

func TestNormalizeInviteCode(t *testing.T) {
	t.Parallel()

	if got := models.NormalizeInviteCode("  ab12cd34ef "); got != "AB12CD34EF" {
		t.Errorf("NormalizeInviteCode = %q, want %q", got, "AB12CD34EF")
	}
}

func TestValidateCampaignInput(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		input      models.CampaignInput
		want       models.CampaignInput
		wantFields []string
	}{
		{"valid, trimmed", models.CampaignInput{Name: "  The Lost Mines ", Description: " Goblins. "}, models.CampaignInput{Name: "The Lost Mines", Description: "Goblins."}, nil},
		{"blank name", models.CampaignInput{Name: "   "}, models.CampaignInput{}, []string{"name"}},
		{"long name", models.CampaignInput{Name: strings.Repeat("a", 101)}, models.CampaignInput{Name: strings.Repeat("a", 101)}, []string{"name"}},
		{"long description", models.CampaignInput{Name: "x", Description: strings.Repeat("a", 2001)}, models.CampaignInput{Name: "x", Description: strings.Repeat("a", 2001)}, []string{"description"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, errs := models.ValidateCampaignInput(tt.input)
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("input (-want +got):\n%s", diff)
			}
			if diff := cmp.Diff(tt.wantFields, fields(errs), cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("error fields (-want +got):\n%s", diff)
			}
		})
	}
}

func TestValidateBondText(t *testing.T) {
	t.Parallel()

	if got, err := models.ValidateBondText("text", "  I trust Ana. "); err != nil || got != "I trust Ana." {
		t.Errorf("ValidateBondText = %q, %v; want trimmed text and no error", got, err)
	}
	if _, err := models.ValidateBondText("text", " "); err == nil {
		t.Error("blank bond: want an error")
	}
	if _, err := models.ValidateBondText("text", strings.Repeat("a", 501)); err == nil {
		t.Error("long bond: want an error")
	}
}

func TestFillBondTemplate(t *testing.T) {
	t.Parallel()

	tests := []struct{ template, want string }{
		{"_______________ owes me their life, whether they admit it or not.", "Ana owes me their life, whether they admit it or not."},
		{"I have sworn to protect _______________.", "I have sworn to protect Ana."},
		{"No blank here.", "No blank here."},
		{"Keep a single _ underscore.", "Keep a single _ underscore."},
	}
	for _, tt := range tests {
		if got := models.FillBondTemplate(tt.template, "Ana"); got != tt.want {
			t.Errorf("FillBondTemplate(%q) = %q, want %q", tt.template, got, tt.want)
		}
	}
}

func TestValidateGroupAnswers(t *testing.T) {
	t.Parallel()

	answers := models.GroupAnswers{
		Learned:  models.Checked{Checked: true, Reason: "  The king is a lich. "},
		Looted:   models.Checked{Checked: false, Reason: "ignored"},
		Overcame: models.Checked{Checked: true, Reason: "  "},
	}

	got, errs := models.ValidateGroupAnswers(answers)
	want := models.GroupAnswers{
		Learned:  models.Checked{Checked: true, Reason: "The king is a lich."},
		Overcame: models.Checked{Checked: true},
	}
	if diff := cmp.Diff(want, got); diff != "" {
		t.Errorf("answers (-want +got):\n%s", diff)
	}
	if diff := cmp.Diff([]string{"overcame.reason"}, fields(errs)); diff != "" {
		t.Errorf("error fields (-want +got):\n%s", diff)
	}
	if got.Yes() != 2 {
		t.Errorf("Yes() = %d, want 2", got.Yes())
	}
}

func TestValidateSessionReport(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		report     models.SessionReport
		want       models.SessionReport
		wantFields []string
	}{
		{
			name:   "nothing checked clears reasons",
			report: models.SessionReport{Alignment: models.Checked{Reason: "x"}, Bond: models.Checked{Reason: "y"}, ReplacementBondText: "z"},
			want:   models.SessionReport{},
		},
		{
			name: "both checked, trimmed",
			report: models.SessionReport{
				Alignment:           models.Checked{Checked: true, Reason: " Freed the slaves "},
				Bond:                models.Checked{Checked: true, Reason: " We made peace "},
				ReplacementBondText: " Ana is my sister now ",
			},
			want: models.SessionReport{
				Alignment:           models.Checked{Checked: true, Reason: "Freed the slaves"},
				Bond:                models.Checked{Checked: true, Reason: "We made peace"},
				ReplacementBondText: "Ana is my sister now",
			},
		},
		{
			name:       "checked without reasons or replacement",
			report:     models.SessionReport{Alignment: models.Checked{Checked: true}, Bond: models.Checked{Checked: true}},
			want:       models.SessionReport{Alignment: models.Checked{Checked: true}, Bond: models.Checked{Checked: true}},
			wantFields: []string{"alignmentReason", "bondReason", "replacementBond.text"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, errs := models.ValidateSessionReport(tt.report)
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("report (-want +got):\n%s", diff)
			}
			if diff := cmp.Diff(tt.wantFields, fields(errs), cmpopts.EquateEmpty()); diff != "" {
				t.Errorf("error fields (-want +got):\n%s", diff)
			}
		})
	}
}

func TestEndOfSessionXP(t *testing.T) {
	t.Parallel()

	tests := []struct {
		groupYes        int32
		alignment, bond bool
		want            int32
	}{
		{0, false, false, 0},
		{3, false, false, 3},
		{0, true, false, 1},
		{0, false, true, 1},
		{3, true, true, 5},
	}
	for _, tt := range tests {
		if got := models.EndOfSessionXP(tt.groupYes, tt.alignment, tt.bond); got != tt.want {
			t.Errorf("EndOfSessionXP(%d, %t, %t) = %d, want %d", tt.groupYes, tt.alignment, tt.bond, got, tt.want)
		}
	}
}
