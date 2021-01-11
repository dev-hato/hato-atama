package settings

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
	Count             = int64(3)
	ShortURLLength    = ShortURLLengthType{Max: 64, Min: minShortURLLength}
)
