//go:build integration

package graph_test

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/testutil"
)

// env is shared by every integration test in this package: one Postgres
// container, with a fresh database per test (see testutil.Env.NewClient).
var env *testutil.Env

func TestMain(m *testing.M) {
	os.Exit(run(m))
}

// run is split out of TestMain so the deferred Close runs before os.Exit.
func run(m *testing.M) int {
	var err error

	env, err = testutil.NewEnv(context.Background())
	if err != nil {
		fmt.Fprintf(os.Stderr, "start integration test environment: %v\n", err)
		return 1
	}
	defer func() {
		if err := env.Close(); err != nil {
			fmt.Fprintf(os.Stderr, "stop integration test environment: %v\n", err)
		}
	}()

	return m.Run()
}
