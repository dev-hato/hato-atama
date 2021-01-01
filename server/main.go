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
		defaultValue := int64(3)
		csurlpdtype.Count = &defaultValue
	}

	// hashの長さの最短値をセットする
	csurlpdtype.ShortURLLength = 8
	if csurlpdtype.URLLengthOption != nil {
		if *csurlpdtype.URLLengthOption == "long" {
			csurlpdtype.ShortURLLength = 40
		} else if *csurlpdtype.URLLengthOption == "short" {
			csurlpdtype.ShortURLLength = 5
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

func createShortURL(c echo.Context) (err error) {
	// 入力データの取り出し
	inputData := new(CreateShortURLPostDataType)
	if err = c.Bind(&inputData); err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusNotAcceptable, RetJsonType{Message: "invalid parameter"})
	}
	// 入力データの正規化
	inputData.Normalize()

	// 保存するキーの素となるhashの生成
	hashedURL := createHash(inputData.URL, time.Now())
	hashKey := ""

	parentKey := datastore.NameKey("URL", "Named", nil)
	tx, err := dsClient.NewTransaction(c.Request().Context())
	if err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJsonType{Message: "database error"})
	}

	// 短い順に、すでにキーが存在しないか確認して行き、存在していないキーを探す
	for i := inputData.ShortURLLength; i < 64; i++ {
		hashKeyCandidate := string(hashedURL[:i])
		key := datastore.NameKey("Random", hashKeyCandidate, parentKey)
		v := new(interface{})
		if err = tx.Get(key, v); err != nil {
			if err == datastore.ErrNoSuchEntity {
				// 存在していないキーが見つかったら抜ける
				hashKey = hashKeyCandidate
				break
			}
			c.Logger().Error(err)
			return c.JSON(http.StatusInternalServerError, RetJsonType{Message: "database error"})
		}
	}

	// 全てのキーが存在してしまったので、登録できなかった
	if hashKey == "" {
		c.Logger().Error("No usable key: " + hashedURL)
		return c.JSON(http.StatusInternalServerError, RetJsonType{Message: "database error"})
	}

	key := datastore.NameKey("Random", hashKey, parentKey)
	// 保存処理
	if _, err = tx.Put(key, &ShortURLDataType{
		URLData: inputData.URL,
		Count:   *inputData.Count,
	}); err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJsonType{Message: "database error"})
	}

	// トランザクションを確定させる
	if _, err = tx.Commit(); err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJsonType{Message: "database error"})
	}

	return c.JSON(http.StatusCreated, RetJsonType{Status: true, Message: "ok", HashKey: &hashKey})
}

// hashを作る
func createHash(url string, now time.Time) string {
	sha512 := sha512.Sum512(now.AppendFormat([]byte(url), time.RFC3339Nano))
	return hex.EncodeToString(sha512[:])
}

func getLink(c echo.Context) (err error) {
	tx, err := dsClient.NewTransaction(c.Request().Context())
	if err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJsonType{Message: "database error"})
	}

	// 取り出す入れ物の作成
	data := &ShortURLDataType{}
	key := datastore.NameKey("Random", c.Param("param"), datastore.NameKey("URL", "Named", nil))

	// 取り出す処理
	if err = tx.Get(key, data); err != nil {

		// データが存在しなかった
		if err == datastore.ErrNoSuchEntity {
			return c.JSON(http.StatusNotFound, RetJsonType{Status: false, Message: "not found"})
		}

		// その他のエラー
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJsonType{Status: false, Message: "database error"})
	}

	// データは存在するけど忘れてしまった
	if data.Count == 0 {
		return c.JSON(http.StatusNotFound, RetJsonType{Status: false, Message: "not found"})
	}

	// 使える回数を一回消費
	data.Count--

	// 一回引いた値を保存する
	if _, err = tx.Put(key, data); err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJsonType{Status: false, Message: "database error"})
	}

	// トランザクションを確定させる
	if _, err = tx.Commit(); err != nil {
		c.Logger().Error(err)
		return c.JSON(http.StatusInternalServerError, RetJsonType{Status: false, Message: "database error"})
	}

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
