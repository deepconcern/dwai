package auth_test

import (
	"strings"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/auth"
)

func TestHashPassword(t *testing.T) {
	t.Parallel()

	hash, err := auth.HashPassword("correct horse battery staple")
	if err != nil {
		t.Fatalf("HashPassword: %v", err)
	}

	if !strings.HasPrefix(hash, "$argon2id$v=19$m=19456,t=2,p=1$") {
		t.Errorf("hash %q doesn't use argon2id with the OWASP parameters", hash)
	}

	again, err := auth.HashPassword("correct horse battery staple")
	if err != nil {
		t.Fatalf("HashPassword: %v", err)
	}
	if again == hash {
		t.Error("two hashes of the same password are equal; the salt isn't random")
	}
}

func TestVerifyPassword(t *testing.T) {
	t.Parallel()

	hash, err := auth.HashPassword("correct horse battery staple")
	if err != nil {
		t.Fatalf("HashPassword: %v", err)
	}

	for password, want := range map[string]bool{
		"correct horse battery staple":  true,
		"correct horse battery staple ": false,
		"Correct horse battery staple":  false,
		"":                              false,
	} {
		got, err := auth.VerifyPassword(password, hash)
		if err != nil {
			t.Fatalf("VerifyPassword(%q): %v", password, err)
		}
		if got != want {
			t.Errorf("VerifyPassword(%q) = %v, want %v", password, got, want)
		}
	}
}

// Hashes carry their parameters, so ones made with other settings still
// verify after the defaults change.
func TestVerifyPasswordUsesStoredParameters(t *testing.T) {
	t.Parallel()

	// argon2id, m=8192, t=1, p=1 of "password" with salt "somesaltsomesalt".
	const hash = "$argon2id$v=19$m=8192,t=1,p=1$c29tZXNhbHRzb21lc2FsdA$hPsAa7w81piVcitktb9zUlGp6Onz7Lk/9ZW5iut6zLc"

	ok, err := auth.VerifyPassword("password", hash)
	if err != nil {
		t.Fatalf("VerifyPassword: %v", err)
	}
	if !ok {
		t.Error("VerifyPassword rejected the right password for a hash with other parameters")
	}
}

func TestVerifyPasswordRejectsMalformedHashes(t *testing.T) {
	t.Parallel()

	for _, hash := range []string{
		"",
		"plaintext",
		"$2a$10$bcrypthashbcrypthashbcrypthashbcrypthashbcrypthash",
		"$argon2id$v=18$m=19456,t=2,p=1$c2FsdA$aGFzaA",
		"$argon2id$v=19$m=x,t=2,p=1$c2FsdA$aGFzaA",
		"$argon2id$v=19$m=19456,t=2,p=1$!!!$aGFzaA",
		"$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$",
	} {
		if _, err := auth.VerifyPassword("password", hash); err == nil {
			t.Errorf("VerifyPassword accepted malformed hash %q", hash)
		}
	}
}
