import { z } from "zod";

export const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
export const isoDateSchema = z.string().datetime({ offset: true });

export const sourceRecordV1Schema = z.object({
  schemaVersion: z.literal("source-record.v1"),
  id: z.string().min(1).max(160),
  authority: z.enum(["PRIMARY", "REGULATOR", "STANDARDS_BODY", "PEER_REVIEWED", "VENDOR", "COMMUNITY", "SYNTHETIC"]),
  provenance: z.string().url(),
  retrievedAt: isoDateSchema,
  validFrom: isoDateSchema,
  validUntil: isoDateSchema,
  contentDigest: digestSchema,
  license: z.string().min(1).max(160),
  revokedAt: isoDateSchema.optional(),
  revocationReason: z.string().min(1).max(500).optional(),
}).strict().superRefine((value, context) => {
  if (Date.parse(value.validUntil) <= Date.parse(value.validFrom)) context.addIssue({ code: "custom", message: "validUntil must follow validFrom" });
  if ((value.revokedAt === undefined) !== (value.revocationReason === undefined)) context.addIssue({ code: "custom", message: "revocation date and reason are required together" });
});
export type SourceRecordV1 = z.infer<typeof sourceRecordV1Schema>;

export const learnedClaimV1Schema = z.object({
  id: z.string().min(1).max(160), claim: z.string().min(1).max(4_000), sourceIds: z.array(z.string().min(1)).min(1),
  learnedAt: isoDateSchema, expiresAt: isoDateSchema,
}).strict().refine((value) => Date.parse(value.expiresAt) > Date.parse(value.learnedAt), "claim expiry must follow learning date");

export const learningModes = ["RETRIEVAL_UPDATE", "METHODOLOGY_UPDATE", "VERIFIED_INCIDENT_MEMORY", "ISOLATED_SYNTHETIC_PRACTICE", "FINE_TUNING_DATASET_PREPARATION"] as const;
export const expertisePackageV1Schema = z.object({
  schemaVersion: z.literal("expertise-package.v1"), id: z.string().min(1), version: z.string().regex(/^\d+\.\d+\.\d+$/),
  domain: z.string().min(2).max(160), mode: z.enum(learningModes), lifecycle: z.enum(["TEMPORARY", "PROJECT", "REUSABLE"]),
  createdAt: isoDateSchema, expiresAt: isoDateSchema, sourceIds: z.array(z.string().min(1)).min(1), claims: z.array(learnedClaimV1Schema).min(1),
  methodologyDigest: digestSchema.optional(), limitations: z.array(z.string().min(1).max(1_000)).min(1), status: z.enum(["QUARANTINED", "CANDIDATE", "CANARY", "ACTIVE", "INVALID", "EXPIRED", "RETIRED"]),
  modelIdentity: z.string().min(1).optional(), trainingOperationEvidenceDigest: digestSchema.optional(),
}).strict().superRefine((value, context) => {
  if (Date.parse(value.expiresAt) <= Date.parse(value.createdAt)) context.addIssue({ code: "custom", message: "package expiry must follow creation" });
  if (value.mode === "FINE_TUNING_DATASET_PREPARATION" && (value.modelIdentity || value.trainingOperationEvidenceDigest)) context.addIssue({ code: "custom", message: "dataset preparation is not model training" });
  for (const claim of value.claims) if (Date.parse(claim.expiresAt) > Date.parse(value.expiresAt)) context.addIssue({ code: "custom", message: "claim cannot outlive package" });
});
export type ExpertisePackageV1 = z.infer<typeof expertisePackageV1Schema>;

export const agentDefinitionV1Schema = z.object({
  schemaVersion: z.literal("agent-definition.v1"), id: z.string().min(1), version: z.string().regex(/^\d+\.\d+\.\d+$/),
  displayName: z.string().min(1).max(160), personality: z.object({ communicationStyle: z.string().min(1).max(500) }).strict(),
  expertisePackageId: z.string().min(1), expertisePackageVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  status: z.enum(["CANDIDATE", "CANARY", "ACTIVE", "DEMOTED", "EXPIRED", "RETIRED"]), limitations: z.array(z.string().min(1)).min(1),
}).strict();
export type AgentDefinitionV1 = z.infer<typeof agentDefinitionV1Schema>;

export const evaluationMetricsSchema = z.object({
  cost: z.number().nonnegative(), latencyMs: z.number().nonnegative(), accuracy: z.number().min(0).max(1), calibrationError: z.number().min(0).max(1),
  safety: z.number().min(0).max(1), regressionRate: z.number().min(0).max(1), defectEscapeRate: z.number().min(0).max(1), criticalRegressions: z.array(z.string()),
}).strict();
export type EvaluationMetrics = z.infer<typeof evaluationMetricsSchema>;

export const evaluationRecordV1Schema = z.object({
  schemaVersion: z.literal("evaluation-record.v1"), candidateId: z.string().min(1), evaluatorId: z.string().min(1), candidateAuthorId: z.string().min(1),
  curriculumAuthorId: z.string().min(1), benchmarkAuthorId: z.string().min(1), candidateDatasetDigest: digestSchema, benchmarkDatasetDigest: digestSchema,
  candidateExecutionId: z.string().min(1), evaluatorExecutionId: z.string().min(1), metrics: evaluationMetricsSchema, evidenceDigest: digestSchema,
}).strict();
export type EvaluationRecordV1 = z.infer<typeof evaluationRecordV1Schema>;
