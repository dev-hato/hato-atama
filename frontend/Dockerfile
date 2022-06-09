FROM node:18.3.0-bullseye-slim as build

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

RUN chmod u-s /usr/bin/wall \
    && chmod g-s /usr/bin/wall \
    && chmod u-s /usr/bin/passwd \
    && chmod g-s /usr/bin/passwd \
    && chmod u-s /usr/bin/gpasswd \
    && chmod g-s /usr/bin/gpasswd \
    && chmod u-s /bin/su \
    && chmod g-s /bin/su \
    && chmod u-s /usr/bin/chsh \
    && chmod g-s /usr/bin/chsh \
    && chmod u-s /usr/bin/chfn \
    && chmod g-s /usr/bin/chfn \
    && chmod u-s /usr/bin/expiry \
    && chmod g-s /usr/bin/expiry \
    && chmod u-s /usr/bin/newgrp \
    && chmod g-s /usr/bin/newgrp \
    && chmod u-s /bin/umount \
    && chmod g-s /bin/umount \
    && chmod u-s /sbin/unix_chkpwd \
    && chmod g-s /sbin/unix_chkpwd \
    && chmod u-s /usr/bin/chage \
    && chmod g-s /usr/bin/chage \
    && chmod u-s /bin/mount \
    && chmod g-s /bin/mount \
    && chown -R node:node /usr/src/app

USER node

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

FROM nginx:1.22.0

RUN chmod u-s /usr/bin/newgrp \
    && chmod g-s /usr/bin/newgrp \
    && chmod u-s /usr/bin/expiry \
    && chmod g-s /usr/bin/expiry \
    && chmod u-s /usr/bin/wall \
    && chmod g-s /usr/bin/wall \
    && chmod u-s /bin/umount \
    && chmod g-s /bin/umount \
    && chmod u-s /usr/bin/chsh \
    && chmod g-s /usr/bin/chsh \
    && chmod u-s /usr/bin/gpasswd \
    && chmod g-s /usr/bin/gpasswd \
    && chmod u-s /sbin/unix_chkpwd \
    && chmod g-s /sbin/unix_chkpwd \
    && chmod u-s /bin/mount \
    && chmod g-s /bin/mount \
    && chmod u-s /usr/bin/chfn \
    && chmod g-s /usr/bin/chfn \
    && chmod u-s /bin/su \
    && chmod g-s /bin/su \
    && chmod u-s /usr/bin/passwd \
    && chmod g-s /usr/bin/passwd \
    && chmod u-s /usr/bin/chage \
    && chmod g-s /usr/bin/chage \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /etc/nginx/conf.d
USER nginx

COPY frontend/nginx/ /etc/nginx/

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

COPY frontend/healthcheck.sh /

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
