# FITIND standalone image — plain Bun server (server/standalone.ts).
FROM oven/bun:1

WORKDIR /app
ENV NODE_ENV=production

# Dependencies first (better layer caching). The vendored SDK is a
# file: dependency, so it must be present before `bun install`.
COPY package.json bun.lock bunfig.toml ./
COPY vendor ./vendor
RUN bun install

# App source, then build the client bundle (client/dist).
COPY . .
RUN bun run build:client

EXPOSE 3000

# The host provides PORT. The database is remote (Turso): TURSO_DATABASE_URL
# and TURSO_AUTH_TOKEN are set as env vars (see README → Deploy free on
# Vercel + Turso; this image is an optional alternative for Docker hosts).
# DATABASE_PATH is only the local fallback.
CMD ["bun", "start"]
