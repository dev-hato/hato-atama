FROM node:18.0.0-bullseye-slim as build

ARG TARGETPLATFORM
ENV ELM_VERSION 0.19.1

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/bin/

COPY elm/elm_arm64 elm

RUN if [ "${TARGETPLATFORM}" -ne "linux/arm64" ]; then \
        curl -L -o elm.gz https://github.com/elm/compiler/releases/download/${ELM_VERSION}/binary-for-linux-64-bit.gz; \
        gunzip elm.gz; \
        chmod +x elm; \
    fi
RUN apt-get remove -y curl

WORKDIR /usr/src/app

COPY frontend/.npmrc .
COPY frontend/package*.json ./
RUN npm install

COPY frontend/elm.json frontend/webpack.config.js ./
COPY frontend/src ./src
COPY frontend/public ./public
RUN npm run build


FROM nginx:1.21.6

COPY frontend/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
