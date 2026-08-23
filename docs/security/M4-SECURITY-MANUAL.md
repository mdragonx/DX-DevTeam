# M4 security manual

Security tools run in capability-scoped workers and emit immutable evidence, not verdict assertions. Secrets, SAST, SCA, license, IaC, image, SBOM, provenance, and DAST are mandatory in policy v1. Scanner outage, parse failure, database staleness, missing signatures, and digest mismatch are `INCONCLUSIVE` and block release.

Keep the Ed25519 release key in an external signer; rotate by publishing a new trusted public-key identifier while retaining old verification keys. Keep the trusted policy digest outside the repository. A false positive needs a structured reproduction/disposition record and validation by an execution distinct from the author. Never put secrets or raw exploitable payloads in finding evidence.
