# Codex prompt — M5 Docker Swarm delivery

Implement milestone M5 only after M4 gates pass.

## Required outcome

An approved laboratory release is deployed declaratively to a dedicated Docker Swarm stack, verified through a canary, promoted on objective health evidence, and automatically rolled back when verification fails.

## Work

- Produce a dedicated stack with isolated networks, secrets, configs, volumes, resource limits, health checks, placement policy, and pinned image digests.
- Keep desired state in Forgejo. Portainer is visibility, not the canonical configuration.
- Implement a deployment adapter with allowlisted stacks and environments.
- Require immutable image, SBOM, provenance, vulnerability result, migration plan, backup result, and rollback plan.
- Implement canary health, functional probes, SLO comparison, promotion, cancellation, and rollback.
- Record exact service spec, image digest, configuration digests, timestamps, metrics, and verification results.
- Validate backup restoration and forward/backward database migration in an isolated environment.

## Acceptance criteria

1. Only allowlisted environment and stack operations are possible.
2. Plaintext secrets never appear in repository, commands, logs, or evidence.
3. Failed canary checks trigger automatic rollback to the exact prior version.
4. Restarting the controller does not duplicate deployment or promotion.
5. A migration failure restores a known-good database state.
6. Portainer changes cannot silently redefine canonical desired state.
7. Disaster recovery can recreate the control plane from documented inputs.
8. Deployment, rollback, backup, restore, security, and troubleshooting manuals are updated.

Do not target production until the complete laboratory test suite passes.

