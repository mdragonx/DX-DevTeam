# M1 operating and rollback runbook

## Start

1. Use Node.js >=22.13 and PostgreSQL 17. Create `infra/postgres/secrets/postgres_password.txt` locally; never commit it.
2. Start PostgreSQL with an operator-approved rootless runtime: `docker compose -f infra/postgres/compose.yaml up -d` (the application never receives a Docker socket).
3. Apply `infra/postgres/migrations/0001_m1_control_plane.up.sql` using a migration principal.
4. Export `DATABASE_URL`, a randomly generated `CONTROL_PLANE_API_TOKEN`, and on the web process `CONTROL_PLANE_API_URL` plus the same token.
5. Run `npm run api`, then the web application. Check `/healthz`, `/readyz`, and authenticated `/metrics`.
6. On each orchestrator start, call `resumeIncompleteRuns`; it reconstructs missing pending work from PostgreSQL and is safe to repeat.

## Observability and recovery

Readiness fails closed when PostgreSQL cannot confirm a query. Alert on readiness failure, `dx_control_plane_errors_total`, expired leases, rejected transitions, and outbox backlog. Do not manually rewrite run state. Reclaim only after lease expiry. Preserve audit/outbox and add correction/attempt records.

## Rollback

Stop API/orchestrator writes, take and verify a PostgreSQL backup, deploy the prior application commit, then apply the down migration only if permanently abandoning all M1 state. Verify all M1 tables are absent and restore the backup to roll forward again. Application rollback without schema rollback is preferred because it is reversible.
