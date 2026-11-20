package graph

//go:generate go tool gqlgen generate

import (
	"github.com/deepconcern/dwai/dwai-api/internal/auth"
	"github.com/deepconcern/dwai/dwai-api/internal/models"
	"github.com/deepconcern/dwai/dwai-api/internal/realtime"
	"github.com/jackc/pgx/v5/pgxpool"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

type Resolver struct {
	// Broker delivers new chat messages to subscriptions.
	Broker           *realtime.Broker
	CharacterClasses *models.CharacterClassMap
	DbPool           *pgxpool.Pool
	ItemTemplates    *models.ItemTemplateMap
	LookTypes        *models.LookTypeMap
	Monsters         *models.MonsterCompendium
	PlayerMoves      *models.MoveMap
	Sessions         *auth.Sessions
	Spells           *models.SpellMap
	TagDefinitions   *models.TagDefinitionMap
}
