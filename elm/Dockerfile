# https://dev.to/csaltos/elm-for-linux-arm64-32bc
# GitHub Actionsでビルドするとうまく行かないため、手元でビルドする前提
#checkov:skip=CKV_DOCKER_2
FROM debian:bullseye-slim@sha256:52927eff8153b563244f98cdc802ba97918afcdf67f9e4867cbf1f7afb3d147b

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
        automake \
        autotools-dev \
        make \
        g++ \
        ca-certificates \
        software-properties-common \
        apt-transport-https \
        lsb-base \
        lsb-release \
        zlib1g-dev \
        libpcre3-dev \
        libcurl4-openssl-dev \
        libc-dev \
        libxml2-dev \
        libsnmp-dev \
        libssh2-1-dev \
        libevent-dev \
        libopenipmi-dev \
        libpng-dev \
        pkg-config \
        libfontconfig1 \
        git \
        bzip2 \
        zip \
        unzip \
        musl-dev \
        ghc \
        cabal-install \
        libmpfr-dev \
        curl \
       && curl -L https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -o /usr/bin/yq \
       && chmod +x /usr/bin/yq \
       && apt-get autoremove -y \
       && apt-get clean \
       && rm -rf /var/lib/apt/lists/*

RUN mkdir /app  \
    && useradd -m appuser \
    && chown appuser:appuser /app

WORKDIR /app
USER appuser

COPY frontend/elm.json ./
RUN elm_version="$(yq -oy '."elm-version"' elm.json)" \
    && git clone -b "${elm_version}" https://github.com/elm/compiler.git

WORKDIR /app/compiler

RUN rm worker/elm.cabal \
    && cabal new-update \
    && cabal new-configure \
    && cabal new-build \
    && cp ./dist-newstyle/build/*-linux/ghc-*/elm-*/x/elm/build/elm/elm /usr/local/bin/elm
