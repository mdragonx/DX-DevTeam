# Autonomous Development Control Plane

An evidence-driven control plane for autonomous software delivery. M4 adds normalized findings, bounded correction, externally pinned release policy, independent verification, and signed deterministic release decisions. Scanner wiring, autonomous merging, and production deployment remain disabled.

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
- `services/quality`: finding, repair-budget, gate-policy, and signed release-decision primitives

See [M3 traceability](docs/requirements/M3-TRACEABILITY.md), [worker protocol](docs/architecture/M3-WORKER-PROTOCOL.md), [M3 operations](docs/operations/M3-RUNBOOK.md), [threat model](docs/security/THREAT-MODEL.md), and [known limitations](docs/KNOWN-LIMITATIONS.md).

## Development and validation

Node.js 22.13+ is required. Run `npm ci`, then `npm run lint`, `npm run typecheck`, `npm run test:m4`, and `npm test`. M4 policy, incident, security, and audit procedures are under `docs/`.
