# Delivery Roadmap

## M0 — Foundation

- Repository standards and contracts.
- Product vision, technical memory, threat model, and ADR template.
- Web control-plane vertical slice.
- CI validation for code and documentation.

Exit: reproducible build and documented architecture baseline.

## M1 — Durable control plane

- PostgreSQL schema for projects, requirements, runs, stages, agents, findings, gates, and evidence.
- API with strict schemas and idempotency.
- Durable state machine with leases, retries, budgets, and compensation.
- Authentication, authorization, and audit events.

Exit: a run survives process restarts without duplicating side effects.

## M2 — OmniRoute agents

- OmniRoute adapter and logical model routes.
- Structured outputs with schema repair and rejection.
- Initial PO, Architect, Developer, Critic, Security, QA, and Judge agents.
- Model-independent telemetry and cost budgets.

Exit: a requirement becomes a reviewed specification and implementation plan using real models.

## M3 — Isolated development

- Forgejo adapter.
- Disposable worker runtime.
- Branch, commit, pull request, build, and test workflow.
- Artifact and evidence capture.

Exit: the system independently modifies a laboratory repository and proves the result.

## M4 — Self-correction and gates

- Finding normalization and root-cause workflow.
- Bounded repair loops.
- Independent review and model diversity.
- SAST, SCA, secrets, tests, coverage, mutation, SBOM, and provenance gates.

Exit: injected defects are detected, repaired, and protected by regression tests.

## M5 — Swarm delivery

- Declarative Swarm stack.
- Canary release, health verification, rollback, backup, and recovery.
- Operational dashboards and alerts.

Exit: an approved laboratory release is deployed and automatically rolled back on failed verification.

## M6 — Expertise learning

- Agent Composer and expertise registry.
- Source validation, knowledge expiry, benchmarks, canary promotion, and rollback.
- Temporary and reusable domain specialists.

Exit: a new specialist demonstrates competence before receiving task capabilities.

