package settings

type Type struct {
	Count          int64
	ShortURLLength ShortURLLengthSettingsType
}

type ShortURLLengthSettingsType struct {
	Max int
	Min MinShortURLLengthSettingsType
}

type MinShortURLLengthSettingsType struct {
	Default int
	Long    int
	Short   int
}

var (
	minShortURLLengthSettings = MinShortURLLengthSettingsType{Default: 8, Long: 40, Short: 5}
	shortURLLengthSettings    = ShortURLLengthSettingsType{Max: 64, Min: minShortURLLengthSettings}
	Settings                  = Type{Count: int64(3), ShortURLLength: shortURLLengthSettings}
)
