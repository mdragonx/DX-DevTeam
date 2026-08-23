# Threat model — M1

## Assets and boundaries

Workflow state, audit history, bearer credentials, requirement text, and evidence digests are assets. The browser talks only to same-origin web proxies; the API owns validation and state changes; the orchestrator uses PostgreSQL transactions. No LLM or infrastructure adapter is reachable.

## Threats and controls

- **Spoofing:** API mutations/dashboard/metrics require a constant-time checked bearer token. Health is public; readiness exposes only status. Token distribution and rotation remain operator duties.
- **Tampering/replay:** strict Zod schemas, request digest plus idempotency uniqueness, row locks, lease tokens, optimistic version, append-only trigger, and immutable attempt rows.
- **Repudiation:** actor-labelled, ordered audit events include rejected transitions and expired leases. Cryptographic audit signing is deferred.
- **Information disclosure:** generic uncertain-database responses, no SQL detail, no credentials in repository or response, 1 MiB body cap, and no-store API responses.
- **Denial of service:** payload/schema limits, PostgreSQL connection/time limits, lease limits, and bounded fields. Distributed rate limiting is deferred.
- **Privilege escalation:** API token grants control-plane API access but no Forgejo, model, Swarm, or Docker authority. Fine-grained RBAC is not yet implemented and blocks production exposure.

Security disposition: suitable only for an authenticated laboratory network until identity/RBAC, TLS termination, rate limiting, audit attestations, secret rotation, and PostgreSQL backup restoration are independently verified.
