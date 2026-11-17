package auth

import (
	"net/mail"
	"strings"
	"unicode/utf8"

	"github.com/deepconcern/dwai/dwai-api/internal/models"
)

// Account field limits. Passwords have a minimum length and no composition
// rules, following NIST SP 800-63B.
const (
	MaxDisplayNameLength = 50
	MaxPasswordLength    = 128
	MinPasswordLength    = 8
)

// RegisterInput is a new account's details, as entered.
type RegisterInput struct {
	DisplayName string
	Email       string
	Password    string
}

// NormalizeEmail trims an email. Case is kept as entered; uniqueness and
// lookups ignore it.
func NormalizeEmail(email string) string {
	return strings.TrimSpace(email)
}

// ValidateRegisterInput checks a registration, returning one error per bad
// field. Email and display name are checked after trimming; the password is
// used exactly as entered.
func ValidateRegisterInput(input RegisterInput) []models.ValidationError {
	var errs []models.ValidationError

	displayName := strings.TrimSpace(input.DisplayName)
	switch {
	case displayName == "":
		errs = append(errs, models.ValidationError{Field: "displayName", Message: "Display name is required"})
	case utf8.RuneCountInString(displayName) > MaxDisplayNameLength:
		errs = append(errs, models.ValidationError{Field: "displayName", Message: "Display name must be at most 50 characters"})
	}

	if !isEmail(NormalizeEmail(input.Email)) {
		errs = append(errs, models.ValidationError{Field: "email", Message: "Enter a valid email address"})
	}

	switch n := utf8.RuneCountInString(input.Password); {
	case n < MinPasswordLength:
		errs = append(errs, models.ValidationError{Field: "password", Message: "Password must be at least 8 characters"})
	case n > MaxPasswordLength:
		errs = append(errs, models.ValidationError{Field: "password", Message: "Password must be at most 128 characters"})
	}

	return errs
}

// isEmail reports whether s is a bare email address (no display name or
// angle brackets).
func isEmail(s string) bool {
	addr, err := mail.ParseAddress(s)

	if err != nil || addr.Address != s {
		return false
	}

	// mail.ParseAddress accepts a bare host ("a@localhost"); require a
	// domain with a dot, as any real address has.
	domain := s[strings.LastIndex(s, "@")+1:]

	return strings.Contains(domain, ".")
}
