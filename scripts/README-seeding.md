# Seeding & Admin Setup

1. In Supabase Dashboard, create the user `n8ter8@gmail.com` via Authentication > Users.
2. Run the seed script locally after setting env vars:

```bash
cp .env.example .env
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npx ts-node scripts/seed.ts
```

The database trigger in migrations assigns `Super Administrator` automatically to `n8ter8@gmail.com` on first sign-in.
