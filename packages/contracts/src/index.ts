import { z } from "zod";

export const CONTRACT_VERSION = "v1" as const;
export const idSchema = z.string().uuid();
export const idempotencyKeySchema = z.string().min(8).max(200).regex(/^[A-Za-z0-9._:-]+$/);
export const projectCreateSchema = z.object({ name: z.string().trim().min(1).max(120) }).strict();
export const requirementCreateSchema = z.object({
  statement: z.string().trim().min(10).max(10_000),
  acceptanceCriteria: z.array(z.string().trim().min(3).max(1_000)).min(1).max(100),
}).strict();
export const runCreateSchema = z.object({ requirementId: idSchema }).strict();

export const stageNames = ["RECEIVED", "SPECIFIED", "DESIGNED", "PLANNED", "IMPLEMENTING", "REVIEWING", "TESTING", "SECURITY_VALIDATION", "RELEASE_CANDIDATE"] as const;
export const stageNameSchema = z.enum(stageNames);
export type StageName = z.infer<typeof stageNameSchema>;
export const runStatuses = ["PENDING", "RUNNING", "BLOCKED", "COMPLETED", "FAILED"] as const;
export type RunStatus = (typeof runStatuses)[number];

export const leaseRequestSchema = z.object({ workerId: z.string().min(1).max(120), leaseSeconds: z.number().int().min(5).max(300) }).strict();
export const completeStageSchema = z.object({ workerId: z.string().min(1).max(120), leaseToken: idSchema, outcome: z.enum(["SUCCEEDED", "FAILED"]), evidenceDigest: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional() }).strict();

export type ApiSuccess<T> = { contractVersion: typeof CONTRACT_VERSION; data: T; requestId: string };
export type ApiFailure = { contractVersion: typeof CONTRACT_VERSION; error: { code: string; message: string; details?: unknown }; requestId: string };
export function success<T>(data: T, requestId: string): ApiSuccess<T> { return { contractVersion: CONTRACT_VERSION, data, requestId }; }
export function failure(code: string, message: string, requestId: string, details?: unknown): ApiFailure { return { contractVersion: CONTRACT_VERSION, error: { code, message, ...(details === undefined ? {} : { details }) }, requestId }; }

export const allowedTransitions: Readonly<Record<StageName, readonly StageName[]>> = {
  RECEIVED: ["SPECIFIED"], SPECIFIED: ["DESIGNED"], DESIGNED: ["PLANNED"], PLANNED: ["IMPLEMENTING"], IMPLEMENTING: ["REVIEWING"], REVIEWING: ["TESTING"], TESTING: ["SECURITY_VALIDATION"], SECURITY_VALIDATION: ["RELEASE_CANDIDATE"], RELEASE_CANDIDATE: [],
};
export function canTransition(from: StageName, to: StageName): boolean { return allowedTransitions[from].includes(to); }

export const modelRoutes = ["requirements", "architecture", "code", "critic", "security", "judge", "fast"] as const;
export const modelRouteSchema = z.enum(modelRoutes);
export type ModelRoute = z.infer<typeof modelRouteSchema>;

const criterionSchema = z.object({ id: z.string().regex(/^AC-[0-9]{2,3}$/), statement: z.string().min(3).max(1_000), verification: z.string().min(3).max(1_000) }).strict();
export const specificationV1Schema = z.object({
  schemaVersion: z.literal("specification.v1"), title: z.string().min(3).max(200),
  summary: z.string().min(10).max(4_000), assumptions: z.array(z.string().max(1_000)).max(30),
  acceptanceCriteria: z.array(criterionSchema).min(1).max(100), outOfScope: z.array(z.string().max(1_000)).max(30),
}).strict();
export type SpecificationV1 = z.infer<typeof specificationV1Schema>;

export const implementationPlanV1Schema = z.object({
  schemaVersion: z.literal("implementation-plan.v1"), architecture: z.string().min(10).max(5_000),
  decisions: z.array(z.object({ id: z.string().regex(/^DEC-[0-9]{2,3}$/), decision: z.string().min(3).max(1_000), rationale: z.string().min(3).max(1_000) }).strict()).min(1).max(50),
  tasks: z.array(z.object({ id: z.string().regex(/^TASK-[0-9]{2,3}$/), description: z.string().min(3).max(1_000), acceptanceCriteria: z.array(z.string().regex(/^AC-[0-9]{2,3}$/)).min(1), dependsOn: z.array(z.string().regex(/^TASK-[0-9]{2,3}$/)).max(20) }).strict()).min(1).max(100),
  risks: z.array(z.string().max(1_000)).max(50), rollback: z.string().min(3).max(2_000),
}).strict();
export type ImplementationPlanV1 = z.infer<typeof implementationPlanV1Schema>;

export const criticReviewV1Schema = z.object({
  schemaVersion: z.literal("critic-review.v1"), verdict: z.enum(["ACCEPT", "REJECT"]),
  findings: z.array(z.object({ id: z.string().regex(/^FIND-[0-9]{2,3}$/), target: z.string().min(1).max(200), issue: z.string().min(3).max(1_000), counterexample: z.object({ preconditions: z.array(z.string().max(500)).min(1), steps: z.array(z.string().max(500)).min(1), expected: z.string().min(1).max(500), observed: z.string().min(1).max(500) }).strict() }).strict()).max(50),
}).strict().superRefine((value, context) => { if (value.verdict === "REJECT" && value.findings.length === 0) context.addIssue({ code: "custom", message: "A rejection requires a reproducible counterexample" }); });
export type CriticReviewV1 = z.infer<typeof criticReviewV1Schema>;

export const judgeDecisionV1Schema = z.object({ schemaVersion: z.literal("judge-decision.v1"), verdict: z.enum(["PASS", "FAIL", "INCONCLUSIVE"]), evaluatedDigests: z.object({ specification: z.string().regex(/^sha256:[a-f0-9]{64}$/), artifact: z.string().regex(/^sha256:[a-f0-9]{64}$/), evidence: z.string().regex(/^sha256:[a-f0-9]{64}$/) }).strict(), reasons: z.array(z.string().min(1).max(1_000)).min(1).max(30) }).strict();
export type JudgeDecisionV1 = z.infer<typeof judgeDecisionV1Schema>;
