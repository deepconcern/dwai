package models_test

import (
	"errors"
	"slices"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/graph/model"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
)

func tag(key string, quantity ...int32) *model.Tag {
	t := &model.Tag{Key: key}
	if len(quantity) > 0 {
		t.Quantity = &quantity[0]
	}
	return t
}

func TestMaxHitPoints(t *testing.T) {
	class := &models.CharacterClassModel{HpBase: 10}

	// The full Constitution score is added, not the modifier.
	if got := models.MaxHitPoints(class, 15); got != 25 {
		t.Errorf("MaxHitPoints(10 base, CON 15) = %d, want 25", got)
	}
}

func TestMaxLoad(t *testing.T) {
	class := &models.CharacterClassModel{StartingGear: &models.StartingGearModel{LoadBase: 12}}

	for _, tc := range []struct {
		strength int32
		want     int32
	}{
		{strength: 16, want: 14},
		{strength: 12, want: 12},
		{strength: 8, want: 11},
	} {
		if got := models.MaxLoad(class, tc.strength); got != tc.want {
			t.Errorf("MaxLoad(12 base, STR %d) = %d, want %d", tc.strength, got, tc.want)
		}
	}
}

func TestArmor(t *testing.T) {
	leather := &model.Item{IsWorn: true, Tags: []*model.Tag{tag("armor", 1), tag("worn")}, Type: "armor"}
	chainmail := &model.Item{IsWorn: true, Tags: []*model.Tag{tag("armor", 2), tag("worn")}, Type: "armor"}
	unwornPlate := &model.Item{Tags: []*model.Tag{tag("armor", 3), tag("worn")}, Type: "armor"}
	bonusArmor := &model.Item{IsWorn: true, Tags: []*model.Tag{tag("armor_bonus", 1), tag("worn")}, Type: "armor"}
	shield := &model.Item{Tags: []*model.Tag{tag("armor_bonus", 1)}, Type: "shield"}
	sword := &model.Item{Tags: []*model.Tag{tag("close"), tag("armor", 5)}, Type: "weapon"}

	for _, tc := range []struct {
		name  string
		items []*model.Item
		want  int32
	}{
		{name: "nothing", want: 0},
		{name: "worn armor", items: []*model.Item{chainmail}, want: 2},
		{name: "unworn armor doesn't count", items: []*model.Item{unwornPlate}, want: 0},
		{name: "only the best armor counts", items: []*model.Item{leather, chainmail}, want: 2},
		{name: "worn armor bonuses add up", items: []*model.Item{chainmail, bonusArmor}, want: 3},
		{name: "shields add their bonus", items: []*model.Item{chainmail, shield}, want: 3},
		{name: "non-armor items don't count", items: []*model.Item{sword}, want: 0},
	} {
		if got := models.Armor(tc.items); got != tc.want {
			t.Errorf("%s: Armor = %d, want %d", tc.name, got, tc.want)
		}
	}
}

func TestLoad(t *testing.T) {
	items := []*model.Item{
		{Count: 1, Tags: []*model.Tag{tag("weight", 2)}},
		{Count: 3, Tags: []*model.Tag{tag("weight", 1)}},
		{Count: 2, Tags: []*model.Tag{tag("close")}},
	}

	if got := models.Load(items); got != 5 {
		t.Errorf("Load = %d, want 5 (2 + 3×1, weightless items ignored)", got)
	}
}

func TestDamageTaken(t *testing.T) {
	for _, tc := range []struct {
		name   string
		damage models.DamageInput
		armor  int32
		want   int32
	}{
		{name: "armor is subtracted", damage: models.DamageInput{Amount: 5}, armor: 2, want: 3},
		{name: "never below 0", damage: models.DamageInput{Amount: 1}, armor: 3, want: 0},
		{name: "piercing reduces armor", damage: models.DamageInput{Amount: 5, Piercing: 1}, armor: 2, want: 4},
		{name: "piercing beyond armor adds nothing", damage: models.DamageInput{Amount: 5, Piercing: 4}, armor: 2, want: 5},
		{name: "ignores armor", damage: models.DamageInput{Amount: 5, IgnoresArmor: true}, armor: 2, want: 5},
	} {
		if got := models.DamageTaken(tc.damage, tc.armor); got != tc.want {
			t.Errorf("%s: DamageTaken = %d, want %d", tc.name, got, tc.want)
		}
	}
}

func TestApplyDamageFloorsAtZero(t *testing.T) {
	if got := models.ApplyDamage(10, models.DamageInput{Amount: 7}, 1); got != 4 {
		t.Errorf("ApplyDamage(10 HP, 7 damage, 1 armor) = %d, want 4", got)
	}
	if got := models.ApplyDamage(3, models.DamageInput{Amount: 10}, 0); got != 0 {
		t.Errorf("ApplyDamage(3 HP, 10 damage) = %d, want 0", got)
	}
}

func TestDamageInputValidate(t *testing.T) {
	if errs := (models.DamageInput{Amount: 3, Piercing: 1}).Validate(); len(errs) != 0 {
		t.Errorf("valid damage reported %v", errs)
	}

	errs := models.DamageInput{Amount: -1, Piercing: -1}.Validate()
	if got := fields(errs); !slices.Equal(got, []string{"amount", "piercing"}) {
		t.Errorf("negative damage and piercing reported fields %v", got)
	}
}

func TestHeal(t *testing.T) {
	for _, tc := range []struct {
		name              string
		hp, maxHP, amount int32
		want              int32
	}{
		{name: "heals", hp: 5, maxHP: 20, amount: 4, want: 9},
		{name: "capped at max", hp: 18, maxHP: 20, amount: 5, want: 20},
		{name: "doesn't lower HP above max", hp: 22, maxHP: 20, amount: 1, want: 22},
		{name: "heals from 0", hp: 0, maxHP: 20, amount: 1, want: 1},
	} {
		got, err := models.Heal(tc.hp, tc.maxHP, tc.amount)
		if err != nil || got != tc.want {
			t.Errorf("%s: Heal = %d, %v; want %d", tc.name, got, err, tc.want)
		}
	}

	var ve models.ValidationError
	if _, err := models.Heal(5, 20, -1); !errors.As(err, &ve) || ve.Field != "amount" {
		t.Errorf("negative healing returned %v, want a validation error on amount", err)
	}
}

func TestAdjustGold(t *testing.T) {
	if got, err := models.AdjustGold(10, 5); err != nil || got != 15 {
		t.Errorf("AdjustGold(10, +5) = %d, %v; want 15", got, err)
	}
	if got, err := models.AdjustGold(10, -10); err != nil || got != 0 {
		t.Errorf("AdjustGold(10, -10) = %d, %v; want 0", got, err)
	}

	var ve models.ValidationError
	if _, err := models.AdjustGold(10, -11); !errors.As(err, &ve) || ve.Field != "delta" {
		t.Errorf("AdjustGold(10, -11) returned %v, want a validation error on delta", err)
	}
}

func TestSetDebility(t *testing.T) {
	got := models.SetDebility([]string{"WEAK"}, model.DebilityConfused, true)
	if !slices.Equal(got, []string{"CONFUSED", "WEAK"}) {
		t.Errorf("setting Confused gave %v", got)
	}

	// Setting one that's already active doesn't duplicate it.
	if got := models.SetDebility(got, model.DebilityWeak, true); !slices.Equal(got, []string{"CONFUSED", "WEAK"}) {
		t.Errorf("setting Weak again gave %v", got)
	}

	if got := models.SetDebility(got, model.DebilityWeak, false); !slices.Equal(got, []string{"CONFUSED"}) {
		t.Errorf("clearing Weak gave %v", got)
	}

	// Clearing one that isn't active is a no-op.
	if got := models.SetDebility(nil, model.DebilitySick, false); len(got) != 0 {
		t.Errorf("clearing an inactive debility gave %v", got)
	}
}

func TestValidateItemCount(t *testing.T) {
	if err := models.ValidateItemCount(1); err != nil {
		t.Errorf("count 1 reported %v", err)
	}
	if err := models.ValidateItemCount(0); err == nil {
		t.Error("count 0 wasn't rejected")
	}
}

func TestValidateAddItemInput(t *testing.T) {
	templates := &models.ItemTemplateMap{"rope": {Key: "rope", Name: "Rope"}}
	tags := &models.TagDefinitionMap{"weight": {Key: "weight", Name: "n Weight"}}
	label := "Lucky coin"
	empty := ""
	negative := int32(-1)

	for _, tc := range []struct {
		name  string
		input model.AddItemInput
		want  []string
	}{
		{name: "template item", input: model.AddItemInput{Count: 1, Key: "rope"}},
		{name: "custom item", input: model.AddItemInput{Count: 1, Key: "custom", Label: &label, Tags: []*model.TagInput{{Key: "weight", Quantity: ptr(int32(1))}}}},
		{name: "unknown template", input: model.AddItemInput{Count: 1, Key: "nope"}, want: []string{"key"}},
		{name: "custom without label", input: model.AddItemInput{Count: 1, Key: "custom"}, want: []string{"label"}},
		{name: "custom with empty label", input: model.AddItemInput{Count: 1, Key: "custom", Label: &empty}, want: []string{"label"}},
		{name: "zero count", input: model.AddItemInput{Count: 0, Key: "rope"}, want: []string{"count"}},
		{name: "unknown tag", input: model.AddItemInput{Count: 1, Key: "rope", Tags: []*model.TagInput{{Key: "shiny"}}}, want: []string{"tags"}},
		{name: "negative tag quantity", input: model.AddItemInput{Count: 1, Key: "rope", Tags: []*model.TagInput{{Key: "weight", Quantity: &negative}}}, want: []string{"tags"}},
	} {
		got := fields(models.ValidateAddItemInput(tc.input, templates, tags))
		if !slices.Equal(got, tc.want) {
			t.Errorf("%s: reported fields %v, want %v", tc.name, got, tc.want)
		}
	}
}

func TestTagToObjectFallsBackToKey(t *testing.T) {
	td := &models.TagDefinitionMap{"close": {Key: "close", Name: "Close"}}

	if got := (&models.TagModel{Key: "close"}).ToObject(td).Name; got != "Close" {
		t.Errorf("known tag name = %q, want Close", got)
	}
	if got := (&models.TagModel{Key: "14-Charisma coins"}).ToObject(td).Name; got != "14-Charisma coins" {
		t.Errorf("unknown tag name = %q, want its key", got)
	}
}
