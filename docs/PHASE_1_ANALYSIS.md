# Phase 1: Analysis & Strategic Roadmap

## Project Summary
- Purpose: Pavement Performance Suite for asphalt operations with church-focused workflows and veteran-owned compliance.
- Tech: React + TypeScript (Vite), Tailwind, Radix UI; Supabase (Postgres, RLS, edge functions); PWA; Playwright E2E; structured logging in `src/lib/monitoring.ts`.
- Maps: Google Maps primary with Mapbox fallback. Keys read via `src/config/env.ts` and loaded via `src/lib/googleMapsLoader.ts`.

## Key Findings
- Google Maps watermark/billing issues appear when API key lacks billing; code already falls back to Mapbox and surfaces toasts.
- Console logging present in multiple areas; a centralized logger exists and should be used everywhere.
- AI asphalt detection implemented via Supabase edge function `supabase/functions/analyze-asphalt`; estimate prefill not wired in UI.
- Weather alerts currently mocked in `src/hooks/useWeatherAlerts.ts` and UI references a future table.
- CI, Docker, a11y lint, and tests are present; further polish needed on performance and docs breadth.

## Improvement & Completion Plan (Prioritized)
1. Replace console logging with env-aware `logger` across app and service worker. [Fix]
2. Wire AI results to Estimate module via event-driven prefill and overlay broadcast. [Max-Feature]
3. Implement `weather_alerts` table + RLS and switch hook to Supabase data. [New-Feature]
4. Harden Google Maps loader messaging and non-fatal fallbacks; document billing & restrictions. [Refactor]
5. Performance: ensure lazy-load for heavy modals, monitor bundle size, and verify service worker cache policies. [Refactor]
6. Security: ensure secrets never leak to client; keep LOVABLE API keys only on edge; rate-limit AI endpoints (already in ai-chat). [Fix]
7. Expand tests: integration for estimates prefill, weather alerts fetching; add E2E validating AI->Estimate flow. [New-Feature]
8. Documentation: add Phase 1 report (this file); extend README for Maps billing instructions. [Docs]

## Feature Maximization
- AI Detection: one-click "Generate Estimate" pre-fills items based on area; overlay visualization on map; PDF export retained.
- Weather System: persisted alerts with RLS; configurable alert radius on map; real-time updates via polling or channels.
- Maps UX: graceful fallback to Mapbox; informative toasts; no blocking dialogs.

## Phased Implementation Roadmap

| Priority | Task Description | Task Type | Files to Modify/Create |
|---|---|---|---|
| P0 | Replace console logs with logger; gate SW logs to dev | Fix | src/lib/monitoring.ts, various components, public/sw.js |
| P0 | Wire AI results to Estimate via CustomEvent and prefill | Max-Feature | src/components/ai/AIAsphaltDetectionModal.tsx, src/components/estimate/EstimateCalculatorModal.tsx, src/pages/Index.tsx |
| P0 | Add Supabase `weather_alerts` + RLS and hook | New-Feature | supabase/migrations/20251019090000_weather_alerts.sql, src/hooks/useWeatherAlerts.ts |
| P1 | Improve Google Maps loader logging and fallback | Refactor | src/lib/googleMapsLoader.ts, src/components/map/MapContainer.tsx |
| P1 | Add tests for AI->Estimate and weather alerts | New-Feature | tests/* |
| P2 | Update README with Maps billing & restrictions | Docs | README.md |
