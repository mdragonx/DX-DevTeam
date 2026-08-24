# M6 expertise learning traceability

## Evidence classification and decision

This change is **E1 (simulated)**. It implements deterministic contracts and unit-level lifecycle validation only. It does not evidence the required real OmniRoute, durable orchestration, evidence store, isolated evaluator workers, monitoring backend, or full laboratory drill. Therefore M6 is **BLOCKED** and this package must not be reported as `M6_GO`.

## Requirements and acceptance criteria

| ID | Requirement | Deterministic acceptance evidence |
| --- | --- | --- |
| M6-AC-01 | Missing expertise creates a non-routable candidate without authority. | Gap/composer test; generated definitions have no tools, credentials, network, budget, policy or gate fields. |
| M6-AC-02 | Sources and learned claims are versioned, attributable, time-bounded, licensed and revocable. | Strict source/package schemas and quarantine/revocation tests. |
| M6-AC-03 | Candidate author, benchmark author, datasets and executions are independent. | Governor blocks identity, dataset-digest and execution collisions. |
| M6-AC-04 | Safety and critical regressions cannot be traded for average accuracy, cost or latency. | Threshold and critical-regression adversarial tests. |
| M6-AC-05 | Expiry/revocation fail closed and invalidate dependent routing decisions. | Run-time expiry and source-revocation tests. |
| M6-AC-06 | Canary degradation restores the exact previous specialist version. | Registry rollback-history test. |
| M6-AC-07 | Portal exposes version, evidence, limitations, status and rollback history. | Clearly labelled E1 registry panel; absent laboratory evidence is shown as blocked. |
| M6-AC-08 | Full creation through canary rollback executes against real laboratory services. | **BLOCKED:** requires stabilized final commit, real OmniRoute/orchestrator/evidence/isolated workers, evaluator identity, licensed datasets and retained content-addressed E2 evidence. |

## Security and operational consequences

- Retrieved text is data, never instruction. Digest mismatch, prompt injection, obsolete/revoked content and detected claim conflicts remain quarantined.
- Expertise and personality remain separate from authorization. The control plane—not the composer—must attach capability-scoped authority after evaluation.
- Fine-tuning dataset preparation is explicitly not model-weight training; a training claim requires both a supported operation and resulting model identity evidence.
- The reference registry is in-process and not crash durable. It is unsuitable for operational routing until implemented behind the durable control-plane boundary with idempotent transitions and immutable evidence.

## Required E2 drill

Provision licensed, non-sensitive financial, mechanical and security datasets; independent author/evaluator identities and isolated executions; real OmniRoute; durable orchestration and evidence storage; and telemetry-backed canary routing. Retain exact source/package/evaluation/route/metric/rollback digests, then obtain independent review. A canary defect escape must automatically demote the candidate and restore the exact previous definition/package version.
