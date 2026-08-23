# Codex prompt — Independent production acceptance

## Role

Act as an independent release auditor. Do not implement features, modify policy, waive gates or repair findings in this run. Evaluate only the exact release candidate and retained evidence.

## Preconditions

- P0, real laboratory integration and M6 are merged.
- CI is green on the exact release commit.
- An immutable release candidate, SBOM, provenance, signatures and all evidence are available.
- Production architecture, policy, secrets, identities, capacity, SLOs, backup and rollback targets are explicitly defined.
- The candidate completed a separate laboratory end-to-end and DR drill.
- The auditor execution and model family are different from the implementation and release-decision executions.

Missing prerequisites yield immediate `NO_GO`.

## Audit

Verify independently:

- requirement-to-design-to-code-to-test-to-artifact-to-deployment traceability;
- clean reproducible build and artifact digest;
- dependency, secret, SAST, SCA, license, container, IaC and DAST results;
- authentication, RBAC, credential rotation, rate limits and audit;
- prompt-injection, data-exfiltration and capability-escalation defenses;
- durable concurrency, replay, restart and recovery behavior;
- Forgejo, OmniRoute, worker, evidence, registry, metrics, secret, backup and Swarm integrations;
- canary, SLO, automatic rollback, backup restore, bidirectional migration and DR;
- Agent Composer and learning governance;
- documentation accuracy, supportability, known limitations and rollback;
- no unresolved P0/P1, high/critical vulnerability or stale/mismatched evidence;
- production policy allows only the exact environment, stack, operations and candidate.

Run targeted independent tests and compare their raw evidence with the supplied evidence. Do not accept screenshots, PR descriptions, TypeScript types, mocks, fixtures or self-reported success as proof.

## Decision output

Produce a signed, machine-readable report containing:

- exact commit and artifact/environment digests;
- each mandatory gate with PASS/FAIL and evidence digest;
- all findings and severities;
- residual risks;
- rollback target;
- verdict `GO` or `NO_GO`.

Any missing, inconclusive, stale, unsigned, mismatched or non-reproducible mandatory evidence yields `NO_GO`. Never change this rule because of deadlines.
