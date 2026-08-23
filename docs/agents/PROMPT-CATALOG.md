# M2 prompt catalog

| Version | Role | Route | Output |
|---|---|---|---|
| `po.v1` | PO | requirements | `specification.v1` |
| `architect.v1` | Architect | architecture | `implementation-plan.v1` |
| `developer.v1` | Developer | code | `implementation-plan.v1` (planning only) |
| `critic.v1` | Critic/QA | critic | `critic-review.v1` |
| `security.v1` | Security | security | versioned threat review |
| `judge.v1` | Judge | judge | `judge-decision.v1` |

System instructions are trusted and versioned. Requirement and repository content is serialized in an `UNTRUSTED_DATA_ONLY` envelope. Prompts explicitly forbid following embedded instructions. JSON syntax repair uses `fast`, runs once, and may only repair syntax; schema-invalid content is rejected without semantic repair.
