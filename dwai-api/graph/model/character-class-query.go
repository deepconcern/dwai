package model

type CharacterClassQuery struct {
	All   []*CharacterClass `json:"all"`
	ByKey *CharacterClass   `json:"byKey"`
}
