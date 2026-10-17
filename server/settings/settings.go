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
	// MaxCount 短縮URLを発行するときに指定できる、URLを取り出すことができる数の上限
	MaxCount = int64(1000)
	// BodyLimitBytes リクエストボディの大きさの上限 (バイト)
	BodyLimitBytes = int64(16 * 1024)
)
