FROM node:18.0.0-bullseye-slim as base


FROM base as elm_compiler

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
        libmpfr-dev

RUN git clone https://github.com/elm/compiler.git

WORKDIR compiler

RUN git checkout 0.19.1 \
    && rm worker/elm.cabal \
    && cabal new-update \
    && cabal new-configure \
    && cabal new-build \
    && cp ./dist-newstyle/build/aarch64-linux/ghc-*/elm-*/x/elm/build/elm/elm /usr/local/bin/elm


FROM base as build

WORKDIR /usr/src/app

COPY .npmrc .
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/elm.json frontend/webpack.config.js ./
COPY frontend/src ./src
COPY frontend/public ./public
COPY --from=elm_compiler /usr/local/bin/elm /usr/local/bin/elm
RUN npm run build


FROM nginx:1.21.6

COPY frontend/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
