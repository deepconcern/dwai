package models

import (
	"crypto/rand"
	"errors"
	"regexp"
	"strings"
	"unicode/utf8"
)

// Campaign field limits.
const (
	MaxBondTextLength            = 500
	MaxCampaignDescriptionLength = 2000
	MaxCampaignNameLength        = 100
	MaxReasonLength              = 1000
)

// inviteCodeAlphabet is Crockford's base32: no I, L, O, or U, so codes are
// easy to read aloud and type.
const inviteCodeAlphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

// inviteCodeLength gives 50 bits of randomness, plenty for a code that
// only lets a logged-in user join a campaign.
const inviteCodeLength = 10

// NewInviteCode returns a random campaign invite code.
func NewInviteCode() string {
	b := make([]byte, inviteCodeLength)
	_, _ = rand.Read(b) // crypto/rand.Read never returns an error

	for i := range b {
		b[i] = inviteCodeAlphabet[int(b[i])%len(inviteCodeAlphabet)]
	}

	return string(b)
}

// NormalizeInviteCode trims and upper-cases an invite code as typed, so
// codes match regardless of case.
func NormalizeInviteCode(code string) string {
	return strings.ToUpper(strings.TrimSpace(code))
}

// CampaignInput is a campaign's editable details, as entered.
type CampaignInput struct {
	Description string
	Name        string
}

// ValidateCampaignInput trims a campaign's details and checks them,
// returning the trimmed input and one error per bad field.
func ValidateCampaignInput(input CampaignInput) (CampaignInput, []ValidationError) {
	trimmed := CampaignInput{
		Description: strings.TrimSpace(input.Description),
		Name:        strings.TrimSpace(input.Name),
	}

	var errs []ValidationError
	switch {
	case trimmed.Name == "":
		errs = append(errs, ValidationError{Field: "name", Message: "Enter a name."})
	case utf8.RuneCountInString(trimmed.Name) > MaxCampaignNameLength:
		errs = append(errs, ValidationError{Field: "name", Message: "The name must be at most 100 characters."})
	}
	if utf8.RuneCountInString(trimmed.Description) > MaxCampaignDescriptionLength {
		errs = append(errs, ValidationError{Field: "description", Message: "The description must be at most 2000 characters."})
	}

	return trimmed, errs
}

// ValidateBondText trims a bond's text and checks it.
func ValidateBondText(field, text string) (string, error) {
	text = strings.TrimSpace(text)
	switch {
	case text == "":
		return text, ValidationError{Field: field, Message: "Write the bond."}
	case utf8.RuneCountInString(text) > MaxBondTextLength:
		return text, ValidationError{Field: field, Message: "A bond must be at most 500 characters."}
	}

	return text, nil
}

// bondBlank matches the blank in a class's bond template.
var bondBlank = regexp.MustCompile(`_{2,}`)

// FillBondTemplate replaces the blanks in a class's bond template (a run of
// underscores) with the target character's name.
func FillBondTemplate(template, name string) string {
	return bondBlank.ReplaceAllLiteralString(template, name)
}

// Checked is an End of Session checkbox and the reason written for it. A
// checked box needs a reason; an unchecked box's reason is ignored.
type Checked struct {
	Checked bool
	Reason  string
}

// validate trims the reason, clears it when the box isn't checked, and
// reports a checked box without one.
func (c Checked) validate(field string) (Checked, []ValidationError) {
	if !c.Checked {
		return Checked{}, nil
	}

	c.Reason = strings.TrimSpace(c.Reason)
	switch {
	case c.Reason == "":
		return c, []ValidationError{{Field: field, Message: "Write a reason for each checked item."}}
	case utf8.RuneCountInString(c.Reason) > MaxReasonLength:
		return c, []ValidationError{{Field: field, Message: "A reason must be at most 1000 characters."}}
	}

	return c, nil
}

// GroupAnswers are the GM's answers to End of Session's three group
// questions.
type GroupAnswers struct {
	// Learned: did we learn something new and important about the world?
	Learned Checked
	// Looted: did we loot a memorable treasure?
	Looted Checked
	// Overcame: did we overcome a notable monster or enemy?
	Overcame Checked
}

// Yes counts the questions answered "yes".
func (g GroupAnswers) Yes() int32 {
	var n int32
	for _, c := range []Checked{g.Learned, g.Looted, g.Overcame} {
		if c.Checked {
			n++
		}
	}

	return n
}

// ValidateGroupAnswers trims the reasons and checks that every "yes" has
// one.
func ValidateGroupAnswers(answers GroupAnswers) (GroupAnswers, []ValidationError) {
	var errs, e []ValidationError
	answers.Learned, e = answers.Learned.validate("learned.reason")
	errs = append(errs, e...)
	answers.Looted, e = answers.Looted.validate("looted.reason")
	errs = append(errs, e...)
	answers.Overcame, e = answers.Overcame.validate("overcame.reason")
	errs = append(errs, e...)

	return answers, errs
}

// SessionReport is a player's End of Session report for their character.
type SessionReport struct {
	Alignment Checked
	// Bond is checked when the player resolved a bond, which also needs a
	// replacement.
	Bond                Checked
	ReplacementBondText string
}

// ValidateSessionReport trims a report and checks it: each checked item
// needs a reason, and a resolved bond needs a replacement. Whether the
// resolved bond and the replacement's target are valid depends on the
// campaign, and is checked by the caller.
func ValidateSessionReport(report SessionReport) (SessionReport, []ValidationError) {
	var errs, e []ValidationError
	report.Alignment, e = report.Alignment.validate("alignmentReason")
	errs = append(errs, e...)
	report.Bond, e = report.Bond.validate("bondReason")
	errs = append(errs, e...)

	if report.Bond.Checked {
		text, err := ValidateBondText("replacementBond.text", report.ReplacementBondText)
		report.ReplacementBondText = text
		var ve ValidationError
		if errors.As(err, &ve) {
			errs = append(errs, ve)
		}
	} else {
		report.ReplacementBondText = ""
	}

	return report, errs
}

// EndOfSessionXP is the XP a character marks at End of Session: 1 for each
// group question answered "yes", 1 for fulfilling their alignment, and 1 for
// resolving a bond.
func EndOfSessionXP(groupYes int32, alignmentFulfilled, bondResolved bool) int32 {
	xp := groupYes
	if alignmentFulfilled {
		xp++
	}
	if bondResolved {
		xp++
	}

	return xp
}
