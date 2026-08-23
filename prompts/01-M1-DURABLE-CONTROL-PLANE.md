# Codex prompt — M1 Durable Control Plane

Implement milestone M1 from `docs/ROADMAP.md` as a production-oriented vertical slice.

## Required outcome

A user can create a project, submit a natural-language requirement, start a run, and observe durable stage transitions after restarting the API or orchestrator. The implementation must not call a real LLM or mutate Forgejo/Swarm yet.

## Required design

- Monorepo boundaries: `apps/web`, `apps/api`, `services/orchestrator`, `packages/contracts`, `packages/evidence`, `infra`.
- PostgreSQL is the source of truth; no in-memory workflow state.
- Define versioned schemas for Project, Requirement, AcceptanceCriterion, Run, StageExecution, AgentAssignment, Finding, GateResult, EvidenceRecord, AuditEvent, and OutboxEvent.
- Use explicit state transitions, optimistic concurrency or row locking, idempotency keys, worker leases with expiry, retry policy, and an outbox.
- Append-only audit history. Corrections create new records instead of erasing failures.
- API responses and errors follow a documented contract.
- Add health, readiness, and metrics endpoints.
- Preserve the current UI visual language and replace fixture state incrementally.

## Acceptance criteria

1. Duplicate request submission with the same idempotency key creates one requirement.
2. Duplicate stage completion cannot advance a run twice.
3. An expired lease can be reclaimed without losing audit history.
4. Invalid state transitions are rejected and audited.
5. A process restart resumes an incomplete run.
6. The portal displays persisted projects, runs, stages, and audit events.
7. Database migrations have forward and rollback verification.
8. Unit, integration, concurrency, and restart tests pass.
9. OpenAPI, data model, operating instructions, threat model, changelog, and known limitations are updated.

## Constraints

- No direct Docker socket.
- No production credentials or external mutations.
- No claim that the simulated agents are real.
- Use pinned dependencies and commit the lockfile.
- Fail closed on schema validation or database uncertainty.

Deliver a pull request with evidence mapped to every acceptance criterion.

