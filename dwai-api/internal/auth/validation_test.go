package auth_test

import (
	"slices"
	"strings"
	"testing"

	"github.com/deepconcern/dwai/dwai-api/internal/auth"
)

func TestValidateRegisterInput(t *testing.T) {
	t.Parallel()

	valid := auth.RegisterInput{DisplayName: "Grog", Email: "grog@example.com", Password: "12345678"}

	tests := []struct {
		name   string
		modify func(*auth.RegisterInput)
		fields []string
	}{
		{"valid", func(*auth.RegisterInput) {}, nil},
		{"surrounding space is trimmed", func(in *auth.RegisterInput) {
			in.DisplayName = "  Grog  "
			in.Email = " grog@example.com "
		}, nil},
		{"display name of 50 characters", func(in *auth.RegisterInput) { in.DisplayName = strings.Repeat("é", 50) }, nil},
		{"password of 128 characters", func(in *auth.RegisterInput) { in.Password = strings.Repeat("é", 128) }, nil},
		{"no composition rules", func(in *auth.RegisterInput) { in.Password = "aaaaaaaa" }, nil},
		{"blank display name", func(in *auth.RegisterInput) { in.DisplayName = "   " }, []string{"displayName"}},
		{"display name of 51 characters", func(in *auth.RegisterInput) { in.DisplayName = strings.Repeat("a", 51) }, []string{"displayName"}},
		{"missing @", func(in *auth.RegisterInput) { in.Email = "grog.example.com" }, []string{"email"}},
		{"display-name form", func(in *auth.RegisterInput) { in.Email = "Grog <grog@example.com>" }, []string{"email"}},
		{"no dot in the domain", func(in *auth.RegisterInput) { in.Email = "grog@localhost" }, []string{"email"}},
		{"password of 7 characters", func(in *auth.RegisterInput) { in.Password = "1234567" }, []string{"password"}},
		{"password of 129 characters", func(in *auth.RegisterInput) { in.Password = strings.Repeat("a", 129) }, []string{"password"}},
		{"everything wrong", func(in *auth.RegisterInput) { *in = auth.RegisterInput{} }, []string{"displayName", "email", "password"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			input := valid
			tt.modify(&input)

			var fields []string
			for _, e := range auth.ValidateRegisterInput(input) {
				fields = append(fields, e.Field)
			}
			if !slices.Equal(fields, tt.fields) {
				t.Errorf("error fields = %v, want %v", fields, tt.fields)
			}
		})
	}
}
