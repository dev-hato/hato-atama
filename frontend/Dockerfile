FROM node:17.9.0-bullseye-slim as build

WORKDIR /usr/src/app

COPY .npmrc .
COPY frontend/package*.json ./
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && npm install \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY frontend/elm.json frontend/webpack.config.js ./
COPY frontend/src ./src
COPY frontend/public ./public
RUN npm run build


FROM nginx:1.21.6

COPY frontend/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
