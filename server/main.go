package main

import (
	"context"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/datastore"
	"github.com/dev-hato/hato-atama/server/settings"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

var (
	dsClient *datastore.Client
)

type ShortURLDataType struct {
	Count   int64
	URLData string
}

type CreateShortURLPostDataType struct {
	URL             string  `json:"url"`
	WantedShortURL  *string `json:"wanted_short_url"`
	Count           *int64  `json:"count"`
	URLLengthOption *string `json:"length_option"`
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

func (csurlpdtype *CreateShortURLPostDataType) Normalize() {
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
}

func createServer() (e *echo.Echo) {
	e = echo.New()

	e.Use(middleware.Recover())
	e.Use(middleware.Logger())
	e.Use(middleware.Gzip())

	api := e.Group("/api")
	api.POST("/create", createShortURL)

	e.GET("/l/:param", getLink)

	return
}

func getKey(url string, tx *datastore.Transaction) (key *datastore.Key, hashKey string, err error) {
	parentKey := datastore.NameKey("URL", "Named", nil)
	keyCandidate := datastore.NameKey("Random", url, parentKey)
	v := &ShortURLDataType{}

	if err = tx.Get(keyCandidate, v); err != nil {
		if err == datastore.ErrNoSuchEntity {
			// 存在していないキーが見つかったらそれを返す
			return keyCandidate, url, nil
		}

		return
	}

	return
}

func createShortURL(c echo.Context) (err error) {
	// 入力データの取り出し
	inputData := new(CreateShortURLPostDataType)
	if err = c.Bind(&inputData); err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusNotAcceptable, RetJSONType{Message: "invalid parameter"})
	}
	// 入力データの正規化
	inputData.Normalize()

	var key *datastore.Key
	hashKey := ""

	tx, err := dsClient.NewTransaction(c.Request().Context())
	if err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJSONType{Message: "database error"})
	}

	if inputData.WantedShortURL == nil {
		// 保存するキーの素となるhashの生成
		hashedURL := createHash(inputData.URL, time.Now())

		// 短い順に、すでにキーが存在しないか確認して行き、存在していないキーを探す
		for i := inputData.ShortURLLength; hashKey == "" && i < 64; i++ {
			key, hashKey, err = getKey(hashedURL[:i], tx)
			if err != nil {
				c.Logger().Error(err)
				return c.JSON(http.StatusInternalServerError, RetJSONType{Message: "database error"})
			}
		}

		// 全てのキーが存在してしまったので、登録できなかった
		if hashKey == "" {
			c.Logger().Error("No usable key: " + hashedURL)
			return c.JSON(http.StatusInternalServerError, RetJSONType{Message: "database error"})
		}
	} else {
		key, hashKey, err = getKey(*inputData.WantedShortURL, tx)
		if err != nil {
			c.Logger().Error(err)
			return c.JSON(http.StatusInternalServerError, RetJSONType{Message: "database error"})
		} else if hashKey == "" { // 希望するURLが存在してしまったので、登録できなかった
			c.Logger().Error("No usable key: " + *inputData.WantedShortURL)
			return c.JSON(http.StatusInternalServerError, RetJSONType{Message: "database error"})
		}
	}

	// 保存処理
	if _, err = tx.Put(key, &ShortURLDataType{
		URLData: inputData.URL,
		Count:   *inputData.Count,
	}); err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJSONType{Message: "database error"})
	}

	// トランザクションを確定させる
	if _, err = tx.Commit(); err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJSONType{Message: "database error"})
	}

	return c.JSON(http.StatusCreated, RetJSONType{Status: true, Message: "ok", HashKey: &hashKey})
}

// hashを作る
func createHash(url string, now time.Time) string {
	hash := sha512.Sum512(now.AppendFormat([]byte(url), time.RFC3339Nano))
	return hex.EncodeToString(hash[:])
}

func getLink(c echo.Context) (err error) {
	tx, err := dsClient.NewTransaction(c.Request().Context())
	if err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJSONType{Message: "database error"})
	}

	// 取り出す入れ物の作成
	data := &ShortURLDataType{}
	key := datastore.NameKey("Random", c.Param("param"), datastore.NameKey("URL", "Named", nil))

	// 取り出す処理
	if err = tx.Get(key, data); err != nil {

		// データが存在しなかった
		if err == datastore.ErrNoSuchEntity {
			return c.JSON(http.StatusNotFound, RetJSONType{Status: false, Message: "not found"})
		}

		// その他のエラー
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: "database error"})
	}

	// データは存在するけど忘れてしまった
	if data.Count == 0 {
		return c.JSON(http.StatusNotFound, RetJSONType{Status: false, Message: "not found"})
	}

	// 使える回数を一回消費
	data.Count--

	// 一回引いた値を保存する
	if _, err = tx.Put(key, data); err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: "database error"})
	}

	// トランザクションを確定させる
	if _, err = tx.Commit(); err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJSONType{Status: false, Message: "database error"})
	}

	c.Response().Header().Set("Cache-Control", "no-store")
	// トランザクションがコミットされれば、URLにリダイレクトさせる
	return c.Redirect(302, data.URLData)
}

func initialize() (err error) {
	ctx := context.Background()

	dsClient, err = datastore.NewClient(ctx, "hato-atama")
	if err != nil {
		return
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
	e.Logger.Fatal(e.Start(":" + port))
}
