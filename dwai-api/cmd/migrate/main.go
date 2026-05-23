package main

import (
	"context"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"slices"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

var allowedCommands = []string{"up", "down", "redo"}

func runMigration(conn *pgx.Conn, path string) {
	content, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	_, err = conn.Exec(context.Background(), string(content))
	if err != nil {
		panic(err)
	}
}

func main() {
	// Load the environment

	if err := godotenv.Load(); err != nil {
		fmt.Println("No .env file found, using environment variables")
		os.Exit(1)
	}

	// Connect to the database

	conn, err := pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Println("Error connecting to database")
		os.Exit(1)
	}
	defer conn.Close(context.Background())

	// Get migration type

	if len(os.Args) < 2 {
		fmt.Println("Usage: migrate [up|down]")
		os.Exit(1)
	}

	migrationType := os.Args[1]

	if !slices.Contains(allowedCommands, migrationType) {
		fmt.Printf("Invalid migration type. Use one of: %v\n", allowedCommands)
		os.Exit(1)
	}

	// Get SQL migration files

	migration_dir := path.Join("sql", "migrations")
	fmt.Printf("Looking for migration files in: %s\n", migration_dir)

	entries, err := os.ReadDir(migration_dir)
	if err != nil {
		panic(err)
	}

	downMigrations := make([]string, 0)
	upMigrations := make([]string, 0)

	for _, entry := range entries {
		if strings.HasSuffix(entry.Name(), ".down.sql") {
			downMigrations = append(downMigrations, entry.Name())
			continue
		}
		if strings.HasSuffix(entry.Name(), ".up.sql") {
			upMigrations = append(upMigrations, entry.Name())
			continue
		}
	}

	slices.Sort(downMigrations)
	slices.Reverse(downMigrations)
	slices.Sort(upMigrations)

	// Execute migrations based on type

	if migrationType == "down" || migrationType == "redo" {
		for _, migration := range downMigrations {
			fmt.Printf("Applying migration: %s\n", migration)

			runMigration(conn, filepath.Join(migration_dir, migration))
		}
	}

	if migrationType == "up" || migrationType == "redo" {
		for _, migration := range upMigrations {
			fmt.Printf("Applying migration: %s\n", migration)

			runMigration(conn, filepath.Join(migration_dir, migration))
		}
	}
}
