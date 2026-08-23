# M4 self-correction and release-gate traceability

## Contract and acceptance criteria

M4-REQ-01 normalizes every finding with lifecycle state, severity, confidence, reproducible command/result, affected requirement and versions, root cause, remediation, and content-addressed evidence. **AC-1:** invalid or incomplete findings are rejected; seeded authorization and vulnerable-dependency fixtures produce reproducible findings.

M4-REQ-02 bounds correction by attempts, tokens, elapsed time, and compute. **AC-2/3:** resolution requires a regression gate; repeated, non-improving, or exhausted corrections block.

M4-REQ-03 evaluates mandatory quality and security evidence. **AC-4/5:** unresolved high/critical findings and absent, failed, inconclusive, stale, mismatched, or unverifiable results block.

M4-REQ-04 separates author, critic, security reviewer, QA verifier, and judge executions. **AC-6:** the judge consumes a trusted policy digest and has no override input.

M4-REQ-05 signs deterministic release decisions. **AC-7:** decisions bind the commit, artifact, environment, SBOM, provenance, gate evidence, and findings. **AC-8:** false-positive disposition requires structured evidence and an independent validator. **AC-9:** operational documentation is versioned with this change.

## Verification map

`tests/m4/release-gates.test.ts` is the executable contract. It seeds functional authorization and security dependency findings, checks lifecycle closure, all configured gate families, repair termination, evidence freshness/linkage, role independence, policy tampering, and Ed25519 decision verification.

## Security and operations

Policy authority supplies the trusted digest out of band; repository policy edits cannot authorize themselves. Private signing keys are runtime inputs and never stored here. Operators must quarantine blocked artifacts and follow the incident procedure. Rollback is removal of the M4 caller and restoration of the prior immutable policy digest; prior release decisions remain verifiable.
