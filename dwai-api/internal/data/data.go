package data

import "embed"

//go:embed *.yaml classes monsters spells
var FS embed.FS
