# Codex prompt — M6 dynamic expertise and continuous learning

## Mission

Implement and validate the Agent Composer, versioned specialist registry and continuous expertise-learning lifecycle. A prompt saying “you are an expert” is not evidence of expertise.

## Preconditions

- Repository stabilization is green.
- Real OmniRoute, durable orchestration, evidence and isolated workers passed the laboratory integration gate.
- Test datasets contain no secrets, unlicensed material or production personal data.

## Required architecture

Implement:

- Capability Gap Detector.
- Agent Composer.
- Versioned Agent Definition and Expertise Package schemas.
- Source Registry with authority classification, provenance, retrieval time, validity interval, content digest, license and revocation.
- Knowledge ingestion quarantine that treats all retrieved content as untrusted.
- Curriculum and Benchmark Generator separated from the candidate agent.
- Independent Evaluator and Promotion Governor.
- Canary routing, performance monitoring, automatic demotion and rollback.
- Temporary, project and reusable specialist lifecycles.
- Expiration, revalidation and retirement.
- Cost, latency, accuracy, calibration, safety, regression and defect-escape metrics.

Separate personality, expertise and authority. No generated specialist may grant itself tools, credentials, network destinations, budgets, policies or gates.

## Learning modes

Support and distinguish:

1. Retrieval/knowledge package update.
2. Methodology and procedure update.
3. Memory from verified incidents and regressions.
4. Synthetic practice in isolation.
5. Optional fine-tuning dataset preparation, gated separately from model training.

Never claim base-model weight training unless a real supported training operation and resulting model identity are evidenced.

## Mandatory adversarial cases

- Prompt injection inside a source.
- Poisoned or conflicting sources.
- Obsolete regulation or methodology.
- Candidate generating its own passing benchmark.
- Benchmark leakage.
- Unsafe capability escalation.
- Lower accuracy with lower cost.
- Improved average score but critical-regression failure.
- Knowledge expiry during a run.
- Rollback after canary defect escape.
- Financial, mechanical and security specialist examples.

## Acceptance

- A missing expertise triggers a candidate specialist.
- The candidate cannot activate before independent benchmark evaluation.
- Author and evaluator datasets/executions are independent.
- Critical regressions block regardless of average score.
- Every learned claim has provenance, date and expiry.
- Source revocation invalidates affected packages and dependent decisions.
- Canary degradation demotes automatically to the exact prior version.
- The portal exposes version, evidence, limitations, status and rollback history.
- A full specialist creation, evaluation, promotion, canary failure and rollback is executed in the real laboratory.

Return `M6_GO` only with real laboratory evidence. Mocks satisfy unit coverage only.
