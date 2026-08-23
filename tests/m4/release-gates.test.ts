import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, verify } from "node:crypto";
import test from "node:test";
import { evidenceDigest, canonicalJson } from "../../packages/evidence/src/index";
import { findingSchema, type Actor, type GateResult, type ReleasePolicy } from "../../services/quality/src/contracts";
import { assessRepair, decideRelease } from "../../services/quality/src/release";

const policy = JSON.parse(readFileSync("policies/release/v1.json", "utf8")) as ReleasePolicy;
const policyDigest = evidenceDigest(policy);
const commit = "a".repeat(40), artifactDigest = evidenceDigest("artifact"), environmentDigest = evidenceDigest("environment");
const now = new Date("2026-08-23T12:00:00Z");
const gates = policy.mandatoryGates.map((name): GateResult => ({ name, status: "PASS", evidenceDigest: evidenceDigest(name), commit, artifactDigest, environmentDigest, observedAt: now.toISOString() }));
const actors: Actor[] = policy.requiredRoles.map((role, index) => ({ role, executionId: `execution-${index}` }));
const keys = generateKeyPairSync("ed25519");
const decide = (overrides = {}) => decideRelease({ policy, trustedPolicyDigest: policyDigest, commit, artifactDigest, environmentDigest, sbomDigest: evidenceDigest("sbom"), provenanceDigest: evidenceDigest("provenance"), gates, findings: [], actors, now, ...overrides }, keys.privateKey);

test("normalized findings require reproduction and regression evidence before closure", () => {
  const base = { schemaVersion: "finding.v1", id: "FIND-01", severity: "high", confidence: .99, reproduction: { command: "node --test regression.test.ts", expected: "authorization denied", observed: "authorization allowed", evidenceDigest: evidenceDigest("failure") }, affectedRequirement: "M4-AC-1", rootCause: "missing ownership check", remediation: "enforce ownership", affectedVersions: ["0.3.0"], evidence: [evidenceDigest("tool-log")] };
  assert.equal(findingSchema.safeParse({ ...base, status: "RESOLVED" }).success, false);
  assert.equal(findingSchema.safeParse({ ...base, status: "RESOLVED", regressionGate: "integration: PASS" }).success, true);
  assert.equal(findingSchema.safeParse({ ...base, status: "FALSE_POSITIVE" }).success, false);
  assert.equal(findingSchema.safeParse({ ...base, status: "FALSE_POSITIVE", dispositionEvidence: evidenceDigest("analysis"), validatedBy: "independent-security-run" }).success, true);
});

test("bounded repair blocks repeated, non-improving, and over-budget patches", () => {
  const budget = { attempts: 3, tokens: 100, milliseconds: 1000, computeUnits: 10 };
  assert.equal(assessRepair([{ patchDigest: "p1", score: 1, tokens: 10, milliseconds: 10, computeUnits: 1 }], budget), "CONTINUE");
  assert.equal(assessRepair([{ patchDigest: "p1", score: 1, tokens: 10, milliseconds: 10, computeUnits: 1 }, { patchDigest: "p1", score: 2, tokens: 10, milliseconds: 10, computeUnits: 1 }], budget), "BLOCKED");
  assert.equal(assessRepair([{ patchDigest: "p1", score: 2, tokens: 10, milliseconds: 10, computeUnits: 1 }, { patchDigest: "p2", score: 2, tokens: 10, milliseconds: 10, computeUnits: 1 }], budget), "BLOCKED");
  assert.equal(assessRepair([{ patchDigest: "p1", score: 1, tokens: 101, milliseconds: 10, computeUnits: 1 }], budget), "BLOCKED");
});

test("unit integration contract end-to-end property mutation concurrency fault and recovery evidence is mandatory", () => {
  for (const missing of policy.mandatoryGates) assert.equal(decide({ gates: gates.filter((g) => g.name !== missing) }).payload.verdict, "BLOCK");
  assert.equal(decide().payload.verdict, "RELEASE");
});

test("security defects, inconclusive tools, stale and mismatched evidence block", () => {
  const finding = findingSchema.parse({ schemaVersion: "finding.v1", id: "CVE-SEED", status: "OPEN", severity: "critical", confidence: 1, reproduction: { command: "scanner --fixture vulnerable", expected: "critical finding", observed: "critical finding", evidenceDigest: evidenceDigest("scan") }, affectedRequirement: "M4-AC-4", rootCause: "seeded vulnerable dependency", remediation: "upgrade dependency", affectedVersions: ["0.3.0"], evidence: [evidenceDigest("scan")] });
  assert.equal(decide({ findings: [finding] }).payload.verdict, "BLOCK");
  assert.equal(decide({ gates: gates.map((g, i) => i ? g : { ...g, status: "INCONCLUSIVE" as const }) }).payload.verdict, "BLOCK");
  assert.equal(decide({ gates: gates.map((g, i) => i ? g : { ...g, commit: "b".repeat(40) }) }).payload.verdict, "BLOCK");
  assert.equal(decide({ now: new Date(now.getTime() + 3_700_000) }).payload.verdict, "BLOCK");
});

test("external policy cannot be weakened and independent roles cannot overlap", () => {
  assert.equal(decide({ policy: { ...policy, mandatoryGates: [] } }).payload.verdict, "BLOCK");
  assert.equal(decide({ actors: actors.map((a) => ({ ...a, executionId: "same" })) }).payload.verdict, "BLOCK");
});

test("deterministic release decision is signed and binds traceability", () => {
  const decision = decide();
  assert.equal(verify(null, Buffer.from(canonicalJson(decision.payload)), keys.publicKey, Buffer.from(decision.signature, "base64")), true);
  assert.equal(decision.payload.commit, commit); assert.equal(decision.payload.sbomDigest, evidenceDigest("sbom"));
});
