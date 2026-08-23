# DX-DevTeam agent instructions

## Mission

Build an evidence-driven autonomous software delivery control plane. The system receives requirements, creates verifiable specifications, composes qualified specialist agents, develops in isolated workers, criticizes and corrects its own work, applies deterministic quality and security gates, and produces a traceable delivery package.

## Non-negotiable principles

1. Evidence over assertion. Never declare success from an LLM opinion.
2. Fail closed. Inconclusive or missing evidence blocks delivery.
3. Contract first. Normalize requirements and acceptance criteria before design or code.
4. Independent verification. The author cannot approve its own output.
5. Least privilege. Agent personality never controls authorization.
6. Immutable traceability. Link requirement, decision, change, test, artifact, deployment, and evidence.
7. Documentation is part of the product. Documentation drift is release-blocking.
8. Reversible delivery. Every production mutation needs verification and rollback.
9. No hidden assumptions. Record assumptions, uncertainty, and limitations.
10. Keep DX-DevTeam independent from DragonX-Enterprise.

## Working method

Before coding:

- Read the relevant product, architecture, security, and roadmap documents.
- State the requirement IDs and acceptance criteria being implemented.
- Inspect the existing implementation and tests.
- Identify security and operational consequences.
- Prefer the smallest coherent vertical slice.

For every change:

- Work on a dedicated branch.
- Add or update automated tests.
- Update affected documentation, diagrams, contracts, changelog, and known limitations.
- Run the complete relevant validation suite.
- Record remaining risks honestly.
- Do not bypass a failed gate to meet a time target.

## Definition of done

A change is done only when it is understandable, reproducible, testable, secure, operable, auditable, reversible, and continuable by an engineer unfamiliar with the implementation.

## Architecture boundaries

- Web Portal must not directly execute infrastructure actions.
- Control Plane API owns authentication, authorization, policy, and state transitions.
- Orchestrator uses durable, idempotent workflows and explicit compensation.
- Workers are disposable and capability-scoped.
- OmniRoute is accessed only through its adapter.
- Forgejo and deployment systems are accessed only through adapters.
- Evidence is content-addressed and references exact commits and artifact digests.
- Agent definitions, expertise packages, prompts, policies, and evaluations are versioned.

