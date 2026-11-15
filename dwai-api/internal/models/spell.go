package models

import (
	"fmt"
	"io/fs"
	"slices"
	"strconv"
	"strings"

	"github.com/deepconcern/dwai/dwai-api/internal/data"
	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/goccy/go-yaml"
)

// Spell data and the rules for Wizard and Cleric spells. See
// docs/game/rules.md, "Spells".

// SpellModel is a spell from spells/*.yaml. Level is 0 for cantrips (Wizard)
// and rotes (Cleric), which are always prepared.
type SpellModel struct {
	Description string
	Key         string
	Level       int32 `yaml:"-"`
	Name        string
	Options     []string
	Tags        []string
}

func (s *SpellModel) ToObject() *model.Spell {
	options := s.Options
	if options == nil {
		options = []string{}
	}
	tags := s.Tags
	if tags == nil {
		tags = []string{}
	}

	return &model.Spell{
		Description: s.Description,
		Key:         s.Key,
		Level:       s.Level,
		Name:        s.Name,
		Options:     options,
		Tags:        tags,
	}
}

// SpellMap holds each spellcasting class's spells, keyed by class key and
// sorted by level, then name.
type SpellMap map[string][]*SpellModel

// spellFiles maps each spellcasting class to its spell file and the file's
// top-level key.
var spellFiles = map[string]string{
	"cleric": "cleric_spells",
	"wizard": "wizard_spells",
}

// LoadSpells loads every spellcasting class's spells.
func LoadSpells() (*SpellMap, error) {
	spells := make(SpellMap)

	for classKey, name := range spellFiles {
		path := "spells/" + name + ".yaml"

		content, err := fs.ReadFile(data.FS, path)
		if err != nil {
			return nil, fmt.Errorf("read %s: %w", path, err)
		}

		var file map[string]map[string][]*SpellModel
		if err := yaml.Unmarshal(content, &file); err != nil {
			return nil, fmt.Errorf("parse %s: %w", path, err)
		}

		var list []*SpellModel
		for group, groupSpells := range file[name] {
			level, err := spellGroupLevel(group)
			if err != nil {
				return nil, fmt.Errorf("%s: %w", path, err)
			}
			for _, s := range groupSpells {
				s.Level = level
				list = append(list, s)
			}
		}

		slices.SortFunc(list, func(a, b *SpellModel) int {
			if a.Level != b.Level {
				return int(a.Level - b.Level)
			}
			return strings.Compare(a.Name, b.Name)
		})
		spells[classKey] = list
	}

	return &spells, nil
}

// spellGroupLevel parses a spell file's group name: "cantrips" is level 0,
// "level_N" is level N.
func spellGroupLevel(group string) (int32, error) {
	if group == "cantrips" {
		return 0, nil
	}

	n, err := strconv.Atoi(strings.TrimPrefix(group, "level_"))
	if err != nil || !strings.HasPrefix(group, "level_") {
		return 0, fmt.Errorf("unknown spell group '%s'", group)
	}

	return int32(n), nil
}

// Find returns the class's spell with key, or nil.
func (m *SpellMap) Find(classKey, key string) *SpellModel {
	for _, s := range (*m)[classKey] {
		if s.Key == key {
			return s
		}
	}

	return nil
}

// IsSpellcaster reports whether the class casts spells.
func (m *SpellMap) IsSpellcaster(classKey string) bool {
	return len((*m)[classKey]) > 0
}

// UsesSpellbook reports whether the class prepares spells from a spellbook
// (the Wizard) rather than from its whole spell list (the Cleric).
func UsesSpellbook(classKey string) bool {
	return classKey == "wizard"
}

// ExpectedSpellbookSize is how many leveled spells a Wizard's spellbook
// should hold: three at level 1, plus one per level gained. The sheet only
// warns when the spellbook differs.
func ExpectedSpellbookSize(level int32) int32 {
	return 3 + level - 1
}

// MaxPreparedSpellLevels is the most spell levels a caster can have prepared
// at once: their level + 1.
func MaxPreparedSpellLevels(level int32) int32 {
	return level + 1
}

// PreparedSpellLevels is the total level of the prepared spells.
func PreparedSpellLevels(spells []*SpellModel) int32 {
	var total int32
	for _, s := range spells {
		total += s.Level
	}

	return total
}

var notASpellcaster = ValidationError{Field: "characterId", Message: "This character doesn't cast spells."}

// ValidateAddToSpellbook checks a spell being added to a Wizard's spellbook:
// it must be a leveled Wizard spell of the character's level or lower, and
// not already there.
func ValidateAddToSpellbook(spells *SpellMap, classKey string, level int32, spellbook []string, spellKey string) error {
	if !UsesSpellbook(classKey) {
		return ValidationError{Field: "characterId", Message: "Only Wizards have a spellbook."}
	}

	spell := spells.Find(classKey, spellKey)
	switch {
	case spell == nil:
		return ValidationError{Field: "spellKey", Message: fmt.Sprintf("Unknown spell '%s'.", spellKey)}
	case spell.Level == 0:
		return ValidationError{Field: "spellKey", Message: fmt.Sprintf("%s is a cantrip: it's always prepared, so it isn't kept in the spellbook.", spell.Name)}
	case spell.Level > level:
		return ValidationError{Field: "spellKey", Message: fmt.Sprintf("%s is level %d, above the character's level (%d).", spell.Name, spell.Level, level)}
	case slices.Contains(spellbook, spellKey):
		return ValidationError{Field: "spellKey", Message: fmt.Sprintf("%s is already in the spellbook.", spell.Name)}
	}

	return nil
}

// ValidatePreparedSpells checks a new set of prepared spells (Prepare Spells
// or Commune), returning every problem found. Each must be a leveled spell
// of the class, listed once; a Wizard's must be in their spellbook, and a
// Cleric's no higher than their level; and the total levels can't exceed
// level + 1. Cantrips and rotes are always prepared, so they aren't listed.
func ValidatePreparedSpells(spells *SpellMap, classKey string, level int32, spellbook []string, spellKeys []string) []ValidationError {
	if !spells.IsSpellcaster(classKey) {
		return []ValidationError{notASpellcaster}
	}

	var errs []ValidationError
	add := func(format string, args ...any) {
		errs = append(errs, ValidationError{Field: "spellKeys", Message: fmt.Sprintf(format, args...)})
	}

	var prepared []*SpellModel
	for i, key := range spellKeys {
		spell := spells.Find(classKey, key)
		switch {
		case spell == nil:
			add("Unknown spell '%s'.", key)
		case slices.Contains(spellKeys[:i], key):
			add("%s is listed more than once.", spell.Name)
		case spell.Level == 0:
			add("%s is always prepared; leave it out.", spell.Name)
		case UsesSpellbook(classKey) && !slices.Contains(spellbook, key):
			add("%s isn't in the spellbook.", spell.Name)
		case !UsesSpellbook(classKey) && spell.Level > level:
			add("%s is level %d, above the character's level (%d).", spell.Name, spell.Level, level)
		default:
			prepared = append(prepared, spell)
		}
	}

	if total, limit := PreparedSpellLevels(prepared), MaxPreparedSpellLevels(level); total > limit {
		add("These spells total %d levels; the limit is %d (level + 1).", total, limit)
	}

	return errs
}

// SpellsByKey returns the class's spells with the given keys, in the order
// given. Keys the class doesn't have are skipped.
func (m *SpellMap) SpellsByKey(classKey string, keys []string) []*SpellModel {
	out := make([]*SpellModel, 0, len(keys))
	for _, key := range keys {
		if s := m.Find(classKey, key); s != nil {
			out = append(out, s)
		}
	}

	return out
}

// RequireSpellcaster returns a validation error if the class doesn't cast
// spells.
func (m *SpellMap) RequireSpellcaster(classKey string) error {
	if !m.IsSpellcaster(classKey) {
		return notASpellcaster
	}

	return nil
}
