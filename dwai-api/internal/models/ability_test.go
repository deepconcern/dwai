package models_test

import (
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/models"
)

func TestAbilityModifier(t *testing.T) {
	// Every score in range, so each band's edges are checked.
	want := map[int32]int32{
		1: -3, 2: -3, 3: -3,
		4: -2, 5: -2,
		6: -1, 7: -1, 8: -1,
		9: 0, 10: 0, 11: 0, 12: 0,
		13: 1, 14: 1, 15: 1,
		16: 2, 17: 2,
		18: 3,
	}

	for score := int32(1); score <= 18; score++ {
		if got := models.AbilityModifier(score); got != want[score] {
			t.Errorf("AbilityModifier(%d) = %d, want %d", score, got, want[score])
		}
	}
}
