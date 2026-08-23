import type { ImplementationPlanV1 } from "../../../packages/contracts/src/index";
import { evidenceDigest } from "../../../packages/evidence/src/index";
import type { ForgejoOperations } from "../../forgejo/src/adapter";
import { redactSecrets } from "../../worker/src/redaction";

export type DeliveryInput = { runId: string; requirementId: string; plan: ImplementationPlanV1; owner: string; repository: string; changes: Readonly<Record<string, string>>; findings: readonly string[]; requiredChecks: readonly string[]; tests: readonly { check: string; command: string; passed: boolean; evidenceDigest: string }[]; evidence: readonly string[]; cancelled?: boolean };
export type DeliveryResult = { branch: string; commitSha: string; pullRequestUrl: string; evidenceDigest: string };

export class LaboratoryDeliveryWorkflow {
  constructor(private readonly forgejo: ForgejoOperations) {}
  async deliver(input: DeliveryInput): Promise<DeliveryResult> {
    if (input.cancelled) throw new Error("Delivery cancelled");
    const required = new Set(input.requiredChecks);
    const executed = new Set(input.tests.map((test) => test.check));
    if (required.size !== input.requiredChecks.length || executed.size !== input.tests.length || required.size === 0 || required.size !== executed.size || [...required].some((check) => !executed.has(check)) || [...executed].some((check) => !required.has(check)) || input.tests.some((test) => !test.passed)) throw new Error("Required local checks are missing, duplicated, unknown, or failing; commit blocked");
    const repo = await this.forgejo.getRepository(input.owner, input.repository);
    if (!repo.laboratory || repo.archived) throw new Error("Only an active disposable laboratory repository is allowed");
    const branch = `dx/${input.runId}`;
    await this.forgejo.createBranch(input.owner, input.repository, branch, repo.defaultBranch, `${input.runId}:branch`);
    const changes = Object.fromEntries(Object.entries(input.changes).map(([path, content]) => [path, redactSecrets(content).value]));
    const commit = await this.forgejo.createCommit(input.owner, input.repository, branch, `Implement ${input.requirementId}`, changes, `${input.runId}:commit`);
    const cleanFindings = input.findings.map((finding) => redactSecrets(finding).value);
    const cleanEvidence = input.evidence.map((item) => redactSecrets(item).value);
    const bundle = { requirementId: input.requirementId, planDigest: evidenceDigest(input.plan), findings: cleanFindings, tests: input.tests, evidence: cleanEvidence, commitSha: commit.sha };
    const digest = evidenceDigest(bundle);
    const issue = await this.forgejo.createIssue(input.owner, input.repository, `[${input.requirementId}] implementation`, `Plan: ${bundle.planDigest}\nEvidence: ${digest}`, `${input.runId}:issue`);
    const body = [`Requirement: ${input.requirementId}`, `Plan: ${bundle.planDigest}`, `Issue: #${issue.number}`, "Findings:", ...cleanFindings.map((finding) => `- ${finding}`), "Tests:", ...input.tests.map((test) => `- PASS ${test.check}: ${test.command} (${test.evidenceDigest})`), "Evidence:", ...cleanEvidence.map((item) => `- ${item}`), `Bundle: ${digest}`, "", "Autonomous merge and production deployment are disabled."].join("\n");
    const pull = await this.forgejo.createPullRequest(input.owner, input.repository, branch, repo.defaultBranch, `[${input.requirementId}] approved implementation plan`, body, `${input.runId}:pull`);
    await this.forgejo.setStatus(input.owner, input.repository, commit.sha, "dx/local-required-checks", "success", "All local required checks passed", `${input.runId}:status`);
    return { branch, commitSha: commit.sha, pullRequestUrl: pull.url, evidenceDigest: digest };
  }
}
