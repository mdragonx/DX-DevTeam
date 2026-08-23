# Release quality policy

The authoritative, versioned machine policy is `policies/release/v1.json`. Production must pin its content digest in a separately administered policy authority. All listed quality gates (unit, integration, contract, end-to-end, property, mutation, concurrency, fault injection, recovery) and security gates (secrets, SAST, SCA, license, IaC, image, SBOM, provenance, DAST) are mandatory. “Not applicable” requires a new policy version approved outside an agent execution; a missing or inconclusive result is not a pass.

Evidence must match the exact commit, artifact and build environment, remain within its freshness window, and have a content digest. High/critical unresolved findings block. Closing a correction requires its regression gate and relevant suite. The judge cannot waive policy.
