# Codex prompt — M2 OmniRoute and initial agents

Implement milestone M2 only after M1 gates pass.

## Required outcome

A persisted requirement is transformed into a structured, reviewed specification and implementation plan using OmniRoute. No generated code is executed in this milestone.

## Work

- Implement an OmniRoute adapter behind a provider-neutral interface.
- Configure logical routes: `requirements`, `architecture`, `code`, `critic`, `security`, `judge`, and `fast`.
- Create versioned agent definitions for PO, Architect, Developer, Critic, Security, QA, and Judge.
- Validate every model response against strict versioned JSON schemas.
- Repair invalid syntax at most once; then fail closed.
- Store requested route, effective model, latency, token counts, cost when available, fallback, prompt version, input/output digests, and result.
- Enforce task budgets, timeouts, cancellation, retry classification, and circuit breaking.
- Prevent prompt injection from requirements and repository content.
- Make the critic produce reproducible counterexamples and the judge evaluate only specification, artifact, and evidence.
- Use a different execution—and preferably a different model family—for author and critical verifier.

## Acceptance criteria

1. Provider/model changes do not affect domain contracts.
2. Malformed or schema-invalid output never advances workflow state.
3. Timeouts and rate limits retry safely without duplicate stage completion.
4. Budget exhaustion blocks the run with an auditable reason.
5. Injected instructions inside a requirement cannot change policy, permissions, tools, or gates.
6. A critic rejection returns the run to a bounded revision state.
7. Recorded telemetry contains no secrets or prohibited raw sensitive data.
8. Contract, failure, injection, timeout, fallback, and replay tests pass.
9. Agent manuals, prompt catalog, threat model, API docs, runbook, and changelog are updated.

Use a mock OmniRoute server in CI. Keep real endpoint and credential configuration outside source control.

