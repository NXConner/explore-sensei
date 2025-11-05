# Supabase Admin Bootstrap Guide

> Goal: establish the primary `super_admin` operator (`n8ter8@gmail.com`) in Supabase securely before running automated seeds.

## 1. Prerequisites
- Supabase project created and environment variables wired locally (`VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
- Managed database password stored in the secrets manager (do **not** check credentials into git).
- Email delivery configured (recommended) for admin verification.

## 2. Create the Admin Auth User
1. Sign in to the Supabase dashboard and open your project.
2. Navigate to **Authentication → Users**.
3. Click **Add user** and provide the following:
   - **Email:** `n8ter8@gmail.com`
   - **Password:** generate a strong passphrase (store in the password manager shared with ownership).
   - **Email confirmed:** _checked_ (skip confirmation email for the owner account).
4. Submit and verify the user appears with status **Confirmed**.

## 3. Apply Required Database Roles
The seed script assigns `super_admin` automatically, but it needs the auth user to exist first.

1. In your development shell, export the Supabase connection variables, e.g.
   ```bash
   export VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="<service-role-jwt>"
   ```
2. Run the database migrations and seed:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   - `db:migrate` executes all Node PG Migrate scripts (`db/migrations`).
   - `db:seed` verifies the admin, upserts the `profiles`, `user_roles`, `hud_preferences`, and mission intelligence sample data.
3. Confirm the admin record:
   - Query `select * from user_roles where user_id = '<admin_uuid>'` (found in the dashboard user detail).
   - Ensure the `role_id` column displays `super_admin`.

## 4. Optional Production Hardening
- Enforce MFA via Supabase Auth policies once the owner has signed in.
- Rotate the service role key after initial bootstrap and update CI secrets accordingly.
- Schedule a quarterly audit: `npm run db:seed` remains idempotent and can safely rerun to refresh baseline records.

## 5. Troubleshooting
- **User not found:** Re-run `npm run db:seed` after verifying the auth user email matches exactly (`n8ter8@gmail.com`).
- **Permission denied:** Confirm the executing machine uses a service role key (not anon/public).
- **Missing tables:** Execute `npm run db:migrate` before seeding.

Maintaining this process ensures the tactical HUD, mission feed, and policy-driven roles remain consistent between environments while keeping privileged credentials secured.
