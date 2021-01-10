package settings

type SettingType struct {
	Count          int64
	ShortURLLength ShortURLLengthSettingType
}

type ShortURLLengthSettingType struct {
	Max int
	Min MinShortURLLengthSettingType
}

type MinShortURLLengthSettingType struct {
	Default int
	Long    int
	Short   int
}

var (
	minShortURLLengthSettings = MinShortURLLengthSettingType{Default: 8, Long: 40, Short: 5}
	shortURLLengthSettings    = ShortURLLengthSettingType{Max: 64, Min: minShortURLLengthSettings}
	Settings                  = SettingType{Count: int64(3), ShortURLLength: shortURLLengthSettings}
)
