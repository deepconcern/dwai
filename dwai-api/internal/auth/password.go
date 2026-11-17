// Package auth holds accounts and sessions: password hashing, session
// tokens, the HTTP middleware that finds the request's user, and the helpers
// resolvers use to require one.
package auth

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"sync"

	"golang.org/x/crypto/argon2"
)

// argon2id parameters: the OWASP Password Storage Cheat Sheet's first
// recommended configuration (19 MiB of memory, 2 iterations, 1 thread).
// They're stored in each hash, so they can be raised later without
// invalidating existing passwords.
const (
	argonKeyLength  = 32
	argonMemory     = 19 * 1024
	argonSaltLength = 16
	argonThreads    = 1
	argonTime       = 2
)

var errInvalidHash = errors.New("invalid password hash")

// HashPassword hashes a password with argon2id and a random salt, encoded as
// a PHC string: $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>.
func HashPassword(password string) (string, error) {
	salt := make([]byte, argonSaltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("generate salt: %w", err)
	}

	key := argon2.IDKey([]byte(password), salt, argonTime, argonMemory, argonThreads, argonKeyLength)

	return fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version, argonMemory, argonTime, argonThreads,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(key),
	), nil
}

// VerifyPassword reports whether password matches a hash made by
// HashPassword, using the parameters stored in the hash. It returns an error
// only if the hash is malformed.
func VerifyPassword(password, encoded string) (bool, error) {
	parts := strings.Split(encoded, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return false, errInvalidHash
	}

	var version int
	if _, err := fmt.Sscanf(parts[2], "v=%d", &version); err != nil || version != argon2.Version {
		return false, errInvalidHash
	}

	var memory, time uint32
	var threads uint8
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &time, &threads); err != nil {
		return false, errInvalidHash
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false, errInvalidHash
	}

	want, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil || len(want) == 0 {
		return false, errInvalidHash
	}

	got := argon2.IDKey([]byte(password), salt, time, memory, threads, uint32(len(want)))

	return subtle.ConstantTimeCompare(got, want) == 1, nil
}

// dummyHash is verified against when a login names an unknown email, so the
// response takes as long as for a real account and doesn't reveal which
// emails are registered.
var dummyHash = sync.OnceValue(func() string {
	hash, err := HashPassword("not a real password")
	if err != nil {
		panic(err)
	}

	return hash
})

// VerifyNoPassword spends the same time as VerifyPassword, for logins that
// name an unknown email.
func VerifyNoPassword(password string) {
	_, _ = VerifyPassword(password, dummyHash())
}
