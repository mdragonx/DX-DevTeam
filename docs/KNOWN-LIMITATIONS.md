# Known limitations

- M1 uses deterministic stage mechanics; no real or simulated LLM output is treated as agent work.
- Bearer authentication is service-level only. User identity, authorization roles, token rotation, and rate limiting are not implemented; public production exposure is blocked.
- Outbox records are durable but no external dispatcher exists. No Forgejo, OmniRoute, Docker, Swarm, or deployment mutation occurs.
- Agent assignments, findings, gates, and evidence have durable v1 schemas but are not yet produced by the M1 deterministic workflow.
- Audit events are database append-only but not signed or exported to immutable storage.
- The legacy overview cards remain clearly representative UI; the Persisted Deliveries panel is the authoritative PostgreSQL view and fails closed rather than substituting fixtures.
- Migration rollback is destructive and requires a verified backup. Backup/restore automation is not included.
- M2 supplies the adapter, durable schema, and reviewed-specification workflow, but does not wire an automatic outbox consumer into the API process; invocation remains an internal service operation.
- Model/provider identity and token/cost telemetry are provider-reported and not cryptographically attested. Real-model production promotion remains blocked pending independent evaluation and signed evidence.
- Generated code is neither requested nor executed in M2. Developer is planning-only despite the reserved `code` route.
- M3 provides an executable Forgejo boundary, worker protocol/runtime primitives, container hardening policy, and check-gated laboratory workflow, but no production scheduler or durable webhook receipt repository is wired into the API. Adapter response replay caching is process-local.
- Worker network egress is disabled in the reference deployment. A policy-enforcing egress proxy, full process-group/container termination integration, content-addressed object store, key rotation service, and credential broker remain required before real untrusted workloads.
- Secret detection is defense in depth and cannot prove absence of unknown or transformed credentials. Raw suspected artifacts require quarantine and credential revocation.
- The Forgejo multi-file commit endpoint is an adapter contract and must be verified against the selected Forgejo version or implemented through its Git data API before live use. No autonomous merge, release, production repository access, or deployment is enabled.
