FROM node:18-alpine as dev

RUN apk add --no-cache libc6-compat
RUN apk add git &&\
    git config --global --add safe.directory /app
RUN apk add ffmpeg curl python3 g++ make

WORKDIR /app

COPY --chown=node:node . .

RUN yarn --frozen-lockfile

USER node