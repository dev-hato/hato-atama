FROM golang:1.27.3-trixie@sha256:fbb7ae40b62ff8afe31662df570d39b4f5052ac32b90dae8e60d7657a20a74f4 AS base

WORKDIR /go/app

COPY go.mod go.sum ./
COPY ping ping
COPY server server

RUN rm -rf /var/lib/apt/lists \
    && find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \;

FROM base AS build

ARG TARGETPLATFORM
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

WORKDIR /go/app/ping
RUN mapfile -t PLATFORM < <(echo "${TARGETPLATFORM}" | tr '/' ' ') \
    && CGO_ENABLED=0 GOOS=linux GOARCH=${PLATFORM[2]} go build -o ping

WORKDIR /go/app/server
# hadolint ignore=DL3062
RUN mapfile -t PLATFORM < <(echo "${TARGETPLATFORM}" | tr '/' ' ') \
    && CGO_ENABLED=0 GOOS=linux GOARCH=${PLATFORM[2]} go build -o app \
    && go install github.com/air-verse/air \
    && useradd -l -m -s /bin/bash -N -u "1000" "nonroot" \
    && chown nonroot /go/app/server
USER 1000

FROM scratch

COPY --from=build /etc/group /etc/group
COPY --from=build /etc/passwd /etc/passwd
COPY --from=build /etc/shadow /etc/shadow
USER 1000

WORKDIR /app

COPY --from=build /go/app/server/app .
COPY --from=build /go/app/ping/ping .
