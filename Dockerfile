FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application files
COPY server.js ./
COPY data/ ./data/
COPY public/ ./public/

EXPOSE 3000

CMD ["node", "server.js"]
