module Main exposing (..)

-- Press buttons to increment and decrement a counter.
--
-- Read how it works:
--   https://guide.elm-lang.org/architecture/buttons.html
--

import Array exposing (initialize)
import Browser exposing (Document, UrlRequest)
import Browser.Navigation exposing (Key)
import Html exposing (Html, button, div, input, option, text)
import Html.Attributes exposing (href, value)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as D
import Json.Encode as E
import Url exposing (Url)



-- MAIN


main : Program () Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlRequest = onUrlRequest
        , onUrlChange = onUrlChange
        }


type Msg
    = OnUrlRequest
    | OnUrlChange
    | UpdateRawText String
    | RequestShortURL
    | ReceiveShortURL (Result Http.Error ReceiveShortURLType)


type alias Model =
    { rawText : String
    , shortURL : Maybe String
    , url : Url
    }


initializeModel : Url -> Model
initializeModel url =
    { rawText = ""
    , shortURL = Nothing
    , url = url
    }


init : () -> Url -> Key -> ( Model, Cmd msg )
init _ url _ =
    ( initializeModel url, Cmd.none )


view : Model -> Document Msg
view model =
    { title = ""
    , body =
        [ div []
            [ input [ value model.rawText, onInput UpdateRawText ] []
            , button [ onClick RequestShortURL ] [ text "変換" ]
            ]
        , case model.shortURL of
            Just hash ->
                let
                    nowURL =
                        model.url

                    shortURL =
                        Url.toString { nowURL | path = "/l/" ++ hash, query = Nothing, fragment = Nothing }
                in
                Html.a [ href shortURL ] [ text shortURL ]

            Nothing ->
                div [] []
        ]
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateRawText text ->
            ( { model | rawText = text }, Cmd.none )

        RequestShortURL ->
            ( model, requestShortURL model.rawText )

        ReceiveShortURL result ->
            let
                newShortURL : Maybe String
                newShortURL =
                    case result of
                        Ok value ->
                            value.hash

                        Err error ->
                            Nothing
            in
            ( { model | shortURL = newShortURL }, Cmd.none )

        _ ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


onUrlRequest : UrlRequest -> Msg
onUrlRequest _ =
    OnUrlRequest


onUrlChange : Url -> Msg
onUrlChange _ =
    OnUrlChange


type alias ReceiveShortURLType =
    { status : String
    , message : String
    , hash : Maybe String
    }


requestShortURL : String -> Cmd Msg
requestShortURL rawText =
    let
        toJson : String -> E.Value
        toJson url =
            E.object
                [ ( "url", E.string url )
                ]

        fromJson : D.Decoder ReceiveShortURLType
        fromJson =
            D.map3 ReceiveShortURLType
                (D.field "status" D.string)
                (D.field "message" D.string)
                (D.field "hash" (D.nullable D.string))
    in
    Http.post
        { url = "./api/create"
        , body = Http.jsonBody <| toJson rawText
        , expect = Http.expectJson ReceiveShortURL fromJson
        }
