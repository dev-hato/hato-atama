FROM node:15.5

WORKDIR /usr/src/app

COPY frontend/package.json ./
RUN npm install

COPY frontend .
RUN npm run build

ENTRYPOINT []