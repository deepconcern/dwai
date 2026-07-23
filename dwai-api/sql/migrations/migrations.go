// Package migrations embeds the SQL migration files so the compiled server
// binary is self-contained — no sql/migrations directory needs to exist
// alongside it at deploy time. Used by internal/migrate at server startup.
package migrations

import "embed"

//go:embed *.sql
var FS embed.FS
