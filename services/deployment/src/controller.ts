import { evidenceDigest } from "../../../packages/evidence/src/index";
import { SwarmDeploymentAdapter, type ServiceSpec } from "./adapter";

type Digest = `sha256:${string}`;
export type ReleaseInputs = Readonly<{
  releaseDecision: "RELEASE";
  releaseDecisionDigest: Digest;
  environment: string;
  stack: string;
  commit: string;
  serviceSpec: ServiceSpec;
  sbomDigest: Digest;
  provenanceDigest: Digest;
  vulnerabilityResultDigest: Digest;
  migrationPlanDigest: Digest;
  backupResultDigest: Digest;
  rollbackPlanDigest: Digest;
  priorServiceSpec: ServiceSpec;
}>;
export type Verification = Readonly<{ healthy: boolean; functionalProbePassed: boolean; candidateErrorRate: number; baselineErrorRate: number; maxErrorRateIncrease: number; metricsDigest: Digest }>;
export type DeploymentRecord = { id: string; inputDigest: string; phase: "APPROVED" | "CANARY" | "PROMOTED" | "ROLLED_BACK" | "CANCELLED"; startedAt: string; completedAt?: string; verification?: Verification; exactServiceSpec: ServiceSpec; priorServiceSpec: ServiceSpec; exactSpecDigest: string; priorSpecDigest: string; events: { at: string; action: string; evidenceDigest: string }[] };

export interface DeploymentStore {
  get(id: string): Promise<DeploymentRecord | undefined>;
  create(record: DeploymentRecord): Promise<DeploymentRecord>;
  update(record: DeploymentRecord): Promise<void>;
}

export interface DatabaseSafety {
  validateRestore(backupResultDigest: Digest): Promise<boolean>;
  migrateForward(planDigest: Digest): Promise<boolean>;
  migrateBackward(planDigest: Digest): Promise<boolean>;
  restoreKnownGood(backupResultDigest: Digest): Promise<void>;
}

const requiredDigest = (value: string, label: string) => { if (!/^sha256:[a-f0-9]{64}$/.test(value)) throw new Error(`${label} must be content-addressed`); };

export class DeploymentController {
  constructor(private readonly adapter: SwarmDeploymentAdapter, private readonly store: DeploymentStore, private readonly database: DatabaseSafety, private readonly now = () => new Date()) {}

  async deploy(id: string, input: ReleaseInputs): Promise<DeploymentRecord> {
    for (const [label, digest] of Object.entries({ releaseDecision: input.releaseDecisionDigest, sbom: input.sbomDigest, provenance: input.provenanceDigest, vulnerability: input.vulnerabilityResultDigest, migrationPlan: input.migrationPlanDigest, backup: input.backupResultDigest, rollbackPlan: input.rollbackPlanDigest })) requiredDigest(digest, label);
    const inputDigest = evidenceDigest(input);
    const existing = await this.store.get(id);
    if (existing) {
      if (existing.inputDigest !== inputDigest) throw new Error("Deployment id is already bound to different immutable inputs");
      if (existing.phase !== "APPROVED") return existing;
    }
    const startedAt = existing?.startedAt ?? this.now().toISOString();
    const proposed: DeploymentRecord = { id, inputDigest, phase: "APPROVED", startedAt, exactServiceSpec: input.serviceSpec, priorServiceSpec: input.priorServiceSpec, exactSpecDigest: evidenceDigest(input.serviceSpec), priorSpecDigest: evidenceDigest(input.priorServiceSpec), events: [] };
    const record = existing ?? await this.store.create(proposed);
    if (record.inputDigest !== inputDigest) throw new Error("Deployment id is already bound to different immutable inputs");
    if (record.phase !== "APPROVED") return record;
    if (!await this.database.validateRestore(input.backupResultDigest)) throw new Error("Backup restoration validation failed");
    if (!await this.database.migrateForward(input.migrationPlanDigest) || !await this.database.migrateBackward(input.migrationPlanDigest)) {
      await this.database.restoreKnownGood(input.backupResultDigest);
      await this.rollback(record, input, "migration-validation-failed");
      return record;
    }
    await this.adapter.apply(input.environment, input.stack, "DEPLOY_CANARY", input.serviceSpec, `${id}:canary`);
    record.phase = "CANARY";
    this.event(record, "canary-applied", evidenceDigest({ spec: input.serviceSpec, startedAt }));
    await this.store.update(record);
    return record;
  }

  async verify(id: string, input: ReleaseInputs, verification: Verification): Promise<DeploymentRecord> {
    const record = await this.requireMatching(id, input);
    if (record.phase !== "CANARY") return record;
    requiredDigest(verification.metricsDigest, "metrics");
    record.verification = verification;
    const passes = verification.healthy && verification.functionalProbePassed && verification.candidateErrorRate <= verification.baselineErrorRate + verification.maxErrorRateIncrease;
    if (!passes) {
      await this.rollback(record, input, "canary-verification-failed");
      return record;
    }
    await this.adapter.apply(input.environment, input.stack, "PROMOTE", input.serviceSpec, `${id}:promote`);
    record.phase = "PROMOTED"; record.completedAt = this.now().toISOString();
    this.event(record, "promoted", evidenceDigest(verification));
    await this.store.update(record);
    return record;
  }

  async cancel(id: string, input: ReleaseInputs): Promise<DeploymentRecord> {
    const record = await this.requireMatching(id, input);
    if (record.phase === "CANARY") await this.adapter.cancel(input.environment, input.stack, `${id}:cancel`);
    if (record.phase !== "PROMOTED" && record.phase !== "ROLLED_BACK") { record.phase = "CANCELLED"; record.completedAt = this.now().toISOString(); this.event(record, "cancelled", evidenceDigest({ id })); await this.store.update(record); }
    return record;
  }

  private async rollback(record: DeploymentRecord, input: ReleaseInputs, reason: string) {
    await this.adapter.apply(input.environment, input.stack, "ROLLBACK", input.priorServiceSpec, `${record.id}:rollback`);
    record.phase = "ROLLED_BACK"; record.completedAt = this.now().toISOString();
    this.event(record, reason, evidenceDigest({ reason, exactPriorSpec: input.priorServiceSpec }));
    await this.store.update(record);
  }
  private async requireMatching(id: string, input: ReleaseInputs) { const record = await this.store.get(id); if (!record || record.inputDigest !== evidenceDigest(input)) throw new Error("Unknown deployment or immutable input mismatch"); return record; }
  private event(record: DeploymentRecord, action: string, digest: string) { record.events.push({ at: this.now().toISOString(), action, evidenceDigest: digest }); }
}

export class InMemoryDeploymentStore implements DeploymentStore {
  readonly records = new Map<string, DeploymentRecord>();
  async get(id: string) { return this.records.get(id); }
  async create(record: DeploymentRecord) { if (this.records.has(record.id)) return this.records.get(record.id)!; this.records.set(record.id, record); return record; }
  async update(record: DeploymentRecord) { this.records.set(record.id, record); }
}
