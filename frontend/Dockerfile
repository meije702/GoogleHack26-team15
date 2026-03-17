FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# At build time we don't know the backend URL yet, so leave empty.
# The rewrites use BACKEND_URL from the runtime environment.
ENV NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_WS_URL=""

RUN npm run build

# --- Production stage ---
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
