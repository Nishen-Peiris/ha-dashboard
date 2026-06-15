FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN node ./node_modules/vite/bin/vite.js build

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 8080

CMD ["node", "server/index.js"]
