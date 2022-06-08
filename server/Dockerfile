FROM golang:1.18.3-bullseye as build

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG TARGETPLATFORM

WORKDIR /go/app

COPY go.mod go.sum ./
COPY ping ping
COPY server server

WORKDIR /go/app/ping
RUN mapfile -t PLATFORM < <(echo "${TARGETPLATFORM}" | tr '/' ' ') \
    && CGO_ENABLED=0 GOOS=linux GOARCH=${PLATFORM[2]} go build -o ping

WORKDIR /go/app/server
RUN mapfile -t PLATFORM < <(echo "${TARGETPLATFORM}" | tr '/' ' ') \
    && CGO_ENABLED=0 GOOS=linux GOARCH=${PLATFORM[2]} go build -o app \
    && go install github.com/cosmtrek/air@v1.27.3 \
    && chmod u-s /usr/bin/passwd \
    && chmod g-s /usr/bin/passwd \
    && chmod u-s /usr/bin/chfn \
    && chmod g-s /usr/bin/chfn \
    && chmod u-s /usr/lib/openssh/ssh-keysign \
    && chmod g-s /usr/lib/openssh/ssh-keysign \
    && chmod u-s /bin/umount \
    && chmod g-s /bin/umount \
    && chmod u-s /bin/mount \
    && chmod g-s /bin/mount \
    && chmod u-s /usr/bin/gpasswd \
    && chmod g-s /usr/bin/gpasswd \
    && chmod u-s /usr/bin/ssh-agent \
    && chmod g-s /usr/bin/ssh-agent \
    && chmod u-s /sbin/unix_chkpwd \
    && chmod g-s /sbin/unix_chkpwd \
    && chmod u-s /bin/su \
    && chmod g-s /bin/su \
    && chmod u-s /usr/bin/newgrp \
    && chmod g-s /usr/bin/newgrp \
    && chmod u-s /usr/bin/wall \
    && chmod g-s /usr/bin/wall \
    && chmod u-s /usr/bin/chsh \
    && chmod g-s /usr/bin/chsh \
    && chmod u-s /usr/bin/chage \
    && chmod g-s /usr/bin/chage \
    && chmod u-s /usr/bin/expiry \
    && chmod g-s /usr/bin/expiry \
    && useradd -l -m -s /bin/bash -N -u "1000" "nonroot"
USER nonroot

HEALTHCHECK --interval=5s --retries=20 CMD ["/go/app/ping/ping"]

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
