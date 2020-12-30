module Main exposing (..)

-- Press buttons to increment and decrement a counter.
--
-- Read how it works:
--   https://guide.elm-lang.org/architecture/buttons.html
--

import Array exposing (initialize)
import Browser exposing (Document, UrlRequest)
import Browser.Navigation exposing (Key)
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)
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


type alias Model =
    {}


initializeModel : Model
initializeModel =
    {}


init : () -> Url -> Key -> ( Model, Cmd msg )
init _ _ _ =
    ( initializeModel, Cmd.none )


view : Model -> Document msg
view _ =
    { title = ""
    , body = [ div [] [ text "aaaaaaaa" ] ]
    }


update : msg -> model -> ( model, Cmd msg )
update _ model =
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
