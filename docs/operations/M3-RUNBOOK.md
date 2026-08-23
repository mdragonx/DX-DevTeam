# M3 laboratory installation and operations

## Installation

1. Complete the M2 gate: `npm ci && npm run test:m2` on Node.js 22.13 or newer.
2. Create a disposable Forgejo repository, add topic `dx-laboratory`, protect its default branch, and disable auto-merge.
3. Create a dedicated service identity limited to repository content/branch writes, issues, pull requests, statuses, and hooks for that repository. Store its token in the control-plane secret provider, never project data or a worker manifest.
4. Configure an HTTPS Forgejo URL, the exact `owner/repository`, webhook secret, signing public keys, and immutable worker policy digest.
5. Build the pinned worker image and record its resolved digest. Review `infra/worker/compose.yaml`; do not add the Docker socket, host mounts, or general network.
6. Run `npm run typecheck`, `npm run lint`, and `npm run test:m3`. Promote only when every check passes.

## Routine operation

- Admit only an approved `implementation-plan.v1` and a repository allowlist match.
- Monitor lease age, webhook rejection/duplicate counts, Forgejo retries, cleanup failures, and redaction findings without recording matched secret values.
- Treat `FAILED`, `CANCELLED`, and `EXPIRED` attempts as retained evidence. Never retry a non-retryable 4xx response automatically.
- Verify the PR body contains requirement, plan, issue, findings, tests, evidence, and bundle digest. Humans remain responsible for merge decisions.

## Troubleshooting

| Symptom | Safe response |
|---|---|
| Signature/policy mismatch | Quarantine the job; verify key ID, controller clock, and policy rollout. Never bypass verification. |
| Forgejo 429/5xx | Keep the stable idempotency key, back off within deadline, then block. |
| Forgejo 409 | Preserve attempt, fetch branch state, require a newly approved rebased job. |
| Webhook rejected | Verify raw-body handling, HMAC secret, delivery ID, clock skew, and HTTPS proxy behavior. |
| Worker expiry/crash | Terminate process group, preserve partial outputs/findings, release lease, destroy volumes, schedule only a fresh signed attempt. |
| Secret finding | Redact all derived locations, revoke suspected credential, quarantine raw artifact, and start incident handling. |

## Recovery and rollback

Cancel the run, terminate its worker, wait for lease release, and verify volume deletion. Close the unmerged PR and delete its `dx/<run-id>` branch; no default-branch mutation should exist. Revoke the task/service credential on suspected compromise and rotate webhook/signing secrets. Reconcile claimed webhook delivery IDs and workflow idempotency records before resuming. If cleanup cannot be proven, quarantine the host and block rescheduling. Because M3 performs no autonomous merge or deployment, rollback is limited to laboratory issues, PRs, branches, and disposable worker state.
