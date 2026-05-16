package main

import (
	"testing"

	"github.com/dev-hato/hato-atama/server/settings"
)

func TestCreateShortURLPostDataTypeNormalizeSetsDefaults(t *testing.T) {
	input := CreateShortURLPostDataType{
		URL: "https://example.com/articles/1",
	}

	if err := input.Normalize(); err != nil {
		t.Fatalf("Normalize() error = %v", err)
	}

	if input.Count == nil || *input.Count != settings.Count {
		t.Fatalf("Count = %v, want %d", input.Count, settings.Count)
	}
	if input.ShortURLLength != settings.ShortURLLength.Min.Default {
		t.Fatalf("ShortURLLength = %d, want %d", input.ShortURLLength, settings.ShortURLLength.Min.Default)
	}
}

func TestCreateShortURLPostDataTypeNormalizeDefaultsNonPositiveCount(t *testing.T) {
	count := int64(0)
	input := CreateShortURLPostDataType{
		URL:   "https://example.com/articles/1",
		Count: &count,
	}

	if err := input.Normalize(); err != nil {
		t.Fatalf("Normalize() error = %v", err)
	}

	if input.Count == nil || *input.Count != settings.Count {
		t.Fatalf("Count = %v, want %d", input.Count, settings.Count)
	}
}

func TestCreateShortURLPostDataTypeNormalizeUsesLengthOption(t *testing.T) {
	tests := []struct {
		name       string
		option     string
		wantLength int
	}{
		{name: "long", option: "long", wantLength: settings.ShortURLLength.Min.Long},
		{name: "short", option: "short", wantLength: settings.ShortURLLength.Min.Short},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := CreateShortURLPostDataType{
				URL:             "https://example.com/articles/1",
				URLLengthOption: &tt.option,
			}

			if err := input.Normalize(); err != nil {
				t.Fatalf("Normalize() error = %v", err)
			}

			if input.ShortURLLength != tt.wantLength {
				t.Fatalf("ShortURLLength = %d, want %d", input.ShortURLLength, tt.wantLength)
			}
		})
	}
}

func TestCreateShortURLPostDataTypeNormalizeRejectsInvalidInput(t *testing.T) {
	invalidWantedShortURL := "bad-value"
	invalidLengthOption := "medium"

	tests := []struct {
		name  string
		input CreateShortURLPostDataType
	}{
		{
			name:  "empty url",
			input: CreateShortURLPostDataType{},
		},
		{
			name: "invalid url",
			input: CreateShortURLPostDataType{
				URL: "example.com",
			},
		},
		{
			name: "invalid wanted short url",
			input: CreateShortURLPostDataType{
				URL:            "https://example.com/articles/1",
				WantedShortURL: &invalidWantedShortURL,
			},
		},
		{
			name: "invalid length option",
			input: CreateShortURLPostDataType{
				URL:             "https://example.com/articles/1",
				URLLengthOption: &invalidLengthOption,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := tt.input.Normalize(); err == nil {
				t.Fatal("Normalize() error = nil, want non-nil")
			}
		})
	}
}
