# M2 agent manuals

All definitions in `agents/v1` are immutable, least-privilege task contracts. PO normalizes requirements; Architect and Developer may produce plans but never code execution; Critic and QA independently challenge artifacts with reproducible counterexamples; Security assesses threats; Judge evaluates only the specification, artifact, and supplied evidence. Author and verifier executions must be distinct, and the runtime rejects a known matching model family. Agent text cannot grant tools, credentials, permissions, policy changes, or gate exceptions.

Operators promote a new definition by adding a new version, testing it against contract and injection suites, and changing route configuration outside source control. Never edit a released definition in place.
