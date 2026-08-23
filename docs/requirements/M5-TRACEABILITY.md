# M5 Docker Swarm delivery traceability

## Contract and acceptance criteria

- **M5-REQ-01 / AC-1:** the deployment adapter permits only policy-allowlisted environment, stack, and operation tuples and rejects mutable image references.
- **M5-REQ-02 / AC-2:** Swarm secrets are external references; adapters accept structured arguments and evidence contains only content digests, never secret material.
- **M5-REQ-03 / AC-3:** health, functional, or SLO failure invokes an idempotent rollback using the exact recorded prior service specification.
- **M5-REQ-04 / AC-4:** a durable deployment ID binds immutable inputs; replay after controller restart returns the recorded phase and stable side-effect keys prevent duplicate canary or promotion.
- **M5-REQ-05 / AC-5:** backup restore plus forward and backward migration are validated before canary; migration failure restores the known-good backup and rolls back.
- **M5-REQ-06 / AC-6:** Forgejo's reviewed stack is canonical. Inspection reports the digest of runtime drift; Portainer has no write path in the controller.
- **M5-REQ-07 / AC-7:** the disaster-recovery procedure reconstructs the laboratory control plane solely from repository state, immutable images, external secrets/configs, database backup, and evidence.
- **M5-REQ-08 / AC-8:** the M5 operations and security manuals cover deployment, rollback, backup, restore, security, and troubleshooting.

## Release prerequisites and evidence

M4's signed decision must be `RELEASE`. M5 additionally requires content-addressed SBOM, provenance, vulnerability result, migration plan, successfully tested backup, and rollback plan. The deployment record binds those inputs to the commit, exact candidate and prior service specs, image and configuration digests, timestamps, probe/SLO metrics, verification decision, and transition evidence. Missing or malformed evidence fails before mutation.

`tests/m5/swarm-delivery.test.ts` is the executable acceptance contract. Real cluster, registry, database, monitoring, Forgejo protection, and disaster-recovery drills remain mandatory environment gates; unit tests do not constitute laboratory approval.

## Security and operational consequences

The adapter owns authorization rather than the portal. The Docker socket and Portainer API are not exposed to workers. Secret values are provisioned out of band and referenced by versioned Swarm names. Operators must treat service inspection output and probe bodies as potentially sensitive and retain only redacted logs plus content-addressed evidence. Production is absent from the policy and is therefore unreachable.
