FROM node:26.12.1-bookworm-slim@sha256:28147155d47dc31abe0a46e0d12b59b2fb3d0a2dcc5dc65fce76a074180b16fe AS base

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG TARGETPLATFORM

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists

WORKDIR /usr/src/app

COPY frontend/elm.json ./

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \; \
    && chown -R node:node /usr/src/app

USER 1000

FROM base AS build

COPY frontend/.npmrc .
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/elm-watch.json ./
COPY frontend/webpack.config.js ./
COPY frontend/src ./src
COPY frontend/public ./public
RUN npm run build \
    && rm -rf /home/node/.npm

FROM nginx:1.31.8@sha256:6e67f8eaac94fc456588d4ff6c470d984841f5b5dc4279863d5cbe6ec5a60def

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \; \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /etc/nginx/conf.d

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
