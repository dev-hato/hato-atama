module Main exposing (..)

import Browser exposing (Document, UrlRequest)
import Browser.Navigation exposing (Key)
import Html exposing (Html, button, div, input, label, text)
import Html.Attributes exposing (href, style, target, value)
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
    | UpdateRawURL String
    | UpdateRawWantedShortURL String
    | RequestShortURL
    | ReceiveShortURL (Result Error ReceiveShortURLType)


type alias Model =
    { rawURL : String
    , rawWantedShortURL : String
    , shortURL : Maybe String
    , url : Url
    , errorMsg : Maybe String
    }


initializeModel : Url -> Model
initializeModel url =
    { rawURL = ""
    , rawWantedShortURL = ""
    , shortURL = Nothing
    , url = url
    , errorMsg = Nothing
    }


init : () -> Url -> Key -> ( Model, Cmd msg )
init _ url _ =
    ( initializeModel url, Cmd.none )


view : Model -> Document Msg
view model =
    let
        nowURL =
            model.url
    in
    { title = ""
    , body =
        [ let
            shortURLBase =
                Url.toString { nowURL | path = "/l/", query = Nothing, fragment = Nothing }
          in
          div []
            [ label [ style "display" "flex" ]
                [ text "短縮したいURL:"
                , input [ value model.rawURL, onInput UpdateRawURL, style "margin-left" "0.5em" ] []
                ]
            , label [ style "display" "flex" ]
                [ text "希望する短縮URL:"
                , div [ style "margin-left" "0.5em" ]
                    [ text shortURLBase
                    , input [ value model.rawWantedShortURL, onInput UpdateRawWantedShortURL ] []
                    ]
                ]
            , button [ onClick RequestShortURL ] [ text "変換" ]
            ]
        , case model.shortURL of
            Just hash ->
                let
                    shortURL =
                        Url.toString { nowURL | path = "/l/" ++ hash, query = Nothing, fragment = Nothing }
                in
                div []
                    [ text "生成された短縮URL:"
                    , Html.a
                        [ href shortURL
                        , target "_blank"
                        , style "margin-left" "0.5em"
                        ]
                        [ text shortURL ]
                    ]

            Nothing ->
                div [] []
        , case model.errorMsg of
            Just msg ->
                div [] [ text msg ]

            Nothing ->
                div [] []
        ]
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateRawURL text ->
            ( { model | rawURL = text }, Cmd.none )

        UpdateRawWantedShortURL text ->
            ( { model | rawWantedShortURL = text }, Cmd.none )

        RequestShortURL ->
            ( model, requestShortURL ( model.rawURL, model.rawWantedShortURL ) )

        ReceiveShortURL result ->
            let
                newShortURL : Maybe String
                newShortURL =
                    case result of
                        Ok value ->
                            value.hash

                        Err error ->
                            Nothing

                errorMsg : Maybe String
                errorMsg =
                    case result of
                        Err (DetailedBadStatus _ value) ->
                            Just value.message

                        _ ->
                            Nothing
            in
            ( { model | shortURL = newShortURL, errorMsg = errorMsg }, Cmd.none )

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


type Error
    = BadUrl String
    | Timeout
    | NetworkError
    | BadStatus Int
    | DetailedBadStatus Int ReceiveShortURLType
    | BadBody String


type alias ReceiveShortURLType =
    { status : String
    , message : String
    , hash : Maybe String
    }


expectJsonDetailed : (Result Error ReceiveShortURLType -> msg) -> D.Decoder ReceiveShortURLType -> Http.Expect msg
expectJsonDetailed toMsg decoder =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadUrl_ url ->
                    Err (BadUrl url)

                Http.Timeout_ ->
                    Err Timeout

                Http.NetworkError_ ->
                    Err NetworkError

                Http.BadStatus_ metadata body ->
                    case D.decodeString decoder body of
                        Ok value ->
                            Err (DetailedBadStatus metadata.statusCode value)

                        Err _ ->
                            Err (BadStatus metadata.statusCode)

                Http.GoodStatus_ _ body ->
                    case D.decodeString decoder body of
                        Ok value ->
                            Ok value

                        Err err ->
                            Err (BadBody (D.errorToString err))


requestShortURL : ( String, String ) -> Cmd Msg
requestShortURL ( rawURL, rawWantedShortURL ) =
    let
        toJson : ( String, String ) -> E.Value
        toJson ( url, wantedShortURL ) =
            let
                makeWantedShortURLObject =
                    if wantedShortURL == "" then
                        []

                    else
                        [ ( "wanted_short_url", E.string wantedShortURL ) ]
            in
            E.object ([ ( "url", E.string url ) ] ++ makeWantedShortURLObject)

        fromJson : D.Decoder ReceiveShortURLType
        fromJson =
            D.map3 ReceiveShortURLType
                (D.field "status" D.string)
                (D.field "message" D.string)
                (D.maybe (D.field "hash" D.string))
    in
    Http.post
        { url = "/api/create"
        , body = Http.jsonBody <| toJson ( rawURL, rawWantedShortURL )
        , expect = expectJsonDetailed ReceiveShortURL fromJson
        }
