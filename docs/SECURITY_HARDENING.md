# Security Hardening Playbook

This playbook captures the minimum operational security bar for the Pavement Performance Suite across development, staging, and production.

## 1. Baseline Dependency Scans

| Command | Purpose |
| --- | --- |
| `npm run security:audit` | Run `npm audit --audit-level=high` against the current lockfile (fast, no auth required). |
| `npm run security:baseline` | Creates `reports/snyk-report.json`, runs `npm audit --audit-level=high`, then executes `snyk test --severity-threshold=high`. Fails the build when high severity issues are detected. |
| `npm run security:snyk` | Stand-alone Snyk scan (requires `snyk auth`). |
| `npm run security:monitor` | Sends the current dependency snapshot to Snyk for continuous monitoring (CI/staging only). |

Checkout `reports/snyk-report.json` after the baseline job to review CVEs with full context. The `reports/` directory is ignored by git.

## 2. Tooling Setup

1. Install dependencies (`npm install`).
2. Authenticate Snyk once per machine:
   ```bash
   npx snyk auth
   ```
3. (Optional) Set `SNYK_TOKEN` in CI to run baseline scans without prompts.

## 3. Secrets Management Workflow

- Reference configuration: `config/secrets-manager.example.json` defines AWS Secrets Manager usage with Doppler fallback. Replicate the structure in your infra repository.
- Bootstrap per environment:
  ```bash
  # Example: hydrate .env.runtime during a deploy
  aws secretsmanager get-secret-value \
    --secret-id pps/app/$NODE_ENV \
    --query SecretString --output text > .env.runtime
  ```
  Fall back to the Doppler command if AWS credentials are unavailable locally.
- Rotate production secrets every 30 days (`rotation.rotationDays` in the template). When rotating:
  1. Update Secrets Manager values.
  2. Redeploy services referencing them.
  3. Run `npm run security:baseline` to confirm no leaked credentials remain in the repo.

## 4. Compliance Considerations

| Area | Action |
| --- | --- |
| **Virginia & North Carolina licensing** | Retain digital copies of DPOR/NC Licensing certificates in the vault. Document renewals in `docs/COMPLIANCE_CHECKLIST.md` (update quarterly). |
| **Church client data** | Store contact lists and project files in encrypted storage (S3 bucket with SSE-KMS). Ensure access logs are retained for 1 year. |
| **Incident response** | Use `docs/SECURITY_HARDENING.md` plus GitHub Issues to log incidents. Within 24 hours run `npm run security:baseline`, invalidate exposed keys, and notify stakeholders. |
| **Backups** | Schedule nightly Postgres snapshots (Supabase → AWS backups) and verify restore procedures monthly. |

## 5. Automated Gates

- Add `npm run security:baseline` to the CI pipeline before deploy steps (Phase 11).
- Fail the pipeline when high severity issues are discovered; review `reports/snyk-report.json` in CI artifacts.
- Pair the baseline step with `npm run security:monitor` on `main` to keep Snyk alerts current.

## 6. Manual Checklist (Monthly)

- [ ] `npm run security:baseline`
- [ ] Review Snyk dashboard for new issues.
- [ ] Confirm Secrets Manager rotation schedule and audit logs.
- [ ] Validate Supabase admin list (only `n8ter8@gmail.com` and delegated operators).
- [ ] Re-run `npm run db:seed` in staging to ensure idempotent setup.

## 7. References

- Supabase admin bootstrap: `docs/SUPABASE_ADMIN_BOOTSTRAP.md`
- Secrets template: `config/secrets-manager.example.json`
- Deployment checklist: `docs/DEPLOYMENT_CHECKLIST.md`

Keep this document updated as new tooling or compliance requirements are introduced.
