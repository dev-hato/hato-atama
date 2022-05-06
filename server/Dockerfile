FROM golang:1.18.0-bullseye as build

WORKDIR /go/app

COPY go.mod go.sum ./
COPY server server

WORKDIR /go/app/server
ENV CGO_ENABLED 0
RUN GOOS=linux GOARCH=amd64 go build -o app && go install github.com/cosmtrek/air@v1.27.3


FROM scratch

WORKDIR /app

COPY --from=build /go/app/server/app .

ENTRYPOINT ["./app"]
