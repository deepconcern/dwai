package models

// AbilityModifier returns the modifier for an ability score, per the
// standard table: 1–3 is −3, 4–5 is −2, 6–8 is −1, 9–12 is 0, 13–15 is +1,
// 16–17 is +2, and 18 is +3.
func AbilityModifier(score int32) int32 {
	switch {
	case score <= 3:
		return -3
	case score <= 5:
		return -2
	case score <= 8:
		return -1
	case score <= 12:
		return 0
	case score <= 15:
		return 1
	case score <= 17:
		return 2
	default:
		return 3
	}
}
