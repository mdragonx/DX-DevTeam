# M3 isolated development traceability

M3 is the laboratory-only vertical slice. It requires an approved `implementation-plan.v1`; it neither autonomously merges nor deploys.

| ID | Acceptance criterion | Implementation and deterministic evidence |
|---|---|---|
| M3-AC-01 | Webhook replay has no duplicate effect | HMAC plus timestamp window and atomic delivery claim; replay test |
| M3-AC-02 | Worker isolation | Signed repository capability, policy digest, no network by default, non-root container, dropped capabilities, bounded resources, explicit mounts; policy tests |
| M3-AC-03 | Expiry and lease reclamation | Abort at manifest expiry, preserve attempt, release lease with `EXPIRED`; runtime test |
| M3-AC-04 | Repository instructions cannot alter policy or expose secrets | Signed external policy, untrusted-data envelope, secret redaction; tampering/injection tests |
| M3-AC-05 | Checks precede commit | Workflow rejects absent or failed local checks before Forgejo mutation; ordering test |
| M3-AC-06 | PR traceability | PR body links requirement, plan digest, issue, findings, tests, evidence, commit bundle |
| M3-AC-07 | Failure behavior | Tests cover worker crash/expiry, outage classification, conflict, cancellation, and cleanup through lease release |
| M3-AC-08 | Operational documentation | M3 install/runbook, worker protocol, security model, recovery, limitations, changelog |

## Security and operational consequences

The service token is confined to one configured `owner/repository`, and the repository must be active and carry the `dx-laboratory` topic. Forgejo remains a security boundary: deploy a dedicated identity with repository read/write, issue, PR, status, and hook permissions only. Do not grant administration, organization, package, release, merge, or production access. In-memory adapter replay caching is process-local; callers must use durable workflow idempotency in a multi-replica deployment.

## Requirements and assumptions

- **REQ-M3:** deliver an approved plan through a disposable worker and laboratory pull request with evidence.
- Forgejo's exact fine-grained permission vocabulary varies by deployment version; operators must verify the effective permissions before issuing the token.
- Actual model-authored patch generation and a production-grade container scheduler are outside M3. The included protocol, runtime boundary, container policy, adapter, and orchestration slice are executable building blocks, not a claim of production readiness.
