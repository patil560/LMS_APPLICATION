FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p uploads && chown -R node:node /app

ENV NODE_ENV=production
EXPOSE 8080
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://localhost:${PORT:-8080}/health || exit 1

# one worker per CPU core inside the container
CMD ["node", "cluster.js"]
