package models

// Fronts: the GM's prep for a campaign (docs/game/gm.md, "Fronts"). A front
// groups dangers, each with grim portents leading to an impending doom, and
// stakes questions. Encounters are planned groups of monsters. All of it is
// an optional organizer: the API checks only shape, and the rules' limits (1
// to 3 dangers, a few portents) are hints in the app, not enforced.

import (
	"fmt"
	"slices"
	"strings"
	"unicode/utf8"

	"github.com/deepconcern/dwai/dwai-api/internal/data"
	"github.com/goccy/go-yaml"
)

// Front, danger, and encounter field limits.
const (
	MaxDangerNotesLength    = 2000
	MaxDangerTextLength     = 200
	MaxDangerTypeLength     = 100
	MaxEncounterLocation    = 100
	MaxEncounterNotesLength = 2000
	MaxFrontNotesLength     = 5000
	MaxPortentLength        = 200
	MaxPortents             = 20
	MaxPrepNameLength       = 100
	MaxStakeAnswerLength    = 1000
	MaxStakeQuestionLength  = 200
	MaxStakes               = 10
)

// Front kinds.
const (
	FrontKindAdventure = "ADVENTURE"
	FrontKindCampaign  = "CAMPAIGN"
)

// DangerType is a suggested kind of danger, such as a Cult, with the
// impulse that drives it.
type DangerType struct {
	Impulse string `yaml:"impulse"`
	Key     string `yaml:"key"`
	Name    string `yaml:"name"`
}

// DangerCategory groups danger types that share a list of moves, such as
// Ambitious Organizations.
type DangerCategory struct {
	Key   string        `yaml:"key"`
	Moves []string      `yaml:"moves"`
	Name  string        `yaml:"name"`
	Types []*DangerType `yaml:"types"`
}

// ImpendingDoom is a kind of impending doom, such as Tyranny.
type ImpendingDoom struct {
	Description string `yaml:"description"`
	Key         string `yaml:"key"`
	Name        string `yaml:"name"`
}

// DangerTemplate is the template fronts are built from (fronts.yaml). The
// app only suggests from it.
type DangerTemplate struct {
	categories []*DangerCategory
	dooms      []*ImpendingDoom
	byType     map[string]*DangerCategory
}

// LoadDangerTemplate loads fronts.yaml. It fails on a missing or repeated
// key, or a type without an impulse.
func LoadDangerTemplate() (*DangerTemplate, error) {
	content, err := data.FS.ReadFile("fronts.yaml")
	if err != nil {
		return nil, fmt.Errorf("read fronts.yaml: %w", err)
	}

	var file struct {
		DangerCategories []*DangerCategory `yaml:"danger_categories"`
		ImpendingDooms   []*ImpendingDoom  `yaml:"impending_dooms"`
	}
	if err := yaml.Unmarshal(content, &file); err != nil {
		return nil, fmt.Errorf("parse fronts.yaml: %w", err)
	}

	template := &DangerTemplate{categories: file.DangerCategories, dooms: file.ImpendingDooms, byType: map[string]*DangerCategory{}}
	keys := map[string]bool{}
	checkKey := func(key, name string) error {
		switch {
		case key == "":
			return fmt.Errorf("fronts.yaml: %s has no key", name)
		case keys[key]:
			return fmt.Errorf("fronts.yaml: key %q repeats", key)
		}
		keys[key] = true
		return nil
	}

	for _, c := range template.categories {
		if err := checkKey(c.Key, c.Name); err != nil {
			return nil, err
		}
		for _, t := range c.Types {
			if err := checkKey(t.Key, t.Name); err != nil {
				return nil, err
			}
			if t.Impulse == "" {
				return nil, fmt.Errorf("fronts.yaml: %s has no impulse", t.Name)
			}
			template.byType[normalizeTypeName(t.Name)] = c
		}
	}
	for _, d := range template.dooms {
		if err := checkKey(d.Key, d.Name); err != nil {
			return nil, err
		}
	}

	return template, nil
}

// Categories returns the danger categories, in the template's order.
func (t *DangerTemplate) Categories() []*DangerCategory {
	return t.categories
}

// ImpendingDooms returns the kinds of impending doom, in the template's
// order.
func (t *DangerTemplate) ImpendingDooms() []*ImpendingDoom {
	return t.dooms
}

// CategoryOf returns the category of the template type a danger's type
// names (ignoring case and surrounding spaces), or nil when it names none.
func (t *DangerTemplate) CategoryOf(dangerType string) *DangerCategory {
	return t.byType[normalizeTypeName(dangerType)]
}

func normalizeTypeName(name string) string {
	return strings.ToLower(strings.TrimSpace(name))
}

// Stake is a front's stakes question, with the GM's note once play answers
// it. It's stored as JSON in fronts.stakes.
type Stake struct {
	Answer   string `json:"answer"`
	Question string `json:"question"`
}

// FrontInput is a front's editable details, as entered. The kind is checked
// by the GraphQL enum.
type FrontInput struct {
	Kind   string
	Name   string
	Notes  string
	Stakes []Stake
}

// ValidateFrontInput trims a front's details and checks them, returning
// the trimmed input and one error per bad field.
func ValidateFrontInput(input FrontInput) (FrontInput, []ValidationError) {
	out := FrontInput{
		Kind:   input.Kind,
		Name:   strings.TrimSpace(input.Name),
		Notes:  strings.TrimSpace(input.Notes),
		Stakes: make([]Stake, len(input.Stakes)),
	}

	var errs []ValidationError
	errs = checkPrepName(out.Name, errs)
	errs = checkMaxLength("notes", "The notes", out.Notes, MaxFrontNotesLength, errs)

	badStake := len(input.Stakes) > MaxStakes
	for i, s := range input.Stakes {
		out.Stakes[i] = Stake{Answer: strings.TrimSpace(s.Answer), Question: strings.TrimSpace(s.Question)}
		q, a := out.Stakes[i].Question, out.Stakes[i].Answer
		if q == "" || utf8.RuneCountInString(q) > MaxStakeQuestionLength || utf8.RuneCountInString(a) > MaxStakeAnswerLength {
			badStake = true
		}
	}
	if badStake {
		errs = append(errs, ValidationError{Field: "stakes", Message: fmt.Sprintf("Up to %d stakes questions, each 1 to %d characters, with answers up to %d.", MaxStakes, MaxStakeQuestionLength, MaxStakeAnswerLength)})
	}

	return out, errs
}

// PortentInput is a grim portent as entered: an existing portent's ID, or
// "" for a new one, and its text.
type PortentInput struct {
	ID   string
	Text string
}

// DangerInput is a danger's editable details, as entered. Its front is
// checked by the resolver.
type DangerInput struct {
	ImpendingDoom string
	Impulse       string
	Name          string
	Notes         string
	Portents      []PortentInput
	Type          string
}

// ValidateDangerInput trims a danger's details and checks them, returning
// the trimmed input and one error per bad field. Only the name is
// required.
func ValidateDangerInput(input DangerInput) (DangerInput, []ValidationError) {
	out := DangerInput{
		ImpendingDoom: strings.TrimSpace(input.ImpendingDoom),
		Impulse:       strings.TrimSpace(input.Impulse),
		Name:          strings.TrimSpace(input.Name),
		Notes:         strings.TrimSpace(input.Notes),
		Portents:      make([]PortentInput, len(input.Portents)),
		Type:          strings.TrimSpace(input.Type),
	}

	var errs []ValidationError
	errs = checkPrepName(out.Name, errs)
	errs = checkMaxLength("type", "The type", out.Type, MaxDangerTypeLength, errs)
	errs = checkMaxLength("impulse", "The impulse", out.Impulse, MaxDangerTextLength, errs)
	errs = checkMaxLength("impendingDoom", "The impending doom", out.ImpendingDoom, MaxDangerTextLength, errs)
	errs = checkMaxLength("notes", "The notes", out.Notes, MaxDangerNotesLength, errs)

	badPortent := len(input.Portents) > MaxPortents
	for i, p := range input.Portents {
		out.Portents[i] = PortentInput{ID: p.ID, Text: strings.TrimSpace(p.Text)}
		if text := out.Portents[i].Text; text == "" || utf8.RuneCountInString(text) > MaxPortentLength {
			badPortent = true
		}
	}
	if badPortent {
		errs = append(errs, ValidationError{Field: "portents", Message: fmt.Sprintf("Up to %d grim portents, each 1 to %d characters.", MaxPortents, MaxPortentLength)})
	}

	return out, errs
}

// EncounterInput is an encounter's editable details, as entered. Its
// danger is checked by the resolver.
type EncounterInput struct {
	Location string
	Name     string
	Notes    string
}

// ValidateEncounterInput trims an encounter's details and checks them,
// returning the trimmed input and one error per bad field.
func ValidateEncounterInput(input EncounterInput) (EncounterInput, []ValidationError) {
	out := EncounterInput{
		Location: strings.TrimSpace(input.Location),
		Name:     strings.TrimSpace(input.Name),
		Notes:    strings.TrimSpace(input.Notes),
	}

	var errs []ValidationError
	errs = checkPrepName(out.Name, errs)
	errs = checkMaxLength("location", "The location", out.Location, MaxEncounterLocation, errs)
	errs = checkMaxLength("notes", "The notes", out.Notes, MaxEncounterNotesLength, errs)

	return out, errs
}

// checkPrepName checks a front's, danger's, or encounter's name.
func checkPrepName(name string, errs []ValidationError) []ValidationError {
	if name == "" || utf8.RuneCountInString(name) > MaxPrepNameLength {
		errs = append(errs, ValidationError{Field: "name", Message: fmt.Sprintf("The name must be 1 to %d characters.", MaxPrepNameLength)})
	}

	return errs
}

// checkMaxLength adds an error if value is longer than limit characters.
func checkMaxLength(field, label, value string, limit int, errs []ValidationError) []ValidationError {
	if utf8.RuneCountInString(value) > limit {
		errs = append(errs, ValidationError{Field: field, Message: fmt.Sprintf("%s must be at most %d characters.", label, limit)})
	}

	return errs
}

// PlannedPortent is a grim portent's place in a danger's list after an
// edit. ID is "" for a new portent.
type PlannedPortent struct {
	ID       string
	Position int
	Text     string
}

// PortentPlan is how to turn a danger's portents into an edited list:
// which to add, which to keep (with their new place and text, keeping their
// checked and revealed state), and which IDs to remove.
type PortentPlan struct {
	Add    []PlannedPortent
	Keep   []PlannedPortent
	Remove []string
}

// PlanPortents plans an edit of a danger's portents: existing is the IDs
// it has, and input the edited list in order.
func PlanPortents(existing []string, input []PortentInput) (PortentPlan, error) {
	var plan PortentPlan
	kept := map[string]bool{}

	for i, p := range input {
		if p.ID == "" {
			plan.Add = append(plan.Add, PlannedPortent{Position: i, Text: p.Text})
			continue
		}
		if !slices.Contains(existing, p.ID) || kept[p.ID] {
			return PortentPlan{}, ValidationError{Field: "portents", Message: "A grim portent isn't one of this danger's, or is listed twice."}
		}
		kept[p.ID] = true
		plan.Keep = append(plan.Keep, PlannedPortent{ID: p.ID, Position: i, Text: p.Text})
	}
	for _, id := range existing {
		if !kept[id] {
			plan.Remove = append(plan.Remove, id)
		}
	}

	return plan, nil
}
