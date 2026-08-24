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

## M2 model boundary addendum

Model providers, model output, requirement text, and future repository content are untrusted. The adapter serializes content into a labelled data envelope; only versioned system prompts supply instructions. Agents have no execution, repository mutation, credential, policy, permission, or gate-changing capability. Strict schemas reject additional fields and semantic repair is forbidden. A single syntax-only repair limits parser recovery attacks. Prompt and raw content are excluded from telemetry; only digests and bounded operational metadata persist.

Availability and spend attacks are bounded by deadline, call, token and cost budgets; cancellation, retry classification, stable idempotency keys, and circuit breaking. Author/critic/judge are separate calls and a known same model family is rejected. Provider-reported identity is not cryptographically attested, so production enablement remains blocked until OmniRoute identity claims and evidence-store attestations are independently verified.

## M3 Forgejo and disposable-worker addendum

| Threat | Control | Residual risk / response |
|---|---|---|
| Stolen service token mutates other repositories | Dedicated identity plus exact repository capability; laboratory topic and protected default branch | Forgejo token granularity varies; verify effective grants and revoke on anomaly |
| Forged or replayed webhook changes state twice | HMAC over timestamp/raw body, five-minute window, constant-time comparison, atomic delivery-ID claim | Receipt storage must be durable and shared by API replicas |
| Manifest tampering or stale job | Ed25519 signature, expiry, future-time bound, policy digest, content digests | Signing-key compromise requires quarantine and rotation |
| Repository prompt injection changes policy | Repository text is delimited untrusted data; policy is externally signed; worker capabilities are fixed | Models can still propose unsafe patches; independent stages and checks remain mandatory |
| Secret enters context, logs, patch, or evidence | Detection/redaction at every boundary and digest-only findings | Detectors are incomplete; quarantine raw artifacts and revoke exposed secrets |
| Container reaches host or unauthorized network | Non-root, dropped capabilities, no-new-privileges, read-only root, limits, explicit volumes, no network, no Docker socket | Kernel/runtime flaws remain; patch and isolate worker nodes |
| Worker crash, expiry, cancellation, or orphan | Abort, attempt preservation, lease release, disposable cleanup | Unproven cleanup quarantines the node and blocks rescheduling |
| Author self-approves | Separate Developer, Critic, Security, and QA execution IDs; checks precede commit | Scheduler identity/model diversity is not cryptographically attested |

M3 grants no merge, release, production-repository, infrastructure, or deployment capability. The portal cannot directly invoke Forgejo or workers.
# M6 expertise-learning threats

- Retrieved expertise sources are hostile inputs. The quarantine boundary verifies the registered digest and rejects detected instruction injection, revoked/obsolete material and claim conflicts before package use; deterministic detection is defense in depth, not a complete content-safety scanner.
- Benchmark self-authorship, shared datasets and shared executions can manufacture competence. Promotion fails closed unless author/evaluator identities, dataset digests and execution identities are independent, and any critical regression blocks promotion.
- Specialist definitions carry personality and expertise references only. Tool, credential, network, budget, policy and gate authority remains a control-plane decision and cannot be emitted by the composer.
- Revocation and expiry can invalidate an in-flight decision. Routing must revalidate packages and claims at use time, invalidate dependants and retain the exact rollback target and evidence digest.
