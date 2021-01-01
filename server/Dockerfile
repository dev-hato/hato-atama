FROM golang:1.15-alpine as build

WORKDIR /go/app

COPY go.mod go.sum ./
COPY server server

WORKDIR /go/app/server
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app && go get -u github.com/cosmtrek/air


FROM scratch

WORKDIR /app

COPY --from=build /go/app/server/app .

ENTRYPOINT ["./app"]
