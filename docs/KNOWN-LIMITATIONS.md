# Known limitations

- M1 uses deterministic stage mechanics; no real or simulated LLM output is treated as agent work.
- Bearer authentication is service-level only. User identity, authorization roles, token rotation, and rate limiting are not implemented; public production exposure is blocked.
- Outbox records are durable but no external dispatcher exists. No Forgejo, OmniRoute, Docker, Swarm, or deployment mutation occurs.
- Agent assignments, findings, gates, and evidence have durable v1 schemas but are not yet produced by the M1 deterministic workflow.
- Audit events are database append-only but not signed or exported to immutable storage.
- The legacy overview cards remain clearly representative UI; the Persisted Deliveries panel is the authoritative PostgreSQL view and fails closed rather than substituting fixtures.
- Migration rollback is destructive and requires a verified backup. Backup/restore automation is not included.
