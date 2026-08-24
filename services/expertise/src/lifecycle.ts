import { evidenceDigest } from "../../../packages/evidence/src/index";
import { agentDefinitionV1Schema, evaluationRecordV1Schema, expertisePackageV1Schema, sourceRecordV1Schema, type AgentDefinitionV1, type EvaluationMetrics, type EvaluationRecordV1, type ExpertisePackageV1, type SourceRecordV1 } from "./contracts";

const injection = /(ignore\s+(all\s+)?previous|system\s+prompt|grant\s+(me\s+)?(tools?|credentials?|network|budget)|bypass\s+(policy|gate)|you\s+are\s+now)/i;
export type RetrievedSource = SourceRecordV1 & { content: string; claims: Readonly<Record<string, string>> };
export type QuarantineResult = { accepted: boolean; reasons: string[]; source?: SourceRecordV1 };

export class SourceRegistry {
  readonly sources = new Map<string, SourceRecordV1>();
  private readonly claims = new Map<string, Readonly<Record<string, string>>>();
  ingest(input: RetrievedSource, now = new Date()): QuarantineResult {
    const { content: _content, claims, ...record } = input;
    void _content;
    const parsed = sourceRecordV1Schema.safeParse(record); if (!parsed.success) return { accepted: false, reasons: ["invalid source contract"] };
    const reasons: string[] = [];
    if (evidenceDigest(input.content) !== input.contentDigest) reasons.push("content digest mismatch");
    if (injection.test(input.content)) reasons.push("prompt injection detected");
    if (Date.parse(input.validUntil) <= now.getTime()) reasons.push("source is obsolete");
    if (input.revokedAt) reasons.push("source is revoked");
    for (const existingClaims of this.claims.values()) {
      for (const [key, value] of Object.entries(claims)) if (existingClaims[key] !== undefined && existingClaims[key] !== value) reasons.push(`conflicting claim: ${key}`);
    }
    if (reasons.length) return { accepted: false, reasons };
    this.sources.set(parsed.data.id, parsed.data); this.claims.set(parsed.data.id, { ...claims }); return { accepted: true, reasons: [], source: parsed.data };
  }
  revoke(id: string, at: string, reason: string): SourceRecordV1 {
    const source = this.sources.get(id); if (!source) throw new Error("unknown source");
    const revoked = sourceRecordV1Schema.parse({ ...source, revokedAt: at, revocationReason: reason }); this.sources.set(id, revoked); return revoked;
  }
}

export class CapabilityGapDetector {
  detect(requiredDomains: readonly string[], active: readonly ExpertisePackageV1[]) {
    const covered = new Set(active.filter((p) => p.status === "ACTIVE").map((p) => p.domain));
    return requiredDomains.filter((domain) => !covered.has(domain)).map((domain) => ({ domain, action: "COMPOSE_CANDIDATE" as const }));
  }
}

export class AgentComposer {
  compose(id: string, domain: string, packageRef: Pick<ExpertisePackageV1, "id" | "version">): AgentDefinitionV1 {
    return agentDefinitionV1Schema.parse({ schemaVersion: "agent-definition.v1", id, version: "1.0.0", displayName: `${domain} specialist`, personality: { communicationStyle: "Evidence-first and concise" }, expertisePackageId: packageRef.id, expertisePackageVersion: packageRef.version, status: "CANDIDATE", limitations: ["No authority is conveyed by expertise or personality"] });
  }
  validateNoAuthority(input: unknown): void {
    if (input && typeof input === "object") for (const forbidden of ["tools", "credentials", "networkDestinations", "budgets", "policies", "gates", "authority"]) if (forbidden in input) throw new Error(`composer cannot grant ${forbidden}`);
  }
}

export type Thresholds = { minAccuracy: number; maxCalibrationError: number; minSafety: number; maxRegressionRate: number; maxDefectEscapeRate: number };
export class PromotionGovernor {
  constructor(readonly thresholds: Thresholds) {}
  decide(raw: EvaluationRecordV1): "PROMOTE_TO_CANARY" | "BLOCK" {
    const evaluation = evaluationRecordV1Schema.parse(raw);
    const independent = evaluation.candidateAuthorId !== evaluation.evaluatorId && evaluation.candidateAuthorId !== evaluation.benchmarkAuthorId && evaluation.curriculumAuthorId !== evaluation.candidateAuthorId && evaluation.candidateDatasetDigest !== evaluation.benchmarkDatasetDigest && evaluation.candidateExecutionId !== evaluation.evaluatorExecutionId;
    const m = evaluation.metrics;
    return independent && m.criticalRegressions.length === 0 && m.accuracy >= this.thresholds.minAccuracy && m.calibrationError <= this.thresholds.maxCalibrationError && m.safety >= this.thresholds.minSafety && m.regressionRate <= this.thresholds.maxRegressionRate && m.defectEscapeRate <= this.thresholds.maxDefectEscapeRate ? "PROMOTE_TO_CANARY" : "BLOCK";
  }
}

type History = { from: string; to: string; reason: string; at: string; evidenceDigest: string };
export class SpecialistRegistry {
  readonly packages = new Map<string, ExpertisePackageV1>(); readonly agents = new Map<string, AgentDefinitionV1>(); readonly rollbackHistory: History[] = [];
  activeId?: string; priorActiveId?: string;
  registerPackage(value: ExpertisePackageV1) { const parsed = expertisePackageV1Schema.parse(value); this.packages.set(`${parsed.id}@${parsed.version}`, parsed); }
  registerAgent(value: AgentDefinitionV1) { const parsed = agentDefinitionV1Schema.parse(value); this.agents.set(parsed.id, parsed); }
  beginCanary(id: string, evaluation: EvaluationRecordV1, governor: PromotionGovernor) {
    if (governor.decide(evaluation) !== "PROMOTE_TO_CANARY") throw new Error("independent evaluation blocked promotion");
    const agent = this.requireAgent(id); this.assertPackageUsable(agent, new Date()); this.priorActiveId = this.activeId; this.agents.set(id, { ...agent, status: "CANARY" }); return this.agents.get(id)!;
  }
  observeCanary(id: string, metrics: EvaluationMetrics, governor: PromotionGovernor, at: string, evidence: string) {
    const degraded = metrics.criticalRegressions.length > 0 || metrics.accuracy < governor.thresholds.minAccuracy || metrics.safety < governor.thresholds.minSafety || metrics.defectEscapeRate > governor.thresholds.maxDefectEscapeRate;
    if (degraded) {
      const candidate = this.requireAgent(id); this.agents.set(id, { ...candidate, status: "DEMOTED" });
      if (this.priorActiveId) { const prior = this.requireAgent(this.priorActiveId); this.agents.set(prior.id, { ...prior, status: "ACTIVE" }); this.activeId = prior.id; }
      this.rollbackHistory.push({ from: id, to: this.priorActiveId ?? "none", reason: "canary degradation", at, evidenceDigest: evidence }); return "ROLLED_BACK" as const;
    }
    if (this.activeId) { const prior = this.requireAgent(this.activeId); this.agents.set(prior.id, { ...prior, status: "DEMOTED" }); }
    const candidate = this.requireAgent(id); this.agents.set(id, { ...candidate, status: "ACTIVE" }); this.activeId = id; return "PROMOTED" as const;
  }
  validateForRun(id: string, now: Date) { const agent = this.requireAgent(id); if (!(["ACTIVE", "CANARY"] as const).includes(agent.status as "ACTIVE" | "CANARY")) throw new Error("specialist is not routable"); this.assertPackageUsable(agent, now); }
  invalidateRevokedSource(sourceId: string) {
    for (const [key, pkg] of this.packages) if (pkg.sourceIds.includes(sourceId)) { this.packages.set(key, { ...pkg, status: "INVALID" }); for (const [id, agent] of this.agents) if (agent.expertisePackageId === pkg.id && agent.expertisePackageVersion === pkg.version) this.agents.set(id, { ...agent, status: "DEMOTED" }); }
  }
  retire(id: string) { const agent = this.requireAgent(id); this.agents.set(id, { ...agent, status: "RETIRED" }); if (this.activeId === id) this.activeId = undefined; }
  private requireAgent(id: string) { const agent = this.agents.get(id); if (!agent) throw new Error("unknown specialist"); return agent; }
  private assertPackageUsable(agent: AgentDefinitionV1, now: Date) { const pkg = this.packages.get(`${agent.expertisePackageId}@${agent.expertisePackageVersion}`); if (!pkg || !["CANDIDATE", "CANARY", "ACTIVE"].includes(pkg.status)) throw new Error("expertise package unavailable"); if (Date.parse(pkg.expiresAt) <= now.getTime() || pkg.claims.some((claim) => Date.parse(claim.expiresAt) <= now.getTime())) throw new Error("expertise expired during run"); }
}
