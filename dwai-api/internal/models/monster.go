package models

// Monsters: the SRD compendium (monsters/*.yaml), the stat blocks GMs write
// for their own bestiary, and the monsters a GM has in play in a campaign.
// See docs/game/gm.md, "Monsters". As with characters, the API checks only
// the shape of a stat block; it doesn't judge whether a monster is balanced.

import (
	"cmp"
	"fmt"
	"io/fs"
	"path"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/deepconcern/dwai/dwai-api/internal/data"
	"github.com/goccy/go-yaml"
)

// Monster field limits.
const (
	MaxMonsterArmor             = 10
	MaxMonsterCount             = 20
	MaxMonsterDescriptionLength = 2000
	MaxMonsterHP                = 999
	MaxMonsterInstinctLength    = 200
	MaxMonsterListItemLength    = 200
	MaxMonsterListLength        = 20
	MaxMonsterNameLength        = 60
	MaxMonsterPiercing          = 10
)

// MonsterAttack is a monster's attack: its name, damage dice, and how it
// gets past armor.
type MonsterAttack struct {
	Damage       string   `json:"damage"                 yaml:"damage"`
	IgnoresArmor bool     `json:"ignoresArmor,omitempty" yaml:"ignores_armor"`
	Name         string   `json:"name"                   yaml:"name"`
	Piercing     int32    `json:"piercing,omitempty"     yaml:"piercing"`
	Tags         []string `json:"tags,omitempty"         yaml:"tags"`
}

// MonsterStatBlock is everything a monster's entry says, shared by the
// compendium, custom monsters, and the snapshots in play. HP, armor, and the
// attack are nil for entries without them (NPCs, mostly). It's stored as
// JSON in custom_monsters.stat_block and campaign_monsters.stat_block.
type MonsterStatBlock struct {
	Armor            *int32         `json:"armor,omitempty"            yaml:"armor"`
	Attack           *MonsterAttack `json:"attack,omitempty"           yaml:"attack"`
	Description      string         `json:"description,omitempty"      yaml:"description"`
	HP               *int32         `json:"hp,omitempty"               yaml:"hp"`
	Instinct         string         `json:"instinct,omitempty"         yaml:"instinct"`
	Moves            []string       `json:"moves,omitempty"            yaml:"moves"`
	Name             string         `json:"name"                       yaml:"name"`
	SpecialQualities []string       `json:"specialQualities,omitempty" yaml:"special_qualities"`
	Tags             []string       `json:"tags,omitempty"             yaml:"tags"`
}

// CompendiumMonster is a monster from the SRD compendium.
type CompendiumMonster struct {
	MonsterStatBlock `yaml:",inline"`

	Key        string `yaml:"key"`
	SettingKey string `yaml:"-"`
}

// MonsterSetting is one compendium file: a group of monsters that share a
// setting, such as "Cavern Dwellers".
type MonsterSetting struct {
	Key      string               `yaml:"key"`
	Monsters []*CompendiumMonster `yaml:"monsters"`
	Name     string               `yaml:"name"`
}

// MonsterCompendium holds every compendium monster.
type MonsterCompendium struct {
	all      []*CompendiumMonster
	byKey    map[string]*CompendiumMonster
	settings []*MonsterSetting
	tags     []string
}

// LoadMonsters loads the compendium from monsters/*.yaml. It fails if a
// key is missing or repeated, a file's key isn't its name, or an attack's
// damage doesn't parse.
func LoadMonsters() (*MonsterCompendium, error) {
	paths, err := fs.Glob(data.FS, "monsters/*.yaml")
	if err != nil {
		return nil, fmt.Errorf("list monsters: %w", err)
	}

	compendium := &MonsterCompendium{byKey: map[string]*CompendiumMonster{}}
	tags := map[string]bool{}

	for _, p := range paths {
		content, err := fs.ReadFile(data.FS, p)
		if err != nil {
			return nil, fmt.Errorf("read %s: %w", p, err)
		}

		var setting MonsterSetting
		if err := yaml.Unmarshal(content, &setting); err != nil {
			return nil, fmt.Errorf("parse %s: %w", p, err)
		}
		if want := strings.TrimSuffix(path.Base(p), ".yaml"); setting.Key != want {
			return nil, fmt.Errorf("%s: key is %q, want %q", p, setting.Key, want)
		}

		for _, m := range setting.Monsters {
			switch {
			case m.Key == "":
				return nil, fmt.Errorf("%s: %s has no key", p, m.Name)
			case compendium.byKey[m.Key] != nil:
				return nil, fmt.Errorf("%s: key %q repeats", p, m.Key)
			}
			if m.Attack != nil {
				if err := ValidateDamageExpression(m.Attack.Damage); err != nil {
					return nil, fmt.Errorf("%s: %s: %w", p, m.Name, err)
				}
			}

			m.SettingKey = setting.Key
			compendium.byKey[m.Key] = m
			compendium.all = append(compendium.all, m)
			for _, tag := range m.Tags {
				tags[tag] = true
			}
		}

		compendium.settings = append(compendium.settings, &setting)
	}

	slices.SortFunc(compendium.settings, func(a, b *MonsterSetting) int { return strings.Compare(a.Name, b.Name) })
	slices.SortFunc(compendium.all, func(a, b *CompendiumMonster) int {
		return cmp.Or(
			strings.Compare(compendium.Setting(a.SettingKey).Name, compendium.Setting(b.SettingKey).Name),
			strings.Compare(a.Name, b.Name),
		)
	})
	for tag := range tags {
		compendium.tags = append(compendium.tags, tag)
	}
	slices.SortFunc(compendium.tags, func(a, b string) int {
		return cmp.Or(strings.Compare(strings.ToLower(a), strings.ToLower(b)), strings.Compare(a, b))
	})

	return compendium, nil
}

// All returns every compendium monster, sorted by setting name, then name.
func (c *MonsterCompendium) All() []*CompendiumMonster {
	return c.all
}

// Find returns the monster with key, or nil.
func (c *MonsterCompendium) Find(key string) *CompendiumMonster {
	return c.byKey[key]
}

// Setting returns the setting with key, or nil.
func (c *MonsterCompendium) Setting(key string) *MonsterSetting {
	for _, s := range c.settings {
		if s.Key == key {
			return s
		}
	}

	return nil
}

// Settings returns every setting, sorted by name.
func (c *MonsterCompendium) Settings() []*MonsterSetting {
	return c.settings
}

// Tags returns every tag the compendium's monsters use, sorted
// case-insensitively.
func (c *MonsterCompendium) Tags() []string {
	return c.tags
}

// damageTerm is one term of a damage expression: dice (NdS), the best or
// worst of some dice (b[NdS], w[NdS]), or a flat number, with a sign.
var damageTerm = regexp.MustCompile(`^([+-])?(?:([bw])\[(\d*)d(\d+)\]|(\d*)d(\d+)|(\d+))`)

// ValidateDamageExpression checks a damage expression such as d8, 2d6+1,
// b[2d10] (best of two d10), or w[2d8]-2 (worst of two d8, minus 2). It
// accepts what the app's damage dialog can roll (dwai-app/lib/dice.ts):
// d4 to d20, at most 10 dice, and no subtracted dice.
func ValidateDamageExpression(expression string) error {
	rest := strings.ReplaceAll(expression, " ", "")
	if rest == "" {
		return ValidationError{Field: "damage", Message: "Enter the damage dice, such as d8 or 2d6+1."}
	}

	invalid := ValidationError{Field: "damage", Message: fmt.Sprintf("%q isn't a damage expression like d8, 2d6+1, or b[2d10].", expression)}
	diceCount := 0
	first := true

	for rest != "" {
		match := damageTerm.FindStringSubmatch(rest)
		if match == nil || (!first && match[1] == "") {
			return invalid
		}
		rest = rest[len(match[0]):]
		first = false

		if match[7] != "" {
			continue // a flat number
		}
		if match[1] == "-" {
			return ValidationError{Field: "damage", Message: "Dice can't be subtracted."}
		}

		count, sides := match[5], match[6]
		if match[2] != "" {
			count, sides = match[3], match[4]
		}
		n := 1
		if count != "" {
			n, _ = strconv.Atoi(count)
		}
		s, _ := strconv.Atoi(sides)
		if n < 1 || !slices.Contains(damageDice, int32(s)) {
			return ValidationError{Field: "damage", Message: fmt.Sprintf("d%d isn't one of d4, d6, d8, d10, d12, or d20.", s)}
		}
		diceCount += n
	}

	if diceCount > MaxDamageDice {
		return ValidationError{Field: "damage", Message: fmt.Sprintf("Roll at most %d dice.", MaxDamageDice)}
	}

	return nil
}

// ValidateMonster trims a stat block and checks its shape, returning the
// trimmed stat block and one error per bad field. Only the name is
// required.
func ValidateMonster(input MonsterStatBlock) (MonsterStatBlock, []ValidationError) {
	var errs []ValidationError
	add := func(field, format string, args ...any) {
		errs = append(errs, ValidationError{Field: field, Message: fmt.Sprintf(format, args...)})
	}

	out := input
	out.Name = strings.TrimSpace(input.Name)
	out.Description = strings.TrimSpace(input.Description)
	out.Instinct = strings.TrimSpace(input.Instinct)

	if out.Name == "" || utf8.RuneCountInString(out.Name) > MaxMonsterNameLength {
		add("name", "The name must be 1 to %d characters.", MaxMonsterNameLength)
	}
	if out.HP != nil && (*out.HP < 1 || *out.HP > MaxMonsterHP) {
		add("hp", "HP must be from 1 to %d.", MaxMonsterHP)
	}
	if out.Armor != nil && (*out.Armor < 0 || *out.Armor > MaxMonsterArmor) {
		add("armor", "Armor must be from 0 to %d.", MaxMonsterArmor)
	}

	if input.Attack != nil {
		attack := *input.Attack
		attack.Name = strings.TrimSpace(attack.Name)
		attack.Damage = strings.ReplaceAll(attack.Damage, " ", "")
		out.Attack = &attack

		if attack.Name == "" || utf8.RuneCountInString(attack.Name) > MaxMonsterNameLength {
			add("attack.name", "The attack's name must be 1 to %d characters.", MaxMonsterNameLength)
		}
		if err := ValidateDamageExpression(attack.Damage); err != nil {
			add("attack.damage", "%s", err.Error())
		}
		if attack.Piercing < 0 || attack.Piercing > MaxMonsterPiercing {
			add("attack.piercing", "Piercing must be from 0 to %d.", MaxMonsterPiercing)
		}
		attack.Tags, errs = trimMonsterList("attack.tags", attack.Tags, errs)
	}

	if utf8.RuneCountInString(out.Instinct) > MaxMonsterInstinctLength {
		add("instinct", "The instinct must be at most %d characters.", MaxMonsterInstinctLength)
	}
	if utf8.RuneCountInString(out.Description) > MaxMonsterDescriptionLength {
		add("description", "The description must be at most %d characters.", MaxMonsterDescriptionLength)
	}

	out.Moves, errs = trimMonsterList("moves", input.Moves, errs)
	out.SpecialQualities, errs = trimMonsterList("specialQualities", input.SpecialQualities, errs)
	out.Tags, errs = trimMonsterList("tags", input.Tags, errs)

	return out, errs
}

// trimMonsterList trims each entry of a stat block list and drops blank
// ones, adding an error if the list is too long or an entry too long.
func trimMonsterList(field string, list []string, errs []ValidationError) ([]string, []ValidationError) {
	out := make([]string, 0, len(list))
	for _, item := range list {
		if item = strings.TrimSpace(item); item != "" {
			out = append(out, item)
		}
	}

	tooLong := slices.ContainsFunc(out, func(s string) bool { return utf8.RuneCountInString(s) > MaxMonsterListItemLength })
	if len(out) > MaxMonsterListLength || tooLong {
		errs = append(errs, ValidationError{Field: field, Message: fmt.Sprintf("At most %d entries, each up to %d characters.", MaxMonsterListLength, MaxMonsterListItemLength)})
	}

	return out, errs
}

// ValidateMonsterName trims a monster in play's name and checks it.
func ValidateMonsterName(field, name string) (string, error) {
	name = strings.TrimSpace(name)
	if name == "" || utf8.RuneCountInString(name) > MaxMonsterNameLength {
		return name, ValidationError{Field: field, Message: fmt.Sprintf("The name must be 1 to %d characters.", MaxMonsterNameLength)}
	}

	return name, nil
}

// NextMonsterNames names count new monsters in play called base. A single
// monster keeps the name ("Ogre"), and several are numbered ("Goblin 1" to
// "Goblin 4"). When monsters with that name are already in play, numbering
// continues after the highest ("Goblin 5"); an unnumbered one counts as 1.
func NextMonsterNames(base string, count int, existing []string) []string {
	highest := 0
	for _, name := range existing {
		if name == base {
			highest = max(highest, 1)
			continue
		}
		if n, err := strconv.Atoi(strings.TrimPrefix(name, base+" ")); err == nil && strings.HasPrefix(name, base+" ") && n > 0 {
			highest = max(highest, n)
		}
	}

	if count == 1 && highest == 0 {
		return []string{base}
	}

	names := make([]string, count)
	for i := range names {
		names[i] = fmt.Sprintf("%s %d", base, highest+i+1)
	}

	return names
}
