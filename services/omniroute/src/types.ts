import type { ModelRoute } from "../../../packages/contracts/src/index";

export type ModelMessage = { role: "system" | "user"; content: string };
export type ModelRequest = { route: ModelRoute; messages: ModelMessage[]; responseSchema: string; timeoutMs: number; idempotencyKey: string; signal?: AbortSignal };
export type ModelResponse = { content: string; model: string; provider?: string; modelFamily?: string; usage?: { inputTokens: number; outputTokens: number; costUsd?: number }; fallback?: boolean };
export interface ModelProvider { complete(request: ModelRequest): Promise<ModelResponse> }
export type RetryClass = "RATE_LIMIT" | "TIMEOUT" | "TRANSIENT" | "PERMANENT";
export class ModelCallError extends Error { constructor(public readonly code: RetryClass | "BUDGET_EXHAUSTED" | "CIRCUIT_OPEN" | "CANCELLED" | "INVALID_OUTPUT" | "VERIFIER_NOT_INDEPENDENT", message: string, public readonly retryAfterMs?: number) { super(message); } }
export type ModelTelemetry = { idempotencyKey: string; requestedRoute: ModelRoute; effectiveModel: string; effectiveProvider?: string; latencyMs: number; inputTokens?: number; outputTokens?: number; costUsd?: number; fallback: boolean; promptVersion: string; inputDigest: string; outputDigest?: string; result: "SUCCEEDED" | "FAILED"; errorCode?: string };
export interface TelemetrySink { record(event: ModelTelemetry): Promise<void> }
export type TaskBudget = { maxCalls: number; maxTokens: number; maxCostUsd?: number; deadline: Date };
