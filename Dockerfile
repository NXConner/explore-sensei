# syntax=docker/dockerfile:1.6

###############################################################################
# Pavement Performance Suite – Frontend Production Image
# - Multi-stage build with dependency caching
# - Generates tactical wallpapers and bundles static assets via Vite
# - Ships behind hardened Nginx with health checks and OTEL-ready env vars
###############################################################################

FROM node:20-alpine AS base
LABEL org.opencontainers.image.title="Pavement Performance Suite" \
      org.opencontainers.image.source="https://github.com/explore-sensei/pavement-performance-suite" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app
ENV NODE_ENV=production \
    ENVIRONMENT=production \
    VITE_APP_ENV=production \
    PNPM_HOME="/root/.local/share/pnpm" \
    PATH="${PNPM_HOME}:$PATH"

RUN apk add --no-cache libc6-compat git bash curl && corepack enable

FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --no-audit --no-fund

FROM base AS builder
ARG ENVIRONMENT=production
ARG VITE_SUPABASE_URL="http://localhost:54321"
ARG VITE_SUPABASE_ANON_KEY="local-anon-key"
ARG VITE_GOOGLE_MAPS_API_KEY=""
ARG VITE_DEFAULT_THEME_PRESET="division-shd"
ARG VITE_DEFAULT_WALLPAPER="mission-grid"
ARG DIVISION_THEME_ENABLED="true"
ARG DIVISION_HUD_ENABLED="true"
ARG HUD_LABS_ENABLED="false"
ARG TACTICAL_MAP_ENABLED="true"
ARG OBSERVABILITY_PIPELINE_ENABLED="true"
ARG VITE_OTEL_EXPORT_URL="https://otel.exploresensei.com/v1/traces"

ENV ENVIRONMENT=${ENVIRONMENT} \
    VITE_APP_ENV=${ENVIRONMENT} \
    VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
    VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY} \
    VITE_DEFAULT_THEME_PRESET=${VITE_DEFAULT_THEME_PRESET} \
    VITE_DEFAULT_WALLPAPER=${VITE_DEFAULT_WALLPAPER} \
    DIVISION_THEME_ENABLED=${DIVISION_THEME_ENABLED} \
    DIVISION_HUD_ENABLED=${DIVISION_HUD_ENABLED} \
    HUD_LABS_ENABLED=${HUD_LABS_ENABLED} \
    TACTICAL_MAP_ENABLED=${TACTICAL_MAP_ENABLED} \
    OBSERVABILITY_PIPELINE_ENABLED=${OBSERVABILITY_PIPELINE_ENABLED} \
    VITE_OTEL_EXPORT_URL=${VITE_OTEL_EXPORT_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY tsconfig*.json ./
COPY vite.config*.ts ./
COPY vitest.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY index.html ./
COPY public ./public
COPY src ./src
COPY scripts ./scripts

# Generate tactical wallpapers/fonts and build production bundle
RUN npx --yes tsx scripts/verify-env.ts --file .env.example --allow-vault-placeholders && \
    npm run setup:assets && npm run build

# Optionally prune dev dependencies to shrink copied node_modules snapshot (kept for transparency)
RUN npm prune --omit=dev

FROM nginx:1.27-alpine AS runner
ENV NODE_ENV=production \
    OTEL_SERVICE_NAME="pavement-performance-suite-frontend" \
    OTEL_EXPORTER_OTLP_ENDPOINT="http://otel-collector:4318" \
    OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]