FROM golang:1.23.3-bullseye@sha256:82ae8b9b6fb38aa6ffe9c2da4b5d1090e9f541761f6c22ffe93bba288c0b65f0 AS base

WORKDIR /go/app

COPY go.mod go.sum ./
COPY ping ping
COPY server server

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \;

FROM base AS build

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG TARGETPLATFORM

WORKDIR /go/app/ping
RUN mapfile -t PLATFORM < <(echo "${TARGETPLATFORM}" | tr '/' ' ') \
    && CGO_ENABLED=0 GOOS=linux GOARCH=${PLATFORM[2]} go build -o ping

WORKDIR /go/app/server
RUN mapfile -t PLATFORM < <(echo "${TARGETPLATFORM}" | tr '/' ' ') \
    && CGO_ENABLED=0 GOOS=linux GOARCH=${PLATFORM[2]} go build -o app \
    && go install github.com/air-verse/air \
    && useradd -l -m -s /bin/bash -N -u "1000" "nonroot"
USER nonroot

HEALTHCHECK --interval=5s --retries=20 CMD ["/go/app/ping/ping"]
CMD ["air", "-c", ".air.toml"]

FROM scratch

COPY --from=build /etc/group /etc/group
COPY --from=build /etc/passwd /etc/passwd
COPY --from=build /etc/shadow /etc/shadow
USER nonroot

WORKDIR /app

COPY --from=build /go/app/server/app .
COPY --from=build /go/app/ping/ping .

HEALTHCHECK --interval=5s --retries=20 CMD ["./ping"]
ENTRYPOINT ["./app"]
