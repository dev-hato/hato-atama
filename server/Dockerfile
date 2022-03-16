FROM golang:1.18beta2-bullseye as build

WORKDIR /go/app

COPY go.mod go.sum ./
COPY server server

WORKDIR /go/app/server
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app && go install github.com/cosmtrek/air@v1.27.3


FROM scratch

WORKDIR /app

COPY --from=build /go/app/server/app .

ENTRYPOINT ["./app"]
