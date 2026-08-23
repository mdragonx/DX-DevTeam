import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { evidenceDigest } from "../../packages/evidence/src/index";
import { SwarmDeploymentAdapter, type ServiceSpec, type SwarmTransport } from "../../services/deployment/src/adapter";
import { DeploymentController, InMemoryDeploymentStore, type DatabaseSafety, type ReleaseInputs } from "../../services/deployment/src/controller";

const digest = (value: unknown) => evidenceDigest(value) as `sha256:${string}`;
const candidate: ServiceSpec = { name: "api", image: `registry.invalid/api@${digest("candidate")}`, configurationDigests: [digest("config")], replicas: 2 };
const prior: ServiceSpec = { name: "api", image: `registry.invalid/api@${digest("prior")}`, configurationDigests: [digest("old-config")], replicas: 2 };
const input: ReleaseInputs = { releaseDecision: "RELEASE", releaseDecisionDigest: digest("signed-release-decision"), environment: "laboratory", stack: "dx-control-plane-lab", commit: "a".repeat(40), serviceSpec: candidate, priorServiceSpec: prior, sbomDigest: digest("sbom"), provenanceDigest: digest("provenance"), vulnerabilityResultDigest: digest("vulnerability"), migrationPlanDigest: digest("migration"), backupResultDigest: digest("backup"), rollbackPlanDigest: digest("rollback") };

class FakeTransport implements SwarmTransport {
  calls: { action: string; spec?: ServiceSpec; key: string }[] = []; current: readonly ServiceSpec[] = [prior];
  async apply(_stack: string, spec: ServiceSpec, mode: "canary" | "promoted", key: string) { if (!this.calls.some((c) => c.key === key)) this.calls.push({ action: mode, spec, key }); this.current = [spec]; }
  async removeCanary(_stack: string, key: string) { if (!this.calls.some((c) => c.key === key)) this.calls.push({ action: "cancel", key }); }
  async inspect() { return this.current; }
}
class FakeDatabase implements DatabaseSafety {
  restored = 0; constructor(readonly forward = true, readonly backward = true, readonly backup = true) {}
  async validateRestore() { return this.backup; } async migrateForward() { return this.forward; } async migrateBackward() { return this.backward; } async restoreKnownGood() { this.restored++; }
}
const setup = (db = new FakeDatabase()) => { const transport = new FakeTransport(); const policy = JSON.parse(readFileSync("policies/deployment/laboratory.v1.json", "utf8")); const adapter = new SwarmDeploymentAdapter(policy, transport); const store = new InMemoryDeploymentStore(); return { transport, adapter, store, db, controller: new DeploymentController(adapter, store, db, () => new Date("2026-08-23T12:00:00Z")) }; };
const passing = { healthy: true, functionalProbePassed: true, candidateErrorRate: .01, baselineErrorRate: .01, maxErrorRateIncrease: .005, metricsDigest: digest("metrics") };

test("allowlist rejects unknown environments stacks and operations; images must be immutable", async () => {
  const { adapter } = setup();
  assert.throws(() => adapter.authorize("production", input.stack, "PROMOTE"), /not allowlisted/);
  assert.throws(() => adapter.authorize("laboratory", "other", "INSPECT"), /not allowlisted/);
  await assert.rejects(adapter.apply("laboratory", input.stack, "DEPLOY_CANARY", { ...candidate, image: "registry.invalid/api:latest" }, "x"), /immutable/);
});

test("all release artifacts are required before canary and successful evidence promotes", async () => {
  const subject = setup();
  await assert.rejects(subject.controller.deploy("bad", { ...input, sbomDigest: "sha256:no" }), /sbom/);
  assert.equal(subject.transport.calls.length, 0);
  assert.equal((await subject.controller.deploy("d1", input)).phase, "CANARY");
  const result = await subject.controller.verify("d1", input, passing);
  assert.equal(result.phase, "PROMOTED"); assert.deepEqual(subject.transport.calls.map((c) => c.action), ["canary", "promoted"]);
  assert.equal(result.exactSpecDigest, evidenceDigest(candidate)); assert.deepEqual(result.exactServiceSpec, candidate); assert.equal(result.verification?.metricsDigest, passing.metricsDigest);
});

test("failed health functional or SLO evidence rolls back to exact prior spec", async () => {
  for (const failure of [{ ...passing, healthy: false }, { ...passing, functionalProbePassed: false }, { ...passing, candidateErrorRate: .02 }]) {
    const subject = setup(); await subject.controller.deploy("d2", input); const result = await subject.controller.verify("d2", input, failure);
    assert.equal(result.phase, "ROLLED_BACK"); assert.deepEqual(subject.transport.calls.at(-1)?.spec, prior);
  }
});

test("a restarted controller neither duplicates canary nor promotion", async () => {
  const subject = setup(); await subject.controller.deploy("d3", input);
  const restarted = new DeploymentController(subject.adapter, subject.store, subject.db);
  await restarted.deploy("d3", input); await restarted.verify("d3", input, passing); await restarted.verify("d3", input, passing);
  assert.deepEqual(subject.transport.calls.map((c) => c.key), ["d3:canary", "d3:promote"]);
  await assert.rejects(restarted.deploy("d3", { ...input, commit: "b".repeat(40) }), /different immutable inputs/);
});

test("migration validation failure restores backup and rolls back", async () => {
  const subject = setup(new FakeDatabase(false)); const result = await subject.controller.deploy("d4", input);
  assert.equal(subject.db.restored, 1); assert.equal(result.phase, "ROLLED_BACK"); assert.deepEqual(subject.transport.calls[0].spec, prior);
});

test("canonical Forgejo spec drift is visible and stack contains hardened primitives without secret values", async () => {
  const subject = setup(); assert.equal((await subject.adapter.inspectCanonical("laboratory", input.stack, [prior])).matches, true);
  subject.transport.current = [candidate]; assert.equal((await subject.adapter.inspectCanonical("laboratory", input.stack, [prior])).matches, false);
  const stack = readFileSync("infra/swarm/laboratory-stack.yml", "utf8");
  for (const term of ["@sha256:", "internal: true", "external: true", "healthcheck:", "limits:", "placement:", "volumes:", "configs:"]) assert.match(stack, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(stack, /^\s*(?:POSTGRES_)?PASSWORD\s*:/im);
  assert.doesNotMatch(stack, /^\s*data\s*:/im);
});
