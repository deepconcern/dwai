package models

// Table chat: messages, rolls, and bonuses. The app is an honor system (see
// docs/app/architecture.md): a roll records the dice and the modifiers the
// player chose, and the API only checks that the input is well formed. It
// never decides which modifiers apply.

import (
	"fmt"
	"slices"
	"strings"
	"unicode/utf8"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/jackc/pgx/v5/pgtype"
)

// Chat field limits.
const (
	MaxBonusAmount         = 10
	MaxBonusLabelLength    = 100
	MaxChatTextLength      = 2000
	MaxDamageDice          = 10
	MaxDamageTotal         = 100
	MaxModifierLabelLength = 60
	MaxModifiers           = 10
	MaxModifierValue       = 20
	MaxRollLabelLength     = 60
)

// Message kinds, as stored in campaign_messages.kind.
const (
	MessageKindActivity = "activity"
	MessageKindChat     = "chat"
	MessageKindDamage   = "damage"
	MessageKindRoll     = "roll"
)

// damageDice are the dice a damage roll may use.
var damageDice = []int32{4, 6, 8, 10, 12, 20}

// RollBand is a 2d6 roll's result band (docs/game/rules.md § Rolls).
type RollBand string

const (
	// RollBandMiss is 6 or less.
	RollBandMiss RollBand = "MISS"
	// RollBandStrongHit is 10 or more: a full success.
	RollBandStrongHit RollBand = "STRONG_HIT"
	// RollBandWeakHit is 7 to 9: a partial success.
	RollBandWeakHit RollBand = "WEAK_HIT"
)

// RollBandFor returns the band a 2d6 roll's total falls in.
func RollBandFor(total int32) RollBand {
	switch {
	case total >= 10:
		return RollBandStrongHit
	case total >= 7:
		return RollBandWeakHit
	default:
		return RollBandMiss
	}
}

// RollSource is how a roll was made.
type RollSource string

const (
	// RollSourceApp is a roll the app made, with each die recorded.
	RollSourceApp RollSource = "APP"
	// RollSourceManual is a total the player entered from physical dice.
	RollSourceManual RollSource = "MANUAL"
)

// Die is one rolled die. A dropped die (the lower of a best-of roll, say) is
// shown but not counted.
type Die struct {
	Dropped bool  `json:"dropped,omitempty"`
	Sides   int32 `json:"sides"`
	Value   int32 `json:"value"`
}

// Modifier is one value the player chose to add to a roll, such as a stat,
// a debility, or a bonus.
type Modifier struct {
	Label string `json:"label"`
	Value int32  `json:"value"`
}

// Roll is a move roll or damage roll as stored in campaign_messages.roll.
type Roll struct {
	// Band is set for move rolls only.
	Band *RollBand `json:"band,omitempty"`
	// Dice is set for app rolls only.
	Dice []Die `json:"dice,omitempty"`
	// DiceTotal is the counted dice, or the total the player entered.
	DiceTotal int32      `json:"diceTotal"`
	Label     string     `json:"label"`
	Modifiers []Modifier `json:"modifiers"`
	MoveKey   string     `json:"moveKey,omitempty"`
	Source    RollSource `json:"source"`
	// Total is DiceTotal plus every modifier.
	Total int32 `json:"total"`
}

// RollInput is a roll as the player submits it: either the dice the app
// rolled, or the total of their physical dice.
type RollInput struct {
	Dice      []Die
	DiceTotal *int32
	Label     string
	Modifiers []Modifier
	MoveKey   string
}

// NewMoveRoll checks a 2d6 move roll and computes its total and band.
func NewMoveRoll(input RollInput) (Roll, []ValidationError) {
	roll, errs := newRoll(input)

	switch {
	case input.Dice != nil && (len(input.Dice) != 2 || slices.ContainsFunc(input.Dice, func(d Die) bool { return d.Sides != 6 || d.Dropped || !d.valid() })):
		errs = append(errs, ValidationError{Field: "dice", Message: "A move roll is two six-sided dice."})
	case input.DiceTotal != nil && (*input.DiceTotal < 2 || *input.DiceTotal > 12):
		errs = append(errs, ValidationError{Field: "diceTotal", Message: "Enter the total of two six-sided dice, from 2 to 12."})
	}

	if len(errs) > 0 {
		return Roll{}, errs
	}

	band := RollBandFor(roll.Total)
	roll.Band = &band
	roll.MoveKey = input.MoveKey

	return roll, nil
}

// NewDamageRoll checks a damage roll and computes its total.
func NewDamageRoll(input RollInput) (Roll, []ValidationError) {
	roll, errs := newRoll(input)

	switch {
	case input.Dice != nil && (len(input.Dice) == 0 || len(input.Dice) > MaxDamageDice || slices.ContainsFunc(input.Dice, func(d Die) bool { return !slices.Contains(damageDice, d.Sides) || !d.valid() })):
		errs = append(errs, ValidationError{Field: "dice", Message: fmt.Sprintf("Damage is 1 to %d of d4, d6, d8, d10, d12, or d20.", MaxDamageDice)})
	case input.DiceTotal != nil && (*input.DiceTotal < 0 || *input.DiceTotal > MaxDamageTotal):
		errs = append(errs, ValidationError{Field: "diceTotal", Message: fmt.Sprintf("Enter the total of your damage dice, from 0 to %d.", MaxDamageTotal)})
	}

	if len(errs) > 0 {
		return Roll{}, errs
	}

	return roll, nil
}

// newRoll checks what move and damage rolls share and sums the roll.
func newRoll(input RollInput) (Roll, []ValidationError) {
	var errs []ValidationError

	roll := Roll{Label: strings.TrimSpace(input.Label), Modifiers: slices.Clone(input.Modifiers)}
	if roll.Modifiers == nil {
		roll.Modifiers = []Modifier{}
	}

	if roll.Label == "" || utf8.RuneCountInString(roll.Label) > MaxRollLabelLength {
		errs = append(errs, ValidationError{Field: "label", Message: fmt.Sprintf("A roll's label must be 1 to %d characters.", MaxRollLabelLength)})
	}

	if (input.Dice == nil) == (input.DiceTotal == nil) {
		errs = append(errs, ValidationError{Field: "dice", Message: "Roll the dice here, or enter the total you rolled."})
	}

	badModifier := slices.ContainsFunc(input.Modifiers, func(m Modifier) bool {
		label := strings.TrimSpace(m.Label)
		return label == "" || utf8.RuneCountInString(label) > MaxModifierLabelLength || m.Value < -MaxModifierValue || m.Value > MaxModifierValue
	})
	if len(input.Modifiers) > MaxModifiers || badModifier {
		errs = append(errs, ValidationError{Field: "modifiers", Message: fmt.Sprintf("Up to %d modifiers, each with a label and a value from -%d to %d.", MaxModifiers, MaxModifierValue, MaxModifierValue)})
	}

	if input.Dice != nil {
		roll.Source = RollSourceApp
		roll.Dice = input.Dice
		for _, d := range input.Dice {
			if !d.Dropped {
				roll.DiceTotal += d.Value
			}
		}
	} else if input.DiceTotal != nil {
		roll.Source = RollSourceManual
		roll.DiceTotal = *input.DiceTotal
	}

	roll.Total = roll.DiceTotal
	for i, m := range roll.Modifiers {
		roll.Modifiers[i].Label = strings.TrimSpace(m.Label)
		roll.Total += m.Value
	}

	return roll, errs
}

// valid reports whether the die's value is one of its faces.
func (d Die) valid() bool {
	return d.Value >= 1 && d.Value <= d.Sides
}

// CanSeeMessage reports whether a campaign member may see a message: the GM
// sees everything, and a player sees everything except whispers between
// others and other players' GM-only rolls. The SQL query
// SelectVisibleCampaignMessages applies the same rule.
func CanSeeMessage(viewerID pgtype.UUID, viewerIsGM bool, message *db.CampaignMessage) bool {
	switch {
	case viewerIsGM, message.AuthorUserID == viewerID:
		return true
	case message.RecipientUserID.Valid:
		return message.RecipientUserID == viewerID
	default:
		return !message.GmOnly
	}
}

// ValidateChatText trims a chat message and checks its length.
func ValidateChatText(text string) (string, error) {
	text = strings.TrimSpace(text)
	if text == "" {
		return text, ValidationError{Field: "body", Message: "Write a message."}
	}
	if utf8.RuneCountInString(text) > MaxChatTextLength {
		return text, ValidationError{Field: "body", Message: fmt.Sprintf("A message must be at most %d characters.", MaxChatTextLength)}
	}

	return text, nil
}

// BonusKind is a bonus's duration: forward or ongoing.
type BonusKind string

const (
	// BonusKindForward applies to the next roll it fits.
	BonusKindForward BonusKind = "forward"
	// BonusKindOngoing applies until the player removes it.
	BonusKindOngoing BonusKind = "ongoing"
)

// BonusInput is a bonus as the player enters it.
type BonusInput struct {
	Amount int32
	Kind   BonusKind
	Label  string
}

// ValidateBonus trims a bonus's label and checks it, returning the trimmed
// input and one error per bad field.
func ValidateBonus(input BonusInput) (BonusInput, []ValidationError) {
	input.Label = strings.TrimSpace(input.Label)

	var errs []ValidationError
	if input.Amount == 0 || input.Amount < -MaxBonusAmount || input.Amount > MaxBonusAmount {
		errs = append(errs, ValidationError{Field: "amount", Message: fmt.Sprintf("The amount must be from -%d to %d, and not 0.", MaxBonusAmount, MaxBonusAmount)})
	}
	if input.Kind != BonusKindForward && input.Kind != BonusKindOngoing {
		errs = append(errs, ValidationError{Field: "kind", Message: "Choose forward or ongoing."})
	}
	if input.Label == "" || utf8.RuneCountInString(input.Label) > MaxBonusLabelLength {
		errs = append(errs, ValidationError{Field: "label", Message: fmt.Sprintf("The label must be 1 to %d characters.", MaxBonusLabelLength)})
	}

	return input, errs
}
