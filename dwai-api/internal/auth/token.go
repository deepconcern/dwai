package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
)

// tokenLength is the session token's size in bytes (256 bits).
const tokenLength = 32

// NewToken returns a random session token for the cookie, and the hash of it
// to store in the database.
func NewToken() (token string, hash []byte) {
	b := make([]byte, tokenLength)
	_, _ = rand.Read(b) // crypto/rand.Read never returns an error

	token = base64.RawURLEncoding.EncodeToString(b)

	return token, HashToken(token)
}

// HashToken hashes a session token for storage and lookup. The token is
// already high-entropy random data, so a fast hash is enough.
func HashToken(token string) []byte {
	sum := sha256.Sum256([]byte(token))

	return sum[:]
}
