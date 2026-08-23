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
