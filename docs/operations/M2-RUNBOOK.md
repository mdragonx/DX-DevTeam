# M2 OmniRoute runbook

Set `OMNIROUTE_ENDPOINT` and `OMNIROUTE_API_KEY` only in the runtime secret manager; neither belongs in project configuration. Configure OmniRoute logical routes (`requirements`, `architecture`, `code`, `critic`, `security`, `judge`, `fast`) so author and verifier routes use different model families. CI must point to the mock server.

Alerts: investigate `CIRCUIT_OPEN`, sustained `RATE_LIMIT`, and `TIMEOUT`; do not manually advance the stage. `BUDGET_EXHAUSTED`, invalid output, verifier-family collision, and judge inconclusive are blocking evidence. Cancellation is terminal for the attempt. Retry by creating/resuming a bounded revision with the same artifact lineage, never by editing telemetry.

Rollback: stop M2 consumers, apply `0002_m2_omniroute.down.sql`, and revert the application release. This removes generated M2 artifacts and telemetry, so export evidence first. M1 intake/orchestration remains intact.
