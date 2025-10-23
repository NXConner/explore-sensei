# Phase 1: Analysis & Strategic Roadmap

## Project Summary
- Purpose: Pavement Performance Suite for asphalt operations with church-focused workflows and veteran-owned compliance.
- Core: React + TypeScript (Vite), Tailwind, Radix UI, PWA; Supabase (Postgres with RLS, edge functions); ML microservice (`ml/`) for asphalt segmentation; structured logging/observability in `src/lib/monitoring.ts`.
- Maps: Google Maps primary, with Mapbox/MapLibre fallback via `src/config/env.ts`. Keys can be overridden per-device in Settings.

## Key Findings
- Strong foundation: auth, data access, migrations (roles/user_roles/RLS), feature flags, PWA, tests, gamification all present.
- Gaps addressed in this pass:
  - .env.example was missing → added.
  - .dockerignore missing → added to reduce build context.
  - Prettier configuration missing → added with Tailwind plugin.
  - Persisted weather alerts pipeline incomplete → implemented end-to-end (hook + UI mapping + table already exists via migrations).
  - Secrets management playbook missing → added `docs/SECRETS_MANAGEMENT.md`.
- Opportunities:
  - Expand OpenAPI generation to include all edge functions.
  - Optional: add `.prettierignore`/`.editorconfig` for DX, and a local DB option in compose (Supabase stack) if desired.
  - Consider small test additions around AI→Estimate flow and PWA update toasts.

## Improvement & Completion Plan (Prioritized)
1. Persisted Weather Alerts end-to-end (DONE). [Fix/New-Feature]
2. Developer Experience polish: .env.example (DONE), .dockerignore (DONE), Prettier config (DONE). [Fix]
3. OpenAPI spec: include all functions (ai-chat, analyze-asphalt, maps, game-*). [Refactor/Docs]
4. Performance governance: enforce size-limit and audit large modals for dynamic import. [Refactor]
5. Security: confirm no secrets in client bundle; keep log sink redaction; periodic `npm audit` in CI (present). [Fix]
6. Tests: unit for alerts mapping (DONE), add AI→Estimate integration and E2E smoke. [New-Feature]
7. Optional: Compose service for local Supabase or document using `supabase start`. [Docs]

## Feature Maximization
- AI Detection → Estimate: event-driven prefill in `EstimateCalculatorModal` with PDF export, map overlays, and manual adjust (present; expand tests).
- Weather System: persisted alerts with adjustable radius on map (`WeatherRadarLayer`), periodic refresh, alert list UI (now wired).
- Theming/Wallpapers: multiple themes, faithful variants, and custom wallpapers already supported; ensure Settings exposes all.
- Observability: structured logging with optional external sink envs; keep redaction and health checks.

## Phased Implementation Roadmap

| Priority | Task Description | Task Type (Max-Feature/New-Feature/Refactor/Fix) | Files to Modify/Create |
|---|---|---|---|
| P0 | Add .env.example (DONE) | Fix | `.env.example` |
| P0 | Add .dockerignore (DONE) | Fix | `.dockerignore` |
| P0 | Add Prettier config (DONE) | Fix | `.prettierrc.json` |
| P0 | Persisted weather alerts: hook + modal mapping (DONE) | New-Feature | `src/hooks/useWeatherAlerts.ts`, `src/components/weather/WeatherRadarModal.tsx` |
| P0 | Unit test for weather alerts mapping (DONE) | New-Feature | `tests/useWeatherAlerts.test.ts` |
| P1 | Expand OpenAPI spec to include all edge functions | Refactor/Docs | `scripts/generate-openapi.ts`, `docs/swagger.json` |
| P1 | Performance: ensure heavy modals are lazy-loaded; verify size-limit | Refactor | `src/components/**`, `package.json` |
| P1 | AI→Estimate flow integration test and E2E | New-Feature | `tests/**`, `e2e/**` |
| P2 | Optional: add `.prettierignore` and `.editorconfig` | Refactor | repo root |
| P2 | Optional: document local Supabase via `supabase start` | Docs | `docs/README.md`, `docs/DEPLOYMENT_CHECKLIST.md` |
