# Gamification Guide

This app includes an optional gamification layer that can be toggled on/off at runtime. It rewards on-time, safety-first behaviors, and quality documentation without incentivizing risky behavior.

## Features
- Points, XP, levels, and streaks
- Badges and quest progress
- Leaderboard view (top 20 by points)
- End-of-Day (EOD) Summary modal on clock-out
- Device + optional geo enrichment for anti-cheat
- Global on/off toggle in TopBar and Settings

## Toggling Gamification
- TopBar: click GAMIFY button
- Settings: Settings → Gamification tab → Enable Gamification
- State persists to `localStorage` under `gamification_enabled`

## Events Tracked
- `clock_in`, `clock_out`
- `photo_uploaded`
- `job_status_updated`
- `weather_alert_configured`
- `map_drawing_saved`

All emissions are guarded by the global gamification toggle.

## Data Model (Supabase)
Tables (public schema):
- `game_events` (idempotency_key, device_id, geo, metadata)
- `game_profiles` (points, xp, level, streaks)
- `game_badges`
- `game_quests` (JSON progress)
- `game_redemptions`
- View: `game_leaderboard` (select granted to anon/authenticated)
- RPC: `upsert_quest_progress(user_id, quest_code, key, inc)`

RLS: Users can select/insert/update their own records; view is readable by anon/authenticated.

## Edge Functions
- `game-process-event`: validates, caps, awards, streak logic, badges, quest progress
- `game-get-profile`: fetches profile + badges
- `game-get-leaderboard`: reads `game_leaderboard`

Invoke via Supabase client `supabase.functions.invoke` (already wired in `src/lib/gamificationClient.ts`).

## Environment
Set in your frontend environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Set for Edge Functions deployment (project settings):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Deploy & Migrate
1) Apply SQL: run the contents of `supabase/migrations/20251011090000_gamification.sql` in the Supabase SQL editor (or your migration pipeline).
2) Deploy functions:
   - `game-process-event`
   - `game-get-profile`
   - `game-get-leaderboard`

## Testing
- Unit tests: `tests/gamification.rules.test.ts`
- E2E: `e2e/gamify-toggle.spec.ts` (ensures toggle hides panels)

## Extending
- Add rules in `src/config/gamificationRules.ts`
- Emit new events via `useGamification().emitEvent({ event_type, metadata })`
- Gate all emissions/UI by `useGamificationToggle().enabled`

