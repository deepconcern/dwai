# syntax=docker/dockerfile:1

# The web app as a Next.js standalone server, installed, built, and run with
# Bun. Configure it with environment variables (see README.md).

FROM oven/bun:1.4 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.4 AS build
WORKDIR /app

# Next.js resolves the /graphql rewrite at build time, so the API's address
# is baked in here. The default is the API's service name in compose.yaml
# and in a Kubernetes namespace.
ARG API_URI=http://dwai-api:5000
ENV API_URI=$API_URI
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun --bun run build

FROM oven/bun:1.4-slim
WORKDIR /app

ARG API_URI=http://dwai-api:5000
ENV API_URI=$API_URI
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build --chown=bun:bun /app/public ./public
COPY --from=build --chown=bun:bun /app/.next/standalone ./
COPY --from=build --chown=bun:bun /app/.next/static ./.next/static

EXPOSE 3000
USER bun
CMD ["bun", "server.js"]
