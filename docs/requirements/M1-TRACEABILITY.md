# M1 durable control plane — requirements and evidence

Status: implemented production-oriented laboratory slice. Requirement IDs are `M1-AC-01` through `M1-AC-09` and correspond to the supplied acceptance criteria.

| ID | Acceptance criterion | Implementation evidence | Automated evidence |
|---|---|---|---|
| M1-AC-01 | One requirement per idempotency key | Transactional unique key and request-digest conflict check | `idempotent requirement and run creation…` |
| M1-AC-02 | Completion cannot advance twice | Lease token, locked run/stage, stage outcome and run version | `duplicate completion cannot advance twice…` |
| M1-AC-03 | Expired lease is reclaimable with history | Expiry record plus a new numbered attempt | `concurrent leasing…` |
| M1-AC-04 | Invalid transitions rejected and audited | Explicit transition map and committed rejection audit | `invalid transition fails closed…` |
| M1-AC-05 | Restart resumes incomplete run | PostgreSQL reconstruction and idempotent `resumeIncompleteRuns` | `orchestrator restart…` uses a reopened on-disk PostgreSQL-compatible database |
| M1-AC-06 | Portal shows persisted state | dashboard API proxy and `PersistedDashboard`; unavailable data never falls back to fixtures | production build and rendered HTML tests |
| M1-AC-07 | Forward/rollback migrations | paired `up.sql`/`down.sql` | `migration applies and rolls back` |
| M1-AC-08 | Unit/integration/concurrency/restart tests | contract, migration, transactional workflow and restart suite | `npm run test:m1` |
| M1-AC-09 | Required documentation | OpenAPI, data model, operations, threat model, changelog, limitations | documentation files in this change |

## Explicit exclusions

No LLM, Forgejo, Swarm, deployment, production credentials, unrestricted container capability, automatic specification, real critic, or release judgment is implemented. Authentication is a task-external bearer-token boundary; user/role identity is deferred and recorded as a limitation.
