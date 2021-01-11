package settings

type ShortURLType struct {
	Count          int64
	ShortURLLength ShortURLLengthType
}

type ShortURLLengthType struct {
	Max int
	Min MinShortURLLengthType
}

type MinShortURLLengthType struct {
	Default int
	Long    int
	Short   int
}

var (
	minShortURLLength = MinShortURLLengthType{Default: 8, Long: 40, Short: 5}
	shortURLLength    = ShortURLLengthType{Max: 64, Min: minShortURLLength}
	ShortURL          = ShortURLType{Count: int64(3), ShortURLLength: shortURLLength}
)
