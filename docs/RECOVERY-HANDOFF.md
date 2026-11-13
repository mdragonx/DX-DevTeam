# Recovery and AI handoff
Reviewed 2026-11-13 UTC. Public, repository-only continuity record. No private deployment details are included.

## Identity and authoritative reading
This is the Autonomous Development Control Plane in DX-DevTeam. Do not treat Code-Vibe, LocalAI or their deployment evidence as acceptance for this project.
Read [README](../README.md), [known limitations](KNOWN-LIMITATIONS.md), [roadmap](ROADMAP.md), [production-readiness gates](PRODUCTION-READINESS-GATES.md), and [issue 11](https://github.com/mdragonx/DX-DevTeam/issues/11).

The README introduces M4, but package scripts and merged history include M5/M6. [PR 10](https://github.com/mdragonx/DX-DevTeam/pull/10) is confirmed merged at `92c29b0e8068c83d7305bede9600327da36e837b`. Its M6 work is explicitly E1 reference/simulated lifecycle, not a real laboratory or production release.

## Architecture map
- `apps/web` and root `app`: persisted portal and compatibility entry.
- `apps/api`: authenticated API.
- `services/orchestrator`: transactional workflow, leases and recovery.
- `packages/contracts`, `packages/evidence`, `packages/database`: strict schemas, content digests and PostgreSQL.
- `services/forgejo`, `services/worker`, `services/delivery`: repository boundary, signed bounded job protocol and check-before-commit laboratory workflow.
- `services/quality`: findings, bounded repair and signed release decisions.
- `services/deployment`: allowlisted Swarm adapter/controller contracts.
- `services/expertise`: source quarantine, authority-free composition, independent evaluation and exact rollback.
- `infra`: migrations and laboratory definitions; not permission to mutate a deployed system.

## Key decisions and invariants
Evidence over assertion; fail closed on incomplete or inconsistent evidence. No autonomous merge or production deployment. Expertise/personality cannot grant authority, destinations, credentials or budgets. Independent evaluation remains separate from the author. Source poisoning, conflicting claims, expiry and revocation must invalidate learned claims correctly.
Preserve exact immutable release inputs, content digests and rollback specifications. Do not replace absent persisted data with representative UI fixtures. Migration rollback can be destructive and requires a verified backup.

## What exists versus what is still missing
Known limitations document:
- Service bearer auth is not full user identity/RBAC/rotation/rate limiting; public production exposure is blocked.
- Durable outbox schemas are not a running dispatcher/scheduler or durable webhook receipt implementation.
- Worker protocol and hardening primitives are not complete real process/container termination, governed egress, credential broker or managed key rotation.
- Forgejo multi-file commit behavior needs selected-version verification.
- M4 primitives do not wire scanners/CI, independent policy authority, immutable evidence or managed signing.
- M5 reference transport/store are tests; real Engine, durable store, registry verifier, reconciliation, metrics, secrets, RBAC and backup are not proven.
- M6 lacks durable sources/specialists, fetch/scanning, evaluator workers, model integration, telemetry/routing and E2 drill evidence.
- Historical P0 external gates were unobserved. Recheck their current state; do not relabel an old access limitation as a fresh CI failure.
Consequently M6 remains BLOCKED until the documented real-service and evidence gates are met.

## Canonical backlog
[Issue 11](https://github.com/mdragonx/DX-DevTeam/issues/11) consolidates missing M1–M6 acceptance. Start there instead of duplicating issues.
1. Refresh exact-SHA CI, branch-protection/review and release artifact observations.
2. Retain immutable RC SBOM/provenance/signature evidence and verify the documented rc-* path.
3. Implement/validate real identity and safe service boundaries before public exposure.
4. Deliver one bounded end-to-end laboratory workflow with restart, replay, failure, restore and exact rollback.
5. Only then evaluate expertise promotion using independent evidence.
6. Reconcile README's introductory milestone with current M5/M6 implementation and remaining limits, without presenting tests as production.
Use the normative evidence definitions in the readiness gates; do not claim GO from documentation or fixtures.

## Safe recovery workflow
1. Record branch, commit, uncommitted work and current issue/PR states.
2. Inspect current package manifest and lockfile. Node >=22.13.0 is declared.
3. In an isolated development environment use npm ci, npm run lint, npm run typecheck and npm test. npm test includes M1–M6, P0, build and rendered HTML checks; passing only test:m4 is not the full suite.
4. Use npm run format:check for whitespace and deployment-template validation. Review scripts before fresh-checkout or infrastructure-related commands.
5. Capture exact SHA, tool versions, command, output, failures and evidence class. Keep reported provider telemetry distinct from independently verifiable evidence.
6. Do not run migrations, tag releases, deploy Swarm stacks or wire live credentials merely because the repository includes examples.
7. Update issue 11 and this handoff with narrowly verified outcomes and remaining blockers.

## This handoff's verification limits
Repository README, package manifest, known limitations, open audit issue and PR metadata were read. No new test/build/CI run, external gate acceptance or live-system check occurred. PR 10's historical test claims are not rerun results. This documentation does not change policies, code, releases, privileges or deployment state.
