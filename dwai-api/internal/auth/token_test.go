package auth_test

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/auth"
)

func TestNewToken(t *testing.T) {
	t.Parallel()

	token, hash := auth.NewToken()

	raw, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil {
		t.Fatalf("token %q isn't base64url: %v", token, err)
	}
	if len(raw) != 32 {
		t.Errorf("token has %d bytes, want 32 (256 bits)", len(raw))
	}

	sum := sha256.Sum256([]byte(token))
	if !bytes.Equal(hash, sum[:]) || !bytes.Equal(auth.HashToken(token), hash) {
		t.Error("the returned hash isn't the token's SHA-256")
	}

	if other, _ := auth.NewToken(); other == token {
		t.Error("two tokens are equal")
	}
}
