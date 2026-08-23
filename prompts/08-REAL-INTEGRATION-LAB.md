# Codex prompt — Real laboratory integration

## Mission

Replace M1–M5 runtime fakes with real, durable laboratory integrations and prove one end-to-end autonomous delivery in an isolated environment. This prompt must not target production.

## Preconditions

- P0 stabilization is merged and required CI is green on the exact base commit.
- Laboratory endpoints and task-scoped credentials are supplied through the approved secret mechanism, never chat, prompts, source or logs.
- The allowed Forgejo repository and Swarm stack are disposable and explicitly labelled laboratory.
- Real image registry, PostgreSQL, metrics, evidence storage, backup target and OmniRoute are reachable from the execution environment.

If a precondition is missing, produce a precise blocker and stop. Do not replace the missing integration with a mock.

## Required implementations

- Durable outbox dispatcher with leases, retries, dead-letter state and restart recovery.
- Durable webhook receipt store with atomic claim after validation.
- Durable Forgejo idempotency/result store; verify every used endpoint against the deployed Forgejo version.
- Real OmniRoute HTTP transport, authentication, timeouts, fallback reporting, cost/token telemetry and model identity capture.
- Durable job scheduler and lease store.
- Container-backed command executor that enforces signed manifests, UID 10001, read-only root, dropped capabilities, process/resource limits, command allowlist, writable-path allowlist, cancellation and network policy.
- Content-addressed immutable evidence store with retention and integrity verification.
- Actual SAST, SCA, secrets, tests, coverage, mutation, SBOM, provenance, container, IaC and DAST runners.
- Managed or externally controlled release signing keys; private signing material must never enter the application database.
- Real Docker/Swarm transport restricted to the allowlisted laboratory stack.
- Durable deployment store with transactional state transitions and reconciliation after restart.
- Real metrics queries, registry digest verification, secret manager integration, backup/restore and database migration execution.
- Authentication with user/service identities, RBAC, token rotation, audit and rate limiting.
- Observability: structured redacted logs, metrics, traces, alerts and correlation identifiers.

## End-to-end acceptance scenario

1. Submit a new requirement through the portal.
2. Persist and normalize it using a real OmniRoute route.
3. Produce specification and plan through independent author/critic/judge executions.
4. Create an isolated signed worker job.
5. Modify a real disposable Forgejo repository on a branch.
6. Execute required checks inside the hardened worker.
7. Inject at least one functional defect and one security defect.
8. Detect, record, repair and add regressions within budgets.
9. Open a Forgejo pull request with complete traceability.
10. Build immutable images in CI and produce SBOM/provenance/security results.
11. Generate an independently signed release decision.
12. Verify backup and bidirectional migration in isolation.
13. Deploy a real Swarm canary.
14. Force one failed canary and prove exact rollback.
15. Repeat with passing evidence and promote.
16. Restart API, orchestrator and deployment controller during safe points and prove recovery without duplicate side effects.
17. Reconstruct the environment from documented inputs in a DR drill.

## Required evidence

Retain exact commit, image/config/environment digests, prompts and agent versions, effective models, redacted logs, CI runs, scanner outputs, SBOM, provenance, signatures, backup/restore results, migration results, metrics windows, Swarm specs, rollback proof, post-deployment probes and DR results.

Mocks and in-memory stores remain allowed only in unit tests. End-to-end exit evidence must come from real laboratory services.

## Exit

Return `LAB_GO` only if every scenario passes against real services and an independent reviewer verifies the evidence. Otherwise return `LAB_NO_GO` with blockers and no production policy.
