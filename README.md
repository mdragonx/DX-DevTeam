# Autonomous Development Control Plane

An evidence-driven control plane for autonomous software delivery. M1 adds a production-oriented laboratory vertical slice: durable PostgreSQL intake and workflow state, deterministic stage leasing/transitions, append-only audit/outbox records, and persisted portal visibility. It does not invoke models or mutate external delivery systems.

## Boundaries

- `apps/web`: persisted portal components (the root `app` remains the vinext compatibility entry)
- `apps/api`: authenticated HTTP control-plane boundary
- `services/orchestrator`: transactional state machine, leases, recovery
- `packages/contracts`: strict versioned external/domain schemas
- `packages/evidence`: canonical content digests
- `packages/database`: PostgreSQL connectivity and transactions
- `infra`: migrations and pinned laboratory PostgreSQL definition

See [M1 traceability](docs/requirements/M1-TRACEABILITY.md), [operations](docs/operations/M1-RUNBOOK.md), [OpenAPI](docs/api/openapi.yaml), [data model](docs/architecture/M1-DATA-MODEL.md), [threat model](docs/security/THREAT-MODEL.md), and [known limitations](docs/KNOWN-LIMITATIONS.md).

## Development and validation

Node.js 22.13+ is required. Run `npm ci`, then `npm run lint`, `npm run typecheck`, `npm run test:m1`, and `npm test`. PostgreSQL runtime instructions and rollback are in the operating runbook.
