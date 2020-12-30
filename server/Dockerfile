FROM golang:1.15-buster as build

WORKDIR /go/app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app

FROM scratch

WORKDIR /app

COPY --from=build /go/app/app .

ENTRYPOINT ["./app"]
