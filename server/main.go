package main

import (
	"context"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"cloud.google.com/go/datastore"
	"github.com/dev-hato/hato-atama/server/settings"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

var (
	dsClient *datastore.Client
	envName  string
)

const databaseErrMessage = "database error"

// errTooManyCount 指定されたURLを取り出すことができる数が上限を超えている
var errTooManyCount = errors.New("count exceeds the limit")

type ShortURLDataType struct {
	Count   int64
	URLData string
}

type CreateShortURLPostDataType struct {
	// javascript:などへリダイレクトさせないよう、許可したスキームのURLのみ受け付ける
	URL             string  `json:"url"              validate:"required,allowed_url,max=2048"`
	WantedShortURL  *string `json:"wanted_short_url" validate:"omitempty,alphanum,max=64"`
	Count           *int64  `json:"count"`
	URLLengthOption *string `json:"length_option"    validate:"omitempty,oneof=long short"`
	ShortURLLength  int     `json:"-"`
}

type RetJSONType struct {
	Status  StatusType `json:"status"`
	Message string     `json:"message"`
	HashKey *string    `json:"hash,omitempty"`
}

type StatusType bool

func (s StatusType) MarshalJSON() ([]byte, error) {
	var ret string
	if s {
		ret = "ok"
	} else {
		ret = "error"
	}
	return json.Marshal(ret)
}

// isAllowedURL 短縮対象として許可するスキームのURLかどうかを判定する
// javascript:やdata:などスクリプトを実行できるスキームを通さないよう、許可するスキームを列挙して判定する
func isAllowedURL(fl validator.FieldLevel) bool {
	u, err := url.Parse(fl.Field().String())
	if err != nil {
		return false
	}

	// url.Parseはスキームを小文字にして返す
	switch u.Scheme {
	case "http", "https":
		return u.Host != ""
	case "mailto":
		return u.Opaque != ""
	default:
		return false
	}
}

// validate 入力データの検証に使うvalidator
// 並行して使っても安全なため、起動時に一度だけ作る
var validate = newValidate()

// newValidate 独自の検証を登録したvalidatorを作る
func newValidate() *validator.Validate {
	v := validator.New()

	// 登録に失敗するのはタグ名や関数の指定を誤った場合のみのため、起動時に検出できるようpanicする
	if err := v.RegisterValidation("allowed_url", isAllowedURL); err != nil {
		panic(err)
	}

	return v
}

func (csurlpdtype *CreateShortURLPostDataType) Normalize() (err error) {
	if err = validate.Struct(csurlpdtype); err != nil {
		return
	}

	if csurlpdtype.Count != nil && *csurlpdtype.Count > settings.MaxCount {
		return fmt.Errorf("%w: %d > %d", errTooManyCount, *csurlpdtype.Count, settings.MaxCount)
	}

	if csurlpdtype.Count == nil || *csurlpdtype.Count <= 0 {
		// URLを取り出すことができる数
		defaultValue := settings.Count
		csurlpdtype.Count = &defaultValue
	}

	// hashの長さの最短値をセットする
	csurlpdtype.ShortURLLength = settings.ShortURLLength.Min.Default
	if csurlpdtype.URLLengthOption != nil {
		switch *csurlpdtype.URLLengthOption {
		case "long":
			csurlpdtype.ShortURLLength = settings.ShortURLLength.Min.Long
		case "short":
			csurlpdtype.ShortURLLength = settings.ShortURLLength.Min.Short
		}
	}

	return
}

// 入力データの検証エラーのとき、messageに入れて返すエラーコード
// 内部の情報を返さないよう、項目と検証内容ごとに決まったコードのみを返す
// 利用者向けの文言はフロントエンドでコードごとに用意する
const (
	errCodeInvalidParameter      = "invalid parameter"
	errCodeURLRequired           = "url_required"
	errCodeURLInvalid            = "url_invalid"
	errCodeURLTooLong            = "url_too_long"
	errCodeWantedShortURLInvalid = "wanted_short_url_invalid"
	errCodeWantedShortURLTooLong = "wanted_short_url_too_long"
	errCodeLengthOptionInvalid   = "length_option_invalid"
	errCodeCountTooMany          = "count_too_many"
	errCodeRequestTooLarge       = "request_too_large"
)

// normalizeErrCode 入力データの検証エラーを、利用者に返すエラーコードにする
func normalizeErrCode(err error) string {
	if errors.Is(err, errTooManyCount) {
		return errCodeCountTooMany
	}

	var validationErrors validator.ValidationErrors

	if errors.As(err, &validationErrors) && 0 < len(validationErrors) {
		fieldError := validationErrors[0]
		field := fieldError.StructField()
		tag := fieldError.Tag()

		switch field {
		case "URL":
			switch tag {
			case "required":
				return errCodeURLRequired
			case "max":
				return errCodeURLTooLong
			default:
				return errCodeURLInvalid
			}
		case "WantedShortURL":
			if tag == "max" {
				return errCodeWantedShortURLTooLong
			}

			return errCodeWantedShortURLInvalid
		case "URLLengthOption":
			return errCodeLengthOptionInvalid
		}
	}

	return errCodeInvalidParameter
}

// requestTooLargeToJSON リクエストボディの大きさが上限を超えたとき、他のエラーと同じ形式でエラーコードを返す
// フロントエンドが画面にエラーを表示できるよう、Echoが返す形式ではなくRetJSONTypeの形式に揃える
func requestTooLargeToJSON(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		err := next(c)

		if errors.Is(err, echo.ErrStatusRequestEntityTooLarge) {
			return c.JSON(
				http.StatusRequestEntityTooLarge,
				RetJSONType{Status: false, Message: errCodeRequestTooLarge, HashKey: nil},
			)
		}

		return err
	}
}

func createServer() (e *echo.Echo) {
	e = echo.New()

	e.Use(middleware.Recover())
	e.Use(middleware.RequestLogger())
	e.Use(middleware.Gzip())

	// 巨大なリクエストボディでメモリを消費させられないよう、大きさに上限を設ける
	e.Use(requestTooLargeToJSON)
	e.Use(middleware.BodyLimit(settings.BodyLimitBytes))

	api := e.Group("/api")
	api.POST("/create", createShortURL)

	e.GET("/l/:param", getLink)
	e.GET("/ping", ping)

	return
}

func getKey(url string, tx *datastore.Transaction) (key *datastore.Key, hashKey string, err error) {
	keyCandidate := getDataStoreKey(url)
	v := &ShortURLDataType{Count: 0, URLData: ""}

	if err = tx.Get(keyCandidate, v); err != nil {
		if errors.Is(err, datastore.ErrNoSuchEntity) {
			// 存在していないキーが見つかったらそれを返す
			return keyCandidate, url, nil
		}

		return
	}

	return
}

func getDataStoreKey(hash string) *datastore.Key {
	envKey := datastore.NameKey("Env", envName, nil)
	typeKey := datastore.NameKey("Type", "Link", envKey)
	hashKeyKey := datastore.NameKey("HashKey", hash, typeKey)
	return hashKeyKey
}

// bindErrResponse 入力データを取り出せなかったときのレスポンスを返す
func bindErrResponse(c *echo.Context, err error) error {
	// Content-Lengthを付けずに送られた場合は、読み込み中に大きさの上限を超える
	// そのエラーはrequestTooLargeToJSONで他のエラーと同じ形式に変換する
	if errors.Is(err, echo.ErrStatusRequestEntityTooLarge) {
		return err
	}

	return c.JSON(http.StatusNotAcceptable, RetJSONType{Status: false, Message: errCodeInvalidParameter, HashKey: nil})
}

func createShortURL(c *echo.Context) (err error) {
	// 入力データの取り出し
	inputData := new(CreateShortURLPostDataType)
	if err = c.Bind(&inputData); err != nil {
		c.Logger().Error(err.Error())
		return bindErrResponse(c, err)
	}
	// 入力データの正規化
	if err = inputData.Normalize(); err != nil {
		c.Logger().Error(err.Error())
		return c.JSON(http.StatusNotAcceptable, RetJSONType{Status: false, Message: normalizeErrCode(err), HashKey: nil})
	}

	var key *datastore.Key
	hashKey := ""

	tx, err := dsClient.NewTransaction(c.Request().Context())
	if err != nil {
		c.Logger().Error(err.Error())
		return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: databaseErrMessage, HashKey: nil})
	}

	if inputData.WantedShortURL == nil {
		// 保存するキーの素となるhashの生成
		hashedURL := createHash(inputData.URL, time.Now())

		// 短い順に、すでにキーが存在しないか確認して行き、存在していないキーを探す
		for i := inputData.ShortURLLength; hashKey == "" && i < 64; i++ {
			key, hashKey, err = getKey(hashedURL[:i], tx)
			if err != nil {
				c.Logger().Error(err.Error())
				return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: databaseErrMessage, HashKey: nil})
			}
		}

		// 全てのキーが存在してしまったので、登録できなかった
		if hashKey == "" {
			message := "No usable key: " + hashedURL
			c.Logger().Error(message)
			return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: message, HashKey: nil})
		}
	} else {
		key, hashKey, err = getKey(*inputData.WantedShortURL, tx)
		if err != nil {
			c.Logger().Error(err.Error())
			return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: databaseErrMessage, HashKey: nil})
		} else if hashKey == "" { // 希望するURLが存在してしまったので、登録できなかった
			message := "No usable key: " + *inputData.WantedShortURL
			c.Logger().Error(message)
			return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: message, HashKey: nil})
		}
	}

	// 保存処理
	if _, err = tx.Put(key, &ShortURLDataType{
		URLData: inputData.URL,
		Count:   *inputData.Count,
	}); err != nil {
		c.Logger().Error(err.Error())
		return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: databaseErrMessage, HashKey: nil})
	}

	// トランザクションを確定させる
	if _, err = tx.Commit(); err != nil {
		c.Logger().Error(err.Error())
		return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: databaseErrMessage, HashKey: nil})
	}

	return c.JSON(http.StatusCreated, RetJSONType{Status: true, Message: "ok", HashKey: &hashKey})
}

// hashを作る
func createHash(url string, now time.Time) string {
	hash := sha512.Sum512(now.AppendFormat([]byte(url), time.RFC3339Nano))
	return hex.EncodeToString(hash[:])
}

func getLink(c *echo.Context) (err error) {
	tx, err := dsClient.NewTransaction(c.Request().Context())
	if err != nil {
		c.Logger().Error(err.Error())
		return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: databaseErrMessage, HashKey: nil})
	}

	// 取り出す入れ物の作成
	data := &ShortURLDataType{Count: 0, URLData: ""}
	key := getDataStoreKey(c.Param("param"))

	// 取り出す処理
	if err = tx.Get(key, data); err != nil {
		// データが存在しなかった
		if errors.Is(err, datastore.ErrNoSuchEntity) {
			return c.JSON(http.StatusNotFound, RetJSONType{Status: false, Message: "not found", HashKey: nil})
		}

		// その他のエラー
		c.Logger().Error(err.Error())
		return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: databaseErrMessage, HashKey: nil})
	}

	// データは存在するけど忘れてしまった
	if data.Count == 0 {
		return c.JSON(http.StatusNotFound, RetJSONType{Status: false, Message: "not found", HashKey: nil})
	}

	// 使える回数を一回消費
	data.Count--

	// 一回引いた値を保存する
	if _, err = tx.Put(key, data); err != nil {
		c.Logger().Error(err.Error())
		return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: databaseErrMessage, HashKey: nil})
	}

	// トランザクションを確定させる
	if _, err = tx.Commit(); err != nil {
		c.Logger().Error(err.Error())
		return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: databaseErrMessage, HashKey: nil})
	}

	c.Response().Header().Set("Cache-Control", "no-store")
	// トランザクションがコミットされれば、URLにリダイレクトさせる
	return c.Redirect(http.StatusFound, data.URLData)
}

func ping(c *echo.Context) (err error) {
	return c.NoContent(http.StatusNoContent)
}

func initialize() (err error) {
	ctx := context.Background()

	dsClient, err = datastore.NewClient(ctx, "hato-atama")
	if err != nil {
		return
	}

	envName = os.Getenv("ENV_NAME")
	if envName == "" {
		envName = "local"
	}
	return
}

func main() {
	if err := initialize(); err != nil {
		fmt.Print(err.Error())
		os.Exit(1)
	}
	e := createServer()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := e.Start(":" + port); err != nil {
		log.Fatal(err)
	}
}
