import { z } from "zod";

export const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
export const findingSchema = z.object({
  schemaVersion: z.literal("finding.v1"), id: z.string().min(1),
  status: z.enum(["OPEN", "REPAIRING", "RESOLVED", "FALSE_POSITIVE", "BLOCKED"]),
  severity: z.enum(["critical", "high", "medium", "low"]), confidence: z.number().min(0).max(1),
  reproduction: z.object({ command: z.string().min(1), expected: z.string().min(1), observed: z.string().min(1), evidenceDigest: digestSchema }).strict(),
  affectedRequirement: z.string().min(1), rootCause: z.string().min(1), remediation: z.string().min(1),
  affectedVersions: z.array(z.string().min(1)).min(1), evidence: z.array(digestSchema).min(1),
  regressionGate: z.string().min(1).optional(), dispositionEvidence: digestSchema.optional(), validatedBy: z.string().optional(),
}).strict().superRefine((f, ctx) => {
  if (f.status === "RESOLVED" && !f.regressionGate) ctx.addIssue({ code: "custom", message: "resolution requires a passing regression gate" });
  if (f.status === "FALSE_POSITIVE" && (!f.dispositionEvidence || !f.validatedBy)) ctx.addIssue({ code: "custom", message: "false-positive requires evidence and independent validation" });
});
export type Finding = z.infer<typeof findingSchema>;

export type GateResult = { name: string; status: "PASS" | "FAIL" | "INCONCLUSIVE"; evidenceDigest?: string; commit: string; environmentDigest: string; artifactDigest: string; observedAt: string };
export type Actor = { role: "author" | "critic" | "security-reviewer" | "qa-verifier" | "release-judge"; executionId: string };
export type ReleasePolicy = { schemaVersion: "release-policy.v1"; version: string; mandatoryGates: string[]; blockingSeverities: string[]; maxEvidenceAgeSeconds: number; requiredRoles: Actor["role"][]; requireDistinctExecutions: boolean; falsePositiveRequiresIndependentValidation: boolean };
