//go:build integration

package graph_test

import (
	"testing"
)

func TestSmoke(t *testing.T) {
	t.Parallel()

	c, _ := env.NewClient(t)

	var resp struct {
		CharacterClasses struct {
			All []struct{ Key string }
		}
		Characters struct {
			All []struct{ ID string }
		}
	}
	c.MustPost(`{
		characterClasses { all { key } }
		characters { all { id } }
	}`, &resp)

	if len(resp.CharacterClasses.All) == 0 {
		t.Error("characterClasses.all is empty; game data didn't load")
	}
	if len(resp.Characters.All) != 0 {
		t.Errorf("characters.all = %d characters on a fresh database, want 0", len(resp.Characters.All))
	}
}

// Each test's database is its own copy of the template, so writes in one
// test are invisible to the others.
func TestDatabasesAreIsolated(t *testing.T) {
	t.Parallel()

	first := env.NewDB(t)
	second := env.NewDB(t)

	if _, err := first.Exec(t.Context(), "CREATE TABLE isolation_check (id int)"); err != nil {
		t.Fatalf("create table in first database: %v", err)
	}

	var exists bool
	err := second.QueryRow(t.Context(), "SELECT to_regclass('isolation_check') IS NOT NULL").Scan(&exists)
	if err != nil {
		t.Fatalf("query second database: %v", err)
	}
	if exists {
		t.Error("table created in the first database is visible in the second")
	}
}
