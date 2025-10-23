# Secrets Management (Production Readiness)

This project is designed to keep secrets out of source control and runtime HTML. For production environments, use a dedicated secrets manager and inject variables at build/deploy time.

- Doppler: configure a project and `doppler run -- npm run build` to inject `VITE_*` vars.
- HashiCorp Vault: mount an AppRole and export secrets into environment prior to build steps.
- AWS Secrets Manager: fetch in CI, export to environment, and pass as build args in Docker.

Requirements
- Never commit real keys. Use `.env.example` as the authoritative list of variables.
- Prefer CI/CD secret stores over local `.env` for production.
- Ensure `VITE_*` vars passed via Docker build args (see `Dockerfile`/`docker-compose.yml`).

Audit Checklist
- [ ] No hardcoded secrets in repo
- [ ] CI configured with `VITE_*` variables
- [ ] Runtime logs do not echo secrets (see `src/lib/monitoring.ts` sanitization)
