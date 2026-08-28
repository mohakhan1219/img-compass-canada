FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Baked into the client bundle. Production/ECS images must use the BFF, not localStorage.
ARG NEXT_PUBLIC_PERSISTENCE=remote
ENV NEXT_PUBLIC_PERSISTENCE=$NEXT_PUBLIC_PERSISTENCE
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=43210
ENV HOSTNAME=0.0.0.0
RUN addgroup -S compass && adduser -S compass -G compass
RUN apk add --no-cache wget
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY db ./db
COPY certs ./certs
USER compass
EXPOSE 43210
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD wget -qO- http://127.0.0.1:43210/api/health || exit 1
# Production path: migrate + standalone Next server. Do not run scripts/dev.mjs.
CMD ["sh", "-c", "node db/migrate.mjs && node server.js"]
