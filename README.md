# Autonomous Development Control Plane

An evidence-driven control plane for autonomous software delivery. M3 adds a laboratory-only Forgejo adapter, authenticated replay-safe webhook boundary, signed isolated-worker protocol/runtime, secret redaction, and check-gated pull-request workflow. Autonomous merging and production deployment remain disabled.

## Boundaries

- `apps/web`: persisted portal components (the root `app` remains the vinext compatibility entry)
- `apps/api`: authenticated HTTP control-plane boundary
- `services/orchestrator`: transactional state machine, leases, recovery
- `packages/contracts`: strict versioned external/domain schemas
- `packages/evidence`: canonical content digests
- `packages/database`: PostgreSQL connectivity and transactions
- `infra`: migrations and pinned laboratory PostgreSQL definition
- `services/forgejo`: repository-scoped Forgejo API and webhook boundary
- `services/worker`: signed job protocol, redaction, expiry/cancellation, and attempt preservation
- `services/delivery`: check-before-commit laboratory pull-request workflow

See [M3 traceability](docs/requirements/M3-TRACEABILITY.md), [worker protocol](docs/architecture/M3-WORKER-PROTOCOL.md), [M3 operations](docs/operations/M3-RUNBOOK.md), [threat model](docs/security/THREAT-MODEL.md), and [known limitations](docs/KNOWN-LIMITATIONS.md).

## Development and validation

Node.js 22.13+ is required. Run `npm ci`, then `npm run lint`, `npm run typecheck`, `npm run test:m3`, and `npm test`. M3 installation, least privilege, troubleshooting, and recovery are in its operating runbook.
