# M4 audit guide

Verify the policy bytes against the externally trusted digest, then verify the release-decision signature. Confirm all required roles have distinct execution IDs. Follow the decision's commit, artifact and environment digests to the SBOM, provenance, tests, tool results, and finding records. Each gate must be passing, fresh, content-addressed, and matched to the same subject.

For every resolved finding, inspect the original reproduction, immutable attempts, root cause, remediation, regression gate, and relevant suite. For every false positive, inspect disposition evidence and independent validation. Any broken link, missing input, stale result, unverifiable signature, or unresolved high/critical item is an audit failure and release block.
