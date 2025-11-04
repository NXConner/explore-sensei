# Secrets Management (Production Readiness)

This project is designed to keep secrets out of source control and runtime HTML. For production environments, use a dedicated secrets manager and inject variables at build/deploy time.

## Reference Template

- `config/secrets-manager.example.json` captures the canonical vault topology:
  - `provider`: Swap between `aws-secrets-manager`, `doppler`, or `hashicorp-vault` depending on your platform.
  - `mappings`: Declaratively map each secret to the environment variables expected by the application.
  - `rotationDays`: Default rotation policy (30 days) — adjust to match compliance requirements.
  - `bootstrap.command`: CLI command the CI job or Docker entrypoint should run to hydrate the environment before `npm run build` / `npm run db:migrate`.

## Provider Quickstarts

- **AWS Secrets Manager**: Fetch secrets in CI, export to environment, and pass as build args or `.env` before container start.
- **Doppler**: Configure a project and run `doppler run -- npm run build` (or the command listed in the template) so `VITE_*` variables are injected automatically.
- **HashiCorp Vault**: Mount an AppRole, render a `.env` via `vault kv get` + templating, and scope policies to the secret paths listed in the template.

Requirements

- Never commit real keys. Use `.env.example` as the authoritative list of variables.
- Prefer CI/CD secret stores over local `.env` for production.
- Ensure `VITE_*` vars passed via Docker build args (see `Dockerfile`/`docker-compose.yml`).

## Audit Checklist

- [ ] No hardcoded secrets in repo
- [ ] CI configured with `VITE_*` variables
- [ ] Runtime logs do not echo secrets (see `src/lib/monitoring.ts` sanitization)
- [ ] Secrets manager rotation policy documented and automated (`rotationDays` in template is updated)
- [ ] Production deploys fetch secrets via CLI/bootstrap prior to running database migrations or builds
