package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadDotEnvMissingFile(t *testing.T) {
	if err := loadDotEnv(filepath.Join(t.TempDir(), ".env")); err != nil {
		t.Fatalf("loadDotEnv with a missing file: got %v, want nil", err)
	}
}

func TestLoadDotEnvLoadsFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), ".env")
	if err := os.WriteFile(path, []byte("DWAI_TEST_DOTENV=loaded\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	t.Setenv("DWAI_TEST_DOTENV", "")
	if err := os.Unsetenv("DWAI_TEST_DOTENV"); err != nil {
		t.Fatal(err)
	}

	if err := loadDotEnv(path); err != nil {
		t.Fatalf("loadDotEnv: %v", err)
	}
	if got := os.Getenv("DWAI_TEST_DOTENV"); got != "loaded" {
		t.Errorf("DWAI_TEST_DOTENV = %q, want %q", got, "loaded")
	}
}

func TestLoadDotEnvUnreadableFile(t *testing.T) {
	// A directory named .env exists but can't be read as a file, which is a
	// real error, unlike a missing file.
	path := filepath.Join(t.TempDir(), ".env")
	if err := os.Mkdir(path, 0o700); err != nil {
		t.Fatal(err)
	}

	if err := loadDotEnv(path); err == nil {
		t.Error("loadDotEnv with an unreadable .env: got nil, want an error")
	}
}
