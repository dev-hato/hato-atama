FROM node:15.5-alpine3.12

WORKDIR /usr/src/app

COPY frontend/package.json ./
RUN npm install

COPY frontend .
RUN npm run build

ENTRYPOINT []