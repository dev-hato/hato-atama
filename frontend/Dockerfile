FROM node:19.0.1-bullseye-slim as base

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG TARGETPLATFORM

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists

COPY elm/elm_arm64 /usr/local/bin/elm

WORKDIR /usr/src/app

COPY frontend/elm.json ./

# https://github.com/elm/compiler/blob/24d3a89469e75cf7aa579442ecaf5ddfdd192ab2/installers/linux/README.md
RUN if [ "${TARGETPLATFORM}" != "linux/arm64" ]; then \
        curl https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -o /usr/bin/yq; \
        chmod +x /usr/bin/yq; \
        elm_version="$(yq '."elm-version"' elm.json)"; \
        curl -L -o elm.gz "https://github.com/elm/compiler/releases/download/${elm_version}/binary-for-linux-64-bit.gz"; \
        gunzip elm.gz; \
        chmod +x elm; \
        mv elm /usr/local/bin/; \
        rm /usr/bin/yq; \
    fi

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \; \
    && chown -R node:node /usr/src/app

USER node

FROM base as build

COPY frontend/.npmrc .
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/webpack.config.js ./
COPY frontend/src ./src
COPY frontend/public ./public
RUN npm run build \
    && rm -rf /home/node/.npm

COPY frontend/healthcheck.sh .

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
CMD ["npm", "run", "dev"]

FROM nginx:1.23.2

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \; \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /etc/nginx/conf.d
USER nginx

COPY frontend/nginx/ /etc/nginx/

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

COPY frontend/healthcheck.sh /

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
