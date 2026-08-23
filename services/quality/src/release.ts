import { createHash, sign, type KeyObject } from "node:crypto";
import { canonicalJson, evidenceDigest } from "../../../packages/evidence/src/index";
import type { Actor, Finding, GateResult, ReleasePolicy } from "./contracts";

export type RepairBudget = { attempts: number; tokens: number; milliseconds: number; computeUnits: number };
export type RepairAttempt = { patchDigest: string; score: number; tokens: number; milliseconds: number; computeUnits: number };
export function assessRepair(attempts: RepairAttempt[], budget: RepairBudget): "CONTINUE" | "BLOCKED" {
  const latest = attempts.at(-1);
  if (!latest) return "CONTINUE";
  const exhausted = attempts.length >= budget.attempts || attempts.reduce((n, a) => n + a.tokens, 0) > budget.tokens || attempts.reduce((n, a) => n + a.milliseconds, 0) > budget.milliseconds || attempts.reduce((n, a) => n + a.computeUnits, 0) > budget.computeUnits;
  const repeated = attempts.slice(0, -1).some((a) => a.patchDigest === latest.patchDigest);
  const noProgress = attempts.length > 1 && latest.score <= attempts.at(-2)!.score;
  return exhausted || repeated || noProgress ? "BLOCKED" : "CONTINUE";
}

export function decideRelease(input: { policy: ReleasePolicy; trustedPolicyDigest: string; commit: string; artifactDigest: string; sbomDigest: string; provenanceDigest: string; environmentDigest: string; gates: GateResult[]; findings: Finding[]; actors: Actor[]; now: Date }, privateKey: KeyObject) {
  const reasons: string[] = [];
  if (evidenceDigest(input.policy) !== input.trustedPolicyDigest) reasons.push("policy digest mismatch");
  for (const name of input.policy.mandatoryGates) {
    const gate = input.gates.find((g) => g.name === name);
    if (!gate || gate.status !== "PASS") reasons.push(`${name}: missing or not passing`);
    else if (!gate.evidenceDigest || gate.commit !== input.commit || gate.artifactDigest !== input.artifactDigest || gate.environmentDigest !== input.environmentDigest || input.now.getTime() - new Date(gate.observedAt).getTime() > input.policy.maxEvidenceAgeSeconds * 1000) reasons.push(`${name}: stale, mismatched, or unverifiable evidence`);
  }
  if (input.findings.some((f) => input.policy.blockingSeverities.includes(f.severity) && !["RESOLVED", "FALSE_POSITIVE"].includes(f.status))) reasons.push("unresolved blocking vulnerability");
  for (const role of input.policy.requiredRoles) if (!input.actors.some((a) => a.role === role)) reasons.push(`missing role: ${role}`);
  if (input.policy.requireDistinctExecutions && new Set(input.actors.map((a) => a.executionId)).size !== input.actors.length) reasons.push("review executions are not independent");
  const payload = { schemaVersion: "release-decision.v1", policyVersion: input.policy.version, policyDigest: input.trustedPolicyDigest, verdict: reasons.length ? "BLOCK" : "RELEASE", reasons, commit: input.commit, artifactDigest: input.artifactDigest, environmentDigest: input.environmentDigest, sbomDigest: input.sbomDigest, provenanceDigest: input.provenanceDigest, gateDigests: input.gates.map((g) => g.evidenceDigest), findingIds: input.findings.map((f) => f.id) };
  const signature = sign(null, Buffer.from(canonicalJson(payload)), privateKey).toString("base64");
  return { payload, signature, decisionDigest: `sha256:${createHash("sha256").update(canonicalJson(payload)).digest("hex")}` };
}
