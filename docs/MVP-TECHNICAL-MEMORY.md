# Autonomous Development Control Plane — MVP Technical Memory

## Status

Version: 0.1.0  
Date: 2026-08-22  
Scope: two-hour vertical-slice prototype

## Product intent

Create an autonomous software-delivery control plane that receives natural-language requirements, converts them into verifiable specifications, composes a specialist team, implements in isolation, challenges its own work, corrects defects, enforces release gates, and delivers evidence with every artifact.

The system must never equate an LLM assertion with proof. A delivery is successful only when the configured evidence gates pass. Inconclusive evidence produces a blocked result, not a release.

## MVP delivered

- Responsive web control-plane interface.
- Natural-language requirement intake.
- Interactive six-stage delivery simulation.
- Dynamic specialist-team representation.
- Adversarial review and automatic-correction timeline.
- Quality, security, documentation, and evidence indicators.
- Mobile and reduced-width layouts.
- Deployment-ready production build.

The current orchestration is intentionally simulated in the browser. No production repository, model, Docker, or infrastructure mutation is performed by this version.

## Target architecture

1. Web Portal: operator visibility, intake, configuration, audit, and evidence.
2. Control Plane API: identity, authorization, contracts, policy, and state.
3. Orchestrator: durable state machine, leases, retries, budgets, and compensation.
4. Agent Runtime: isolated task execution with capability-scoped credentials.
5. Agent Composer: creates and evaluates temporary or reusable specialists.
6. OmniRoute Adapter: logical model routes, telemetry, fallback, and cost control.
7. Forgejo Adapter: repositories, branches, commits, pull requests, issues, and releases.
8. Worker Plane: disposable build/test/security sandboxes.
9. Swarm Delivery Controller: declarative deployment, canary verification, and rollback.
10. Evidence Store: immutable, content-addressed evidence linked to exact artifacts.
11. Knowledge Registry: versioned expertise packages, sources, benchmarks, and expiry.

## Canonical workflow

`RECEIVED → SPECIFIED → DESIGNED → PLANNED → IMPLEMENTING → REVIEWING → TESTING → SECURITY_VALIDATION → RELEASE_CANDIDATE → DEPLOYING → VERIFYING → ACCEPTED`

Alternate terminal or recovery states: `NEEDS_REPAIR`, `BLOCKED_BY_SPECIFICATION`, `BLOCKED_BY_ENVIRONMENT`, `QUARANTINED`, `ROLLING_BACK`, `FAILED`.

Transitions require evidence and are append-only audit events. A worker cannot approve its own output.

## Initial integration contracts

### OmniRoute

- OpenAI-compatible HTTP transport.
- Logical routes: `requirements`, `architecture`, `code`, `critic`, `security`, `judge`, `fast`.
- Record requested route, effective provider/model, version, latency, token counts, fallback, cost, and response digest.
- Never persist provider credentials in project configuration or evidence.

### Forgejo

- Repository and issue operations through a dedicated service account.
- Temporary, task-scoped token where supported.
- Protected default branch; agents write only through branches and pull requests.
- Webhooks are authenticated, idempotent, and replay-protected.
- Every change links requirement, issue, commit, tests, artifact digest, deployment, and evidence.

### Docker Swarm

- Dedicated stack, overlay networks, secrets, service accounts, and persistent volumes.
- Desired state stored in Forgejo; Portainer is an operational view, not the source of truth.
- Workers have no unrestricted Docker socket access.
- Build and test jobs run with resource limits, dropped capabilities, read-only roots where possible, and explicit network policies.

## Mandatory gates

- Specification: requirements and machine-verifiable acceptance criteria exist.
- Architecture: decision records, data model, API contracts, and threat model are current.
- Quality: unit, integration, contract, end-to-end, regression, property, and mutation targets pass as applicable.
- Security: secrets, SAST, SCA, DAST, IaC, image, authorization, and abuse checks pass.
- Delivery: reproducible immutable artifact, SBOM, provenance, migration, backup, rollback, and canary evidence exist.
- Documentation: user, technical, operations, change, limitation, issue, security, and continuity information is current.
- Independence: author, critic, verifier, and release judge are separate executions; critical work uses model diversity where available.

## Safety and autonomy

Zero routine human interaction does not mean unlimited authority. Credentials are short-lived and scoped to tasks. Policies, budgets, network destinations, production gates, and kill mechanisms are external to agent personalities. A dynamically created specialist must pass a benchmark before receiving capabilities. High-risk ambiguity fails closed.

## Evidence model

Each evidence record contains: requirement ID, task ID, producing agent and version, effective model, tool and version, source commit, artifact digest, environment digest, timestamps, input/output digests, result, logs reference, and signature/attestation reference.

## Documentation definition of done

A change is incomplete if an unfamiliar engineer cannot understand, reproduce, operate, audit, troubleshoot, roll back, and continue it. Documentation drift is a release-blocking defect.

## Next implementation increment

1. Persist project, requirement, run, stage, agent, finding, gate, and evidence records.
2. Implement the durable orchestration state machine and worker lease protocol.
3. Add the OmniRoute adapter and structured-output validation.
4. Connect a non-production Forgejo repository.
5. Execute one sandboxed code-generation task with independent critic and verifier.
6. Store signed evidence and expose it in the portal.
7. Package the services as a dedicated Swarm stack.

## Known limitations

- The current UI run is a deterministic demonstration, not an actual LLM workflow.
- Data is not persisted.
- Forgejo, OmniRoute, Swarm, and Portainer are not connected.
- Authentication and role-based authorization are not implemented.
- No autonomous deployment or production mutation occurs.
- Metrics and evidence counts shown in the UI are representative fixtures.

These limitations are explicit release facts and must not be represented as completed capabilities.

