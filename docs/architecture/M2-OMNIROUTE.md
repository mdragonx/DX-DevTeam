# M2 OmniRoute architecture

Requirement IDs `M2-AC-01`–`M2-AC-09` map in order to the milestone acceptance criteria. After M1 passed, this slice adds a provider-neutral `ModelProvider`, an OpenAI-compatible OmniRoute transport, strict versioned domain schemas, and a bounded specification workflow. Domain code sees logical routes and contracts, never provider APIs.

The workflow is `requirement → PO specification → Architect plan → independent Critic → Judge`. Rejection yields `REVISION_REQUIRED` until the configured bound, then `BLOCKED`; malformed, invalid, inconclusive, over-budget, cancelled, or non-independent verification blocks. It produces documents only and has no worker or execution capability.

Each call has an idempotency key. The durable telemetry unique constraint makes replay recording idempotent; stage completion remains owned by M1's transactional orchestrator. Rate limits, timeouts, and transient failures retry with the same key. Permanent errors do not retry. Three terminal provider failures open a time-bounded circuit.
