FROM golang:1.18.0-bullseye as build

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG TARGETPLATFORM

WORKDIR /go/app

COPY go.mod go.sum ./
COPY server server

WORKDIR /go/app/server
RUN PLATFORM=($(echo ${TARGETPLATFORM} | tr '/' ' ')) \
    && CGO_ENABLED=0 GOOS=${PLATFORM[1]} GOARCH=${PLATFORM[2]} go build -o app \
    && go install github.com/cosmtrek/air@v1.27.3


FROM scratch

WORKDIR /app

COPY --from=build /go/app/server/app .

ENTRYPOINT ["./app"]
