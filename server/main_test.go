package main

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/dev-hato/hato-atama/server/settings"
)

// newInput テスト用の入力データを作る
func newInput(url string) CreateShortURLPostDataType {
	return CreateShortURLPostDataType{
		URL:             url,
		WantedShortURL:  nil,
		Count:           nil,
		URLLengthOption: nil,
		ShortURLLength:  0,
	}
}

func TestNormalizeAcceptsHTTPURL(t *testing.T) {
	t.Parallel()

	for _, url := range []string{"http://example.com/", "https://example.com/articles/1?q=1#top"} {
		t.Run(url, func(t *testing.T) {
			t.Parallel()

			input := newInput(url)
			if err := input.Normalize(); err != nil {
				t.Fatalf("Normalize() error = %v", err)
			}

			if input.Count == nil || *input.Count != settings.Count {
				t.Fatalf("Count = %v, want %d", input.Count, settings.Count)
			}
		})
	}
}

func TestNormalizeRejectsMaliciousInput(t *testing.T) {
	t.Parallel()

	withWanted := func(wanted *string) CreateShortURLPostDataType {
		input := newInput("https://example.com/")
		input.WantedShortURL = wanted

		return input
	}

	withOption := newInput("https://example.com/")
	withOption.URLLengthOption = new("huge")

	withCount := newInput("https://example.com/")
	withCount.Count = new(settings.MaxCount + 1)

	tests := []struct {
		name  string
		input CreateShortURLPostDataType
	}{
		{name: "empty url", input: newInput("")},
		{name: "javascript scheme", input: newInput("javascript:alert(document.cookie)")},
		{name: "javascript scheme with upper case", input: newInput("JavaScript:alert(1)")},
		{name: "data scheme", input: newInput("data:text/html,<script>alert(1)</script>")},
		{name: "file scheme", input: newInput("file:///etc/passwd")},
		{name: "relative url", input: newInput("//example.com/")},
		{name: "too long url", input: newInput("https://example.com/" + strings.Repeat("a", 2048))},
		{
			name:  "too long wanted short url",
			input: withWanted(new(strings.Repeat("a", settings.ShortURLLength.Max+1))),
		},
		{name: "not alphanumeric wanted short url", input: withWanted(new("../admin"))},
		{name: "unknown length option", input: withOption},
		{name: "too many count", input: withCount},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if err := tt.input.Normalize(); err == nil {
				t.Fatal("Normalize() error = nil, want error")
			}
		})
	}
}

func TestNormalizeAcceptsMaxCount(t *testing.T) {
	t.Parallel()

	input := newInput("https://example.com/")
	input.Count = &settings.MaxCount

	if err := input.Normalize(); err != nil {
		t.Fatalf("Normalize() error = %v", err)
	}

	if *input.Count != settings.MaxCount {
		t.Fatalf("Count = %d, want %d", *input.Count, settings.MaxCount)
	}
}

func TestNormalizeReturnsTooManyCountError(t *testing.T) {
	t.Parallel()

	input := newInput("https://example.com/")
	input.Count = new(settings.MaxCount + 1)

	if err := input.Normalize(); !errors.Is(err, errTooManyCount) {
		t.Fatalf("Normalize() error = %v, want %v", err, errTooManyCount)
	}
}

func TestCreateServerRejectsTooLargeBody(t *testing.T) {
	t.Parallel()

	req := httptest.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"/api/create",
		strings.NewReader(`{"url":"https://example.com/`+strings.Repeat("a", int(settings.BodyLimitBytes))+`"}`),
	)
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	createServer().ServeHTTP(rec, req)

	if rec.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusRequestEntityTooLarge)
	}
}

func TestNormalizeErrCode(t *testing.T) {
	t.Parallel()

	withWanted := func(wanted *string) CreateShortURLPostDataType {
		input := newInput("https://example.com/")
		input.WantedShortURL = wanted

		return input
	}

	withOption := newInput("https://example.com/")
	withOption.URLLengthOption = new("huge")

	withCount := newInput("https://example.com/")
	withCount.Count = new(settings.MaxCount + 1)

	tests := []struct {
		name  string
		input CreateShortURLPostDataType
		want  string
	}{
		{name: "empty url", input: newInput(""), want: errCodeURLRequired},
		{name: "javascript scheme", input: newInput("javascript:alert(document.cookie)"), want: errCodeURLInvalid},
		{
			name:  "too long url",
			input: newInput("https://example.com/" + strings.Repeat("a", 2048)),
			want:  errCodeURLTooLong,
		},
		{
			name:  "not alphanumeric wanted short url",
			input: withWanted(new("../admin")),
			want:  errCodeWantedShortURLInvalid,
		},
		{
			name:  "too long wanted short url",
			input: withWanted(new(strings.Repeat("a", settings.ShortURLLength.Max+1))),
			want:  errCodeWantedShortURLTooLong,
		},
		{name: "unknown length option", input: withOption, want: errCodeLengthOptionInvalid},
		{name: "too many count", input: withCount, want: errCodeCountTooMany},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if got := normalizeErrCode(tt.input.Normalize()); got != tt.want {
				t.Fatalf("normalizeErrCode() = %q, want %q", got, tt.want)
			}
		})
	}
}

// errInternalDetail 内部の情報を含むエラー
var errInternalDetail = errors.New("internal detail")

func TestNormalizeErrCodeHidesUnknownError(t *testing.T) {
	t.Parallel()

	if got := normalizeErrCode(errInternalDetail); got != errCodeInvalidParameter {
		t.Fatalf("normalizeErrCode() = %q, want %q", got, errCodeInvalidParameter)
	}
}
