# Codex execution order

Use these prompts sequentially. Do not start the next prompt until the previous pull request is merged and its exit evidence is present on `main`.

1. `06-P0-REPOSITORY-STABILIZATION.md`
2. `08-REAL-INTEGRATION-LAB.md`
3. `07-M6-EXPERTISE-LEARNING.md`
4. `09-PRODUCTION-ACCEPTANCE.md`

Every session must first read:

- `AGENTS.md`
- `docs/PRODUCTION-READINESS-GATES.md`
- `docs/KNOWN-LIMITATIONS.md`
- the selected prompt

Mocks may support tests, but never satisfy integration, release-candidate or production exit criteria.
