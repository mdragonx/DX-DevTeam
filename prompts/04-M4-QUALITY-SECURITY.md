# Codex prompt — M4 Self-correction and release gates

Implement milestone M4 only after M3 gates pass.

## Required outcome

Injected functional and security defects are found by independent checks, converted into reproducible findings, corrected within explicit budgets, and protected by regression tests. Unresolved or inconclusive findings block release.

## Work

- Define a normalized finding lifecycle with severity, confidence, reproduction, affected requirement, root cause, remediation, affected versions, and evidence.
- Implement bounded repair loops with attempt, token, time, and compute budgets.
- Detect repeated patches and absence of measurable progress.
- Add unit, integration, contract, end-to-end, property-based, mutation, concurrency, fault-injection, and recovery gates as applicable.
- Add secrets, SAST, SCA, license, IaC, image, SBOM, provenance, and DAST gates.
- Enforce independent author, critic, security reviewer, QA verifier, and release judge.
- Make gate policy external, versioned, and impossible for an agent to weaken.
- Produce a signed release decision from deterministic results.

## Acceptance criteria

1. Each seeded defect is detected with a reproducible test or tool result.
2. A correction cannot close a finding until its regression and relevant suite pass.
3. Repeated or non-improving corrections terminate in a blocked state.
4. Critical/high unresolved vulnerabilities always block.
5. Missing, stale, mismatched, or unverifiable evidence blocks.
6. The release judge cannot override mandatory policy.
7. Every artifact is linked to its exact commit, build environment, SBOM, tests, and findings.
8. False-positive disposition requires structured evidence and independent validation.
9. Quality policy, security manual, incident procedure, audit guide, and changelog are updated.

