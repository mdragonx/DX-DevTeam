# M5 laboratory Swarm operations manual

## Canonical inputs

The reviewed Forgejo commit containing `infra/swarm/laboratory-stack.yml` and `policies/deployment/laboratory.v1.json` is canonical. Pin the approved commit and independently verify its signature. Record the M4 decision, image digest, SBOM, provenance, vulnerability result, migration and rollback plans, configuration digests, backup result, and prior inspected service spec. Portainer is read-only visibility; a change made there is drift, not desired state.

## Deploy and promote

1. Confirm the complete M1–M4 and M5 laboratory suites pass and the signed M4 verdict is `RELEASE` for the same commit/artifact/environment.
2. Resolve both image digest references against the trusted registry. Create versioned external config and secret objects from the approved secret manager using stdin or mounted files; never place values in arguments, shell history, repository files, logs, tickets, or evidence.
3. Label dedicated nodes as required by the stack. Confirm encrypted manager communication, restricted manager access, overlay isolation, volume capacity, monitoring, and clock synchronization.
4. Submit one unique deployment ID through the control-plane API. The controller validates artifacts, restore, and bidirectional migration in an isolated database before applying the canary.
5. Observe health and functional probes for the policy window. Supply content-addressed metrics comparing candidate and baseline SLOs. Promotion occurs only when health and functionality pass and error-rate increase remains within policy.
6. Inspect the resulting services and compare their canonical digest. Archive timestamps, exact spec/config/image digests, metrics, verification, and immutable audit references.

Do not manually run `docker stack deploy` as the routine release path: doing so bypasses authorization, idempotency, and evidence capture. Never use this laboratory policy for production.

## Cancellation and rollback

Cancellation before promotion removes the canary using the stable deployment key. Any failed health, functional, SLO, or migration check automatically applies the exact prior recorded spec. Verify replica health, prior image/config digests, SLO recovery, and database integrity. If automatic rollback is inconclusive, stop traffic, quarantine the candidate, preserve redacted diagnostics, and follow the M4 incident procedure. Replaying the same deployment ID is safe; changing its inputs is rejected.

## Backup, restore, and migration validation

Create an application-consistent, encrypted database backup before release; store it outside the Swarm with retention, access control, checksum, key reference, schema version, and timestamp. In a network-isolated disposable environment: restore it, verify checksum and application invariants, migrate forward, run compatibility probes, migrate backward, and repeat invariants. Store only result and log digests. Failure triggers restoration of that known-good backup and exact service rollback. Destroy the isolated environment and revoke temporary credentials afterward.

For an emergency restore, stop writers, select the last independently verified backup, restore into a new volume, verify checksum/schema/invariants, attach only after approval, then verify the application and retain the previous volume until the recovery window expires.

## Disaster recovery

From clean dedicated Swarm managers: restore trusted CA/manager state according to Docker's supported procedure; clone the signed Forgejo commit; verify policy and stack digests; recover versioned secrets/configs from the secret manager; pull and verify pinned images, SBOMs, and provenance; restore the independently tested database backup to a new volume; recreate labels, networks, volumes, configs, and secrets; submit a new deployment ID; and execute canary verification. Reconcile every runtime spec digest with Forgejo and archive drill evidence. A DR exercise is successful only when API readiness, audit continuity, evidence access, database invariants, and rollback all pass.

## Troubleshooting and drift

- **Authorization denied:** compare the requested tuple with the policy. Never widen policy during an incident.
- **Mutable image rejected:** resolve and review the registry digest; do not substitute a tag.
- **Canary unhealthy:** inspect redacted task events, resource pressure, placement labels, overlay reachability, config digests, and dependency health; allow automatic rollback.
- **SLO failed:** validate metric window and baseline identity. Missing or inconclusive telemetry is failure.
- **Restart/replay:** query the durable deployment record and retry the same ID/input. Never invent a second ID to force progress.
- **Portainer drift:** capture the runtime digest, revoke unauthorized write access, and reconcile through a reviewed Forgejo change or restore canonical state.
- **Restore failed:** quarantine the backup, retain the known-good volume read-only, open an incident, and block delivery.

## Reversal of this feature

Cancel active canaries, verify all services use their exact pre-M5 specs, preserve deployment/evidence records, remove controller credentials, and revert the M5 commit through review. Do not delete external secrets, backups, or prior volumes until retention and recovery obligations expire.
