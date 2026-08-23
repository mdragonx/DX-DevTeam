# M1 data model and decisions

PostgreSQL is the only workflow source of truth. API and orchestrator processes retain no authoritative workflow state. The root web application is a compatibility shell; new boundaries live in `apps/web`, `apps/api`, `services/orchestrator`, `packages/contracts`, `packages/evidence`, and `infra`.

All entities carry `schema_version=1`: Project owns Requirements; a Requirement owns ordered AcceptanceCriteria and Runs; a Run owns StageExecutions, AgentAssignments, Findings, GateResults, EvidenceRecords, and audit/outbox history. AuditEvent has a monotonic sequence and a database trigger rejecting update/delete. Finding corrections reference the superseded finding. Gate attempts and stage attempts are new rows, never destructive replacements.

Run state is explicit. A transaction locks the run and stage, validates the lease token/owner/expiry and current state, writes completion, advances with a version predicate, creates the next execution, and appends audit/outbox records. Duplicate completion is rejected. Lease expiry marks the prior attempt `EXPIRED` and adds an attempt. The outbox is committed with domain changes; a future dispatcher may publish it at least once.

## Assumptions and consequences

- PostgreSQL 17 is the supported production database; tests use pinned PGlite for hermetic PostgreSQL semantics without Docker socket access.
- Retry policy is bounded by explicit attempts and lease duration; automatic external work is not yet present.
- An unknown database result returns `DATABASE_UNCERTAIN` and is never reported as success.
- Rollback removes M1 data and is destructive; backup and maintenance mode are mandatory.
