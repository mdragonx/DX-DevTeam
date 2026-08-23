# Production readiness gates

This document is normative. A milestone is not complete because interfaces, mocks, fixtures, fake transports, in-memory stores, placeholder digests, or unit tests exist. Those artifacts are useful development scaffolding but cannot satisfy an operational exit criterion.

## Evidence classes

- **E0 — design:** documents, schemas, interfaces, diagrams.
- **E1 — simulated:** mocks, fakes, fixtures, in-memory tests.
- **E2 — integrated laboratory:** real external services in an isolated environment with retained logs and content-addressed results.
- **E3 — release candidate:** immutable built images, SBOM, provenance, security results, migration/rollback/restore evidence, and independent review.
- **E4 — production canary:** production-like or production canary verification with SLOs, rollback and post-deployment evidence.

Production requires E3 for every mandatory gate and E4 for deployment gates. E0/E1 can never be promoted or described as operational completion.

## Mandatory repository gates

1. A fresh checkout builds and tests with only documented prerequisites.
2. CI executes on every pull request and protected branch.
3. Required checks include install reproducibility, formatting, lint, typecheck, unit/integration/contract tests, production build, secret scanning, SAST, SCA/license, container and IaC scanning.
4. No unresolved P0/P1 finding or unresolved review thread.
5. Pull requests cannot merge before all required checks and an independent approving review.
6. Release artifacts are produced by CI, pinned by digest, accompanied by SBOM and signed provenance.
7. Documentation and known limitations match observed behavior.

## Mandatory runtime gates

1. PostgreSQL, OmniRoute, Forgejo, worker execution, evidence storage, scanners, registry, metrics, secrets and Swarm transports are real implementations.
2. Durable stores survive restart and concurrent replay.
3. Workers execute inside the intended container boundary and cannot bypass required checks, cancellation, network, filesystem or secret policies.
4. A real laboratory repository is modified through Forgejo and the complete evidence chain is retained.
5. A real laboratory Swarm performs canary, promotion, rollback, backup restore, forward/backward migration and disaster-recovery drills.
6. Failure injection proves fail-closed behavior.
7. Authentication uses real user/service identities, RBAC, rotation and rate limits.
8. An independent verifier reviews both evidence and residual risk.

## Product completeness gates

1. Agent Composer exists and creates only versioned, schema-valid specialist definitions.
2. New specialists pass independent benchmarks before receiving capabilities.
3. Knowledge updates use allowlisted authoritative sources, provenance, expiry, poisoning defenses and rollback.
4. The author cannot create or modify its own final evaluation.
5. Dynamic specialists cannot change policy, permissions, budgets, gates or tool allowlists.
6. The portal distinguishes facts, fixtures, simulations, blocked results and verified evidence.

## Decision

Any missing mandatory gate yields `NO_GO`. Time pressure cannot change a gate or evidence class.
