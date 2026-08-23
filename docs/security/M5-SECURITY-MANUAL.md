# M5 deployment security manual

- Give the controller a dedicated identity limited to the laboratory stack and operations in the versioned policy. Workers, web portal, and Portainer receive no Docker socket or deployment credential.
- Supply secret values only from an approved secret manager into external Swarm secrets. Use versioned names and rotate by creating a new object; never expose values through environment variables, CLI arguments, command tracing, logs, metrics, evidence, or repository content.
- Verify registry trust, pinned digest, SBOM, provenance signature, vulnerability result, configuration digests, and signed M4 release decision before mutation. Missing, stale, mismatched, or inconclusive evidence blocks.
- Restrict manager nodes and overlay ingress, encrypt transport, patch the engine, audit daemon access, and alert on any runtime spec digest that differs from Forgejo.
- Encrypt backups with separately controlled keys, test restore and both migration directions in isolation, and restrict/decommission temporary data copies.
- Treat a Portainer edit, unexpected service update, digest mismatch, secret exposure, or evidence discontinuity as an incident. Stop promotion, roll back, preserve redacted evidence, rotate affected credentials, and follow `docs/operations/M4-INCIDENT-PROCEDURE.md`.

The reference transport is an interface, not a privileged Docker client. A live implementation must avoid shell construction, redact engine errors, use mutually authenticated access, persist records transactionally, and pass independent penetration and failover testing before laboratory approval.
