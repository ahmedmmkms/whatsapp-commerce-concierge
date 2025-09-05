# Author: AMM
FROM node:20-alpine AS base
WORKDIR /app

COPY packages/web/package.json ./
RUN npm i -g pnpm@9
RUN pnpm add -w --silent || true

COPY packages/web .
RUN pnpm build || true

EXPOSE 3000
CMD ["pnpm", "dev"]

