# Gamification Finish Plan & Checklist

A concise, production-oriented checklist to finalize, launch, and sustain the gamification feature.

## 1) Executive summary
- Gamification is implemented and toggleable (default OFF). This guide lists what to verify, how to roll it out safely, and how to operate it in production.

## 2) Current implementation snapshot (done)
- Toggle: `TopBar` button and `Settings → Gamification` tab; persisted in `localStorage` (`gamification_enabled`).
- Client: `src/lib/gamificationClient.ts` (deviceId + optional geo enrichment), `src/hooks/useGamification.ts`.
- Events wired: `clock_in/out`, `photo_uploaded`, `job_status_updated`, `weather_alert_configured`, `map_drawing_saved`.
- UI: `AchievementsPanel`, `LeaderboardPanel`, `QuestCenter`, `EODSummaryModal` (clock-out).
- DB: tables `game_events`, `game_profiles`, `game_badges`, `game_quests`, `game_redemptions`; view `game_leaderboard`; RPC `upsert_quest_progress`.
- Edge Functions: `game-process-event`, `game-get-profile`, `game-get-leaderboard`.
- RLS: users manage their own records; `game_leaderboard` allowed for `anon, authenticated` selects.
- Tests: Unit (levels), E2E (toggle hides panels).

## 3) Production setup (must do)
- Apply SQL migration: `supabase/migrations/20251011090000_gamification.sql`.
- Deploy Edge Functions: `game-process-event`, `game-get-profile`, `game-get-leaderboard`.
- Configure env (frontend): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Configure env (functions): `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- Verify RLS policies with a non-admin user.
- Confirm default OFF: open app fresh (incognito) → panels hidden; toggle works.

## 4) Remaining enhancements (optional but recommended)
- Rules tuning: adjust caps and base points in `src/config/gamificationRules.ts`.
- Badge catalog: add milestone badges (e.g., `ON_TIME_10`, `SAFETY_7`, `PHOTO_50`).
- Quest definitions: create 2–3 live quests (`PHOTO_PRO`, `RAIN_READY`, `ZERO_REWORK_MONTH`) and surface progress text in `QuestCenter`.
- Anti-cheat hardening: server-side geo/time plausibility checks, duplicate suppression windows, optional supervisor attestations for high-value events.
- Observability: ship metrics (events/min, awarded points, error rate), dashboards, and alerts on function failures/timeouts.
- Admin screens: basic admin-only views to search user profiles, badges, and quests.
- Data lifecycle: retention policy + a path to delete a user’s gamification data on request.
- Accessibility: ARIA labels on celebration toasts and panels; color-contrast validation.
- i18n: move user-facing strings for gamification UI into centralized copy.
- Offline: queue event emissions (already idempotent) with exponential backoff and retry after reconnect.

## 5) Rollout plan (phased)
- Phase 0 (Internal): enable toggle for admins only; validate event flow and RLS.
- Phase 1 (Pilot): enable for managers + 1 crew. Use points only; hide leaderboard.
- Phase 2: enable badges + EOD summary; monitor engagement/latency.
- Phase 3: enable leaderboard and quests; add weekly email/summary if desired.
- Phase 4: rules tuning based on observed behavior.

## 6) QA checklist
- Toggle OFF: no events emitted; panels hidden; no EOD modal.
- Toggle ON: each wired action emits one event; idempotency enforced; daily caps respected.
- Profile reflects points/xp/level changes within a few seconds.
- Streak increments only once per day; resets correctly after a gap day.
- Badges insert once; duplicates prevented by unique constraints.
- Leaderboard updates; ties ordered consistently.
- RLS: user cannot read/write others’ records; view is read-only.
- Mobile: toggle and EOD modal usable; no layout regressions.
- Accessibility: panels and toasts are readable by screen readers.

## 7) Acceptance criteria (go/no-go)
- [ ] All migrations applied and idempotent reruns succeed.
- [ ] Edge Functions deployed and healthy (no 5xx in logs over 24h pilot).
- [ ] Event → profile propagation < 3s p95; error rate < 1%.
- [ ] Toggle OFF produces zero `game_events` writes across a full workday sample.
- [ ] At least one badge awarded in pilot; no duplicates observed.
- [ ] Leaderboard displays top 20 without PII beyond acceptable identifiers.

## 8) Monitoring & alerts
- Track: events/min, awarded points/min, function failure rate, latency, DB error rate.
- Alerts: function error rate > 2% for 10m; latency p95 > 2s for 10m; DB throttling.

## 9) Operations runbook
- Toggle emergency OFF: use TopBar/Settings or temporarily block calls to `game-process-event`.
- Rule changes: update `gamificationRules.ts`; commit; redeploy; note rule version in commit.
- Data fix: use Supabase SQL editor with care; preserve idempotency and RLS.

## 10) Commands & references
- Deploy functions (from your Supabase project): deploy `game-process-event`, `game-get-profile`, `game-get-leaderboard`.
- Tests: `npm test` (unit) and `npx playwright test` (E2E).
- Key files:
  - Client & hooks: `src/lib/gamificationClient.ts`, `src/hooks/useGamification.ts`, `src/hooks/useQuests.ts`
  - UI: `src/components/gamification/*`
  - Toggle context: `src/context/GamificationContext.tsx`
  - SQL: `supabase/migrations/20251011090000_gamification.sql`

## 11) Owners & cadence
- Product owner: <assign>
- Engineer on-call: <assign>
- Weekly review: rules tuning, badge/quest rotation, and metrics review.

## 12) Risks & mitigations
- Cheating (spoofed geo): plausible-range checks and attestations; monitor anomalies.
- Engagement fatigue: seasonal resets; cosmetic rewards; opt-out.
- Privacy: minimal metadata in events; document data lifecycle and export.

— End —
