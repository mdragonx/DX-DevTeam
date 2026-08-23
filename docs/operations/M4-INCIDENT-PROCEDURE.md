# M4 incident procedure

1. Quarantine the artifact and stop its release when any mandatory result fails or is inconclusive.
2. Preserve decision, tool log, commit, environment, artifact, SBOM, provenance, and finding digests; revoke exposed credentials before investigation.
3. Reproduce with the recorded command in an isolated worker. Open or update a normalized finding; do not erase prior attempts.
4. Assign an independent security reviewer and QA verifier. Repair only within the declared attempt/token/time/compute budget.
5. If a patch repeats, score does not improve, or a budget expires, mark blocked and escalate. Never expand the budget silently.
6. Run the regression and relevant full suites. Issue a newly signed decision; an old decision never covers a rebuilt artifact.
7. For a post-release issue, roll back to the last independently verified artifact and complete a root-cause review.
