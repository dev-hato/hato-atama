FROM golang:1.18.0-bullseye as build

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG TARGETPLATFORM

WORKDIR /go/app

COPY go.mod go.sum ./
COPY server server

WORKDIR /go/app/server
RUN mapfile -t PLATFORM < <(echo "${TARGETPLATFORM}" | tr '/' ' ') \
    && CGO_ENABLED=0 GOOS=linux GOARCH=${PLATFORM[2]} go build -o app \
    && go install github.com/cosmtrek/air@v1.27.3 \
    && rm -rf go/pkg/mod/golang.org/x/net@*/http2/Dockerfile \
              usr/local/go/src/crypto/elliptic/internal/fiat/Dockerfile \
              go/pkg/mod/google.golang.org/grpc@*/interop/xds/server/Dockerfile \
              go/pkg/mod/github.com/imdario/mergo@v*/.vscode \
              go/pkg/mod/google.golang.org/grpc@*/interop/xds/client/Dockerfile \
              go/pkg/mod/golang.org/x/sys@*/unix/linux/Dockerfile \
              go/pkg/mod/github.com/cosmtrek/air@*/Dockerfile \
              go/pkg/mod/github.com/pelletier/go-toml@*/Dockerfile \
              go/pkg/mod/golang.org/x/sys@*/unix/linux/Dockerfile \
    && for f in usr/bin/wall bin/umount usr/bin/chfn usr/bin/passwd bin/su \
             bin/mount usr/bin/expiry usr/bin/chsh usr/bin/chage usr/bin/newgrp \
             usr/bin/ssh-agent usr/lib/openssh/ssh-keysign sbin/unix_chkpwd usr/bin/gpasswd; do \
      chmod u-s "${f}"; \
      chmod u-g "${f}"; \
    done \
    && useradd -l -m -s /bin/bash -N -u "1010" "nonroot"
USER nonroot

FROM scratch

COPY --from=build /etc/passwd /etc/passwd
USER nonroot

WORKDIR /app

COPY --from=build /go/app/server/app .

ENTRYPOINT ["./app"]
