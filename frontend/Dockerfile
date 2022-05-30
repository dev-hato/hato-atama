FROM node:18.2.0-bullseye-slim as build

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG TARGETPLATFORM

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists

COPY elm/elm_arm64 /usr/local/bin/elm

WORKDIR /usr/src/app

COPY frontend/elm.json ./

# https://github.com/elm/compiler/blob/24d3a89469e75cf7aa579442ecaf5ddfdd192ab2/installers/linux/README.md
RUN if [ "${TARGETPLATFORM}" != "linux/arm64" ]; then \
        elm_version="$(grep elm-version elm.json | sed -e 's/ *"elm-version": "\(.*\)",$/\1/g')"; \
        curl -L -o elm.gz "https://github.com/elm/compiler/releases/download/${elm_version}/binary-for-linux-64-bit.gz"; \
        gunzip elm.gz; \
        chmod +x elm; \
        mv elm /usr/local/bin/; \
    fi
RUN apt-get remove -y curl \
    && apt-get autoremove -y \
    && apt-get clean

RUN chown -R node:node /usr/src/app

USER node

COPY frontend/.npmrc .
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/webpack.config.js ./
COPY frontend/src ./src
COPY frontend/public ./public
RUN npm run build

FROM nginx:1.22.0

RUN for f in /usr/bin/newgrp /usr/bin/expiry /usr/bin/wall /bin/umount /usr/bin/chsh /usr/bin/gpasswd \
             /sbin/unix_chkpwd /bin/mount /usr/bin/chfn /bin/su /usr/bin/passwd /usr/bin/chage; do \
      chmod u-s "${f}"; \
      chmod u-g "${f}"; \
    done \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid \
    && chown -R nginx:nginx /var/cache/nginx
USER nginx

COPY frontend/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
