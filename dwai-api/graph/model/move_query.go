package model

type ModelQuery struct {
	All   []*Move `json:"all"`
	ByKey *Move   `json:"byKey"`
}
