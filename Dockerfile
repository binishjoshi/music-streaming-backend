FROM node:18-alpine as dev

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --chown=node:node . .

RUN yarn --frozen-lockfile

USER node