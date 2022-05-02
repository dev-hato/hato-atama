FROM debian:bullseye-slim

ENV ELM_VERSION 0.19.1

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
       && apt-get clean \
       && rm -rf /var/lib/apt/lists/*

WORKDIR /

RUN git clone -b ${ELM_VERSION} https://github.com/elm/compiler.git

WORKDIR /compiler

RUN rm worker/elm.cabal \
    && cabal new-update \
    && cabal new-configure \
    && cabal new-build \
    && cp ./dist-newstyle/build/*-linux/ghc-*/elm-*/x/elm/build/elm/elm /usr/local/bin/elm
