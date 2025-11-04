# Multi-stage Dockerfile for Pavement Performance Suite (Vite + Nginx)
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Inject env for Vite build if provided
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_GOOGLE_API_KEY
ARG VITE_GOOGLE_KEY
ARG GOOGLE_MAPS_API_KEY

RUN printf "VITE_SUPABASE_URL=%s\n" "${VITE_SUPABASE_URL}" > .env.production && \
    printf "VITE_SUPABASE_ANON_KEY=%s\n" "${VITE_SUPABASE_ANON_KEY}" >> .env.production && \
    GOOGLE_KEY_VALUE="${VITE_GOOGLE_MAPS_API_KEY:-${VITE_GOOGLE_API_KEY:-${VITE_GOOGLE_KEY:-${GOOGLE_MAPS_API_KEY}}}}" && \
    printf "VITE_GOOGLE_MAPS_API_KEY=%s\n" "${GOOGLE_KEY_VALUE}" >> .env.production || true

RUN npm run build

FROM nginx:1.27-alpine AS runner
ENV NODE_ENV=production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/health || exit 1
CMD ["nginx", "-g", "daemon off;"]