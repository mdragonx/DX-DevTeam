# Codex prompt — P0 repository stabilization

## Mission

Stabilize `mdragonx/DX-DevTeam` so that a clean checkout has a reproducible, continuously verified baseline. Do not integrate real infrastructure or claim production readiness in this prompt.

## Required starting procedure

1. Read `AGENTS.md`, `docs/PRODUCTION-READINESS-GATES.md`, `docs/KNOWN-LIMITATIONS.md`, and all unresolved review threads in PRs 1 and 4.
2. Start from the latest `main`; create one dedicated branch.
3. Convert every requirement below into a traceability table with a test and evidence location.
4. Do not merge the pull request yourself.

## P0 corrections

- Make a fresh clone build without untracked `.openai/hosting.json`; provide a committed non-secret default or remove the hard dependency.
- Ensure all shell scripts have correct executable modes or are consistently invoked through Bash.
- Replace fixture language that can be mistaken for verified evidence. Every fixture must be visually and semantically labelled.
- Fix the worker image: install pinned production dependencies, compile the worker, include a real entrypoint, add an image health check where applicable, and prove the container starts as UID/GID 10001.
- Honor an already-aborted cancellation signal before any command can execute.
- Map `requiredChecks` to executed results and fail when any required check is missing, duplicated, unknown or failing.
- Redact executor exception messages and every durable finding path before persistence.
- Parse and validate webhook payloads before atomically claiming the delivery ID; prove corrected retries are possible and duplicate valid deliveries remain idempotent.
- Reconcile the API health endpoint and all container/Swarm probes.
- Add a production application Dockerfile; it must build the API/web artifact actually referenced by deployment manifests.
- Remove all placeholder image references from any file presented as deployable. Templates must use explicit substitution variables and validation that rejects unresolved placeholders.

## CI and governance

Add pull-request and `main` workflows using Node.js 22.13+ with:

- `npm ci` from a clean cache.
- formatting or diff checks, lint and typecheck.
- M1–M5 tests and the production build.
- fresh-checkout test proving no hidden file is required.
- secret scanning.
- SAST/CodeQL.
- dependency and license scanning.
- Dockerfile build plus container smoke tests.
- container and IaC scanning.
- SBOM generation and provenance/attestation for release candidates.
- artifact retention sufficient for review.

Add branch-protection documentation and a repository configuration checklist requiring checks and one independent approval. Do not represent documentation as proof that GitHub protection is enabled; record actual observed configuration separately.

## Negative tests

Add tests for:

- pre-aborted jobs executing zero commands;
- missing required checks;
- secret-bearing thrown errors;
- invalid JSON webhook followed by corrected retry;
- duplicate valid webhook;
- missing hosting configuration in a clean checkout;
- worker container startup;
- API image startup and matching readiness/health probes;
- unresolved image placeholders.

## Exit evidence

The pull request may be called complete only when:

1. All unresolved P0/P1 review findings are fixed or explicitly superseded with evidence.
2. A clean checkout completes install, lint, typecheck, full tests and build.
3. Both images build and start from the committed Dockerfiles.
4. CI runs on the pull request and every required job is green.
5. Container/IaC/security results and SBOM artifacts are attached.
6. No unresolved P0/P1 review thread remains.
7. A different reviewer execution approves the exact final commit.

If GitHub settings or tools prevent any exit condition, stop with `BLOCKED`; do not mark the milestone complete.
