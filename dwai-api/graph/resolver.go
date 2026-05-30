package graph

//go:generate go tool gqlgen generate

import (
	"github.com/deepconcern/dwai/dwai-api/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

type Resolver struct {
	CharacterClasses *models.CharacterClassMap
	DbPool           *pgxpool.Pool
	Equipment        *models.EquipmentMap
	Loaders          *models.Loaders
	LookTypes        *models.LookTypeMap
	PlayerMoves      *models.MoveMap
	TagDefinitions   *models.TagDefinitionMap
}
