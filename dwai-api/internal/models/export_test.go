package models

// Exposes unexported functions to the external models_test package. Only
// compiled during tests.
var (
	MergeIdenticalItems = mergeIdenticalItems
	ResolveItemFields   = resolveItemFields
)
