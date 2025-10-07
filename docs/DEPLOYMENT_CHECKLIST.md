# Deployment Checklist

- [ ] Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_MAPS_API_KEY` in CI/CD and container build args
- [ ] Configure `LOVABLE_API_KEY` in Supabase project env for Edge Functions
- [ ] Run Supabase migrations
- [ ] Seed initial data if needed (`ts-node scripts/seed.ts`)
- [ ] Build and push Docker image
- [ ] Run CI (lint, typecheck, unit, e2e)
- [ ] Verify environment-specific configs and secrets manager
