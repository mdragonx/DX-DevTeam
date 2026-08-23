# Codex prompt — M3 Forgejo and isolated worker

Implement milestone M3 only after M2 gates pass.

## Required outcome

The system receives an approved implementation plan, creates a branch in a non-production Forgejo laboratory repository, modifies code inside a disposable isolated worker, runs validation, and opens a pull request with complete evidence.

## Work

- Create a Forgejo adapter for repository, branch, commit, issue, pull-request, status, and webhook operations.
- Use a dedicated service identity and the least privilege available.
- Implement authenticated, replay-protected, idempotent webhook handling.
- Design an isolated worker protocol with signed job manifests and content-addressed inputs/outputs.
- Run as a non-root user with dropped capabilities, resource limits, bounded processes, read-only root where possible, explicit writable paths, and deny-by-default network policy.
- Do not mount the host Docker socket.
- Detect and redact secrets before model context, logs, patches, and evidence.
- Require the Developer, Critic, Security, and QA stages to use separate executions.
- Preserve failed attempts and findings.

## Acceptance criteria

1. Replayed webhooks produce no duplicate transition or change.
2. A worker cannot access unauthorized repositories, networks, secrets, or host paths.
3. An expired job is terminated and its lease safely reclaimed.
4. A malicious repository instruction cannot change system policy or exfiltrate secrets.
5. A generated change is committed only after local required checks.
6. A pull request links requirement, plan, findings, tests, and evidence.
7. Worker crash, Forgejo outage, conflict, cancellation, and cleanup tests pass.
8. Installation, operations, troubleshooting, security, worker protocol, and recovery documentation are updated.

Use only a disposable laboratory repository. Do not enable autonomous merging or production deployment.

