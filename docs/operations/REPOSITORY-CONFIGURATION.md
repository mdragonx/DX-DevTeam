# Repository configuration checklist

This is an **E0 desired-state checklist, not proof of enabled GitHub settings**. Record observations below using GitHub settings/API output tied to the repository and final commit; absent observation fails closed.

## Required configuration

- Protect `main`; prohibit force pushes and deletion.
- Require a pull request and at least one approving review from someone other than the author; dismiss stale approvals and require conversation resolution.
- Require branches to be current and require every job from `continuously-verified-baseline` and `security-and-supply-chain`.
- Restrict bypass, direct push, and workflow permission to least privilege.
- Retain baseline evidence for at least 30 days and security/SBOM evidence for at least 90 days.
- Require signed immutable release artifacts, SBOM, provenance, and scans for release candidates.

## Observed configuration

**Status: BLOCKED / NOT OBSERVED (2026-08-23).** This checkout contains no authenticated GitHub credentials and its remote repository is not publicly readable. Required evidence: authenticated ruleset or branch-protection API output, successful required jobs on the exact final commit, attached scan/SBOM/provenance artifacts, all PR 1/4 P0/P1 conversations resolved, and an independent approving review. Do not merge until those records are captured.
