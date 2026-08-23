# Changelog

All notable changes to DX-DevTeam are recorded here.

## [0.1.0] - 2026-08-22

### Added

- Autonomous Development Control Plane web vertical slice.
- Natural-language intake and simulated six-stage delivery flow.
- Specialist composition, adversarial correction, gate, evidence, and audit views.
- Product vision, technical memory, roadmap, repository agent instructions, and Codex prompt pack.
- Initial contracts for OmniRoute, Forgejo, isolated workers, and Docker Swarm.

### Limitations

- Orchestration is simulated.
- No persistence, authentication, real agents, external integrations, or infrastructure mutation.


## [0.2.0] - 2026-08-23

### Added

- M1 PostgreSQL v1 entities, forward/rollback migrations, append-only audit, and transactional outbox.
- Strict versioned API contracts, idempotent intake/run creation, durable stage leases/transitions, health/readiness/metrics, and restart recovery.
- Persisted portal intake and delivery/audit view with fail-closed unavailability handling.
- M1 traceability, OpenAPI, data model, operating runbook, threat model, and known limitations.

### Security

- Service bearer authentication, strict input validation, bounded payloads and leases, constant-time credential comparison, and generic uncertain-database errors.

### Limitations

- Fine-grained identity/RBAC and outbox dispatch are deferred. No LLM, Forgejo, Swarm, or production mutation exists.
