FROM node:20-slim AS development

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

COPY . .

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# ── Production ────────────────────────────────────────────────────────────────
FROM node:20-slim AS production

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

COPY . .

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nodejs
USER nodejs

EXPOSE 3001
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/index.js"]