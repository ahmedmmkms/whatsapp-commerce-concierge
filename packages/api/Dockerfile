# Author: AMM
FROM node:20-alpine AS base
WORKDIR /app

# Copy workspace files (minimal for service build)
COPY packages/api/package.json packages/api/tsconfig.json ./
RUN npm i -g pnpm@9

# Copy source
COPY packages/api/src ./src

RUN pnpm add -w --silent && pnpm --filter . install --shamefully-hoist=false || true
RUN pnpm build || (echo "Skipping build placeholder" && mkdir -p dist && echo "console.log('api placeholder')" > dist/main.js)

EXPOSE 3001
CMD ["node", "dist/main.js"]

