package main

type Settings struct {
	Count          int64
	ShortURLLength ShortURLLengthSettings
}

type ShortURLLengthSettings struct {
	Max int
	Min MinShortURLLengthSettings
}

type MinShortURLLengthSettings struct {
	Default int
	Long    int
	Short   int
}

var (
	minShortURLLengthSettings = MinShortURLLengthSettings{Default: 8, Long: 40, Short: 5}
	shortURLLengthSettings    = ShortURLLengthSettings{Max: 64, Min: minShortURLLengthSettings}
	settings                  = Settings{Count: int64(3), ShortURLLength: shortURLLengthSettings}
)
