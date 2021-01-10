package settings

type SettingsType struct {
	Count          int64
	ShortURLLength ShortURLLengthSettingsType
}

type ShortURLLengthSettingsType struct {
	Max int
	Min MinShortURLLengthSettingsTyoe
}

type MinShortURLLengthSettingsTyoe struct {
	Default int
	Long    int
	Short   int
}

var (
	minShortURLLengthSettings = MinShortURLLengthSettingsTyoe{Default: 8, Long: 40, Short: 5}
	shortURLLengthSettings    = ShortURLLengthSettingsType{Max: 64, Min: minShortURLLengthSettings}
	Settings                  = SettingsType{Count: int64(3), ShortURLLength: shortURLLengthSettings}
)
