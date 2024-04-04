FROM node:18.19-alpine AS builder

RUN apk add curl bash --no-cache
RUN curl -sfL https://gobinaries.com/tj/node-prune | sh

WORKDIR /build
ADD . /build
RUN yarn install --frozen-lockfile
RUN yarn run build

FROM node:18.19-alpine

RUN apk update && apk upgrade --available && sync

WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/package.json .
COPY --from=builder /build/tsconfig.json .
#COPY --from=builder /build/libs/ ./libs/
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/src ./src/

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

EXPOSE 80

CMD [ "yarn", "start:prod" ]
