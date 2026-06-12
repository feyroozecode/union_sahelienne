FROM node:22.21.1-alpine AS build

WORKDIR /build
COPY package*.json ./
RUN npm install

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

FROM node:22.21.1-alpine AS production
RUN apk add --no-cache bash

WORKDIR /app

COPY --from=build /build/public ./public
COPY --from=build /build/.next/standalone ./
COPY --from=build /build/.next/static ./.next/static

EXPOSE 3022

ENV PORT=3022
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
