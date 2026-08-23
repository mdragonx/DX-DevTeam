# P0 repository stabilization traceability

**Evidence class:** E0 (design) for this table and E1 (simulated) for automated tests. CI, image scans, SBOMs, attestations, repository settings, and independent review are not asserted by this document.

| ID | Acceptance criterion | Automated test/check | Evidence location |
|---|---|---|---|
| P0-01 | A clean checkout installs, checks, and builds without `.openai/hosting.json`. | `npm run test:fresh-checkout` | `scripts/test-fresh-checkout.sh`, CI `baseline` |
| P0-02 | Shell entry points are executable or invoked explicitly through Bash. | `git ls-files -s scripts` review; package scripts use Bash | `scripts/`, `package.json` |
| P0-03 | Representative data cannot be mistaken for verified evidence. | rendered HTML and review | `app/page.tsx` fixture labels |
| P0-04 | Worker dependencies are pinned, source is compiled, the entry point is real and healthy, and runtime UID/GID is 10001. | Docker build, health request, identity assertion | `infra/worker/Dockerfile`, CI `containers` |
| P0-05 | A pre-aborted signal executes no command. | `npm run test:m3` | `tests/m3/forgejo-worker.test.ts` |
| P0-06 | Required checks map one-to-one to passing executed results; missing, duplicate, unknown, and failing data blocks. | `npm run test:m3` | `services/delivery/src/laboratory-workflow.ts` |
| P0-07 | Executor errors and durable finding/evidence strings do not persist secret-bearing exception details. | `npm run test:m3` | worker and delivery redaction tests |
| P0-08 | Webhooks validate JSON before the atomic claim; corrected retry and valid duplicate semantics are tested. | `npm run test:m3` | webhook tests and `services/forgejo/src/webhook.ts` |
| P0-09 | API liveness is `/healthz` on port 3001 in code, image, Swarm, and runbook. | API container smoke test | `Dockerfile`, `infra/swarm/laboratory-stack.yml` |
| P0-10 | A production application image builds the web artifact and runs the API referenced by deployment. | production build and API image smoke test | root `Dockerfile`, CI `containers` |
| P0-11 | Deployable templates contain no example/placeholder image and require explicit immutable image substitutions. | `npm run format:check`; negative validator test | `scripts/validate-deployment-template.mjs` |
| P0-12 | Pull requests and `main` run reproducibility, quality, security, container, IaC, and SBOM jobs; `rc-*` tags additionally run provenance with retained artifacts. | `npm run test:p0` validates the trigger/evidence contract; GitHub Actions execution remains external evidence | `.github/workflows/ci.yml`, `.github/workflows/security.yml` |
| P0-13 | Required checks and one independent approval are configured and observed separately from documentation. | repository settings observation (external evidence required) | `docs/operations/REPOSITORY-CONFIGURATION.md` |

## Review-thread status

The checkout has no authenticated GitHub remote or credentials, and the repository API is not publicly readable. Therefore unresolved threads in PRs 1 and 4 could not be observed or declared resolved. The explicit P0 requirements above supersede no unseen finding. An authenticated maintainer must reconcile each thread against the exact final commit before merge.
