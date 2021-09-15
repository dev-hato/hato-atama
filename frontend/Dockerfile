FROM node:16.9.0-alpine3.12 as build

WORKDIR /usr/src/app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/elm.json frontend/webpack.config.js ./
COPY frontend/src ./src
RUN npm run build


FROM nginx:1.21.3

COPY frontend/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
