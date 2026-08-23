import type { ImplementationPlanV1 } from "../../../packages/contracts/src/index";
import { evidenceDigest } from "../../../packages/evidence/src/index";
import type { ForgejoOperations } from "../../forgejo/src/adapter";
import { redactSecrets } from "../../worker/src/redaction";

export type DeliveryInput = { runId: string; requirementId: string; plan: ImplementationPlanV1; owner: string; repository: string; changes: Readonly<Record<string, string>>; findings: readonly string[]; tests: readonly { command: string; passed: boolean; evidenceDigest: string }[]; evidence: readonly string[]; cancelled?: boolean };
export type DeliveryResult = { branch: string; commitSha: string; pullRequestUrl: string; evidenceDigest: string };

export class LaboratoryDeliveryWorkflow {
  constructor(private readonly forgejo: ForgejoOperations) {}
  async deliver(input: DeliveryInput): Promise<DeliveryResult> {
    if (input.cancelled) throw new Error("Delivery cancelled");
    if (input.tests.length === 0 || input.tests.some((test) => !test.passed)) throw new Error("Required local checks did not pass; commit blocked");
    const repo = await this.forgejo.getRepository(input.owner, input.repository);
    if (!repo.laboratory || repo.archived) throw new Error("Only an active disposable laboratory repository is allowed");
    const branch = `dx/${input.runId}`;
    await this.forgejo.createBranch(input.owner, input.repository, branch, repo.defaultBranch, `${input.runId}:branch`);
    const changes = Object.fromEntries(Object.entries(input.changes).map(([path, content]) => [path, redactSecrets(content).value]));
    const commit = await this.forgejo.createCommit(input.owner, input.repository, branch, `Implement ${input.requirementId}`, changes, `${input.runId}:commit`);
    const bundle = { requirementId: input.requirementId, planDigest: evidenceDigest(input.plan), findings: input.findings, tests: input.tests, evidence: input.evidence, commitSha: commit.sha };
    const digest = evidenceDigest(bundle);
    const issue = await this.forgejo.createIssue(input.owner, input.repository, `[${input.requirementId}] implementation`, `Plan: ${bundle.planDigest}\nEvidence: ${digest}`, `${input.runId}:issue`);
    const body = [`Requirement: ${input.requirementId}`, `Plan: ${bundle.planDigest}`, `Issue: #${issue.number}`, "Findings:", ...input.findings.map((finding) => `- ${redactSecrets(finding).value}`), "Tests:", ...input.tests.map((test) => `- PASS ${test.command} (${test.evidenceDigest})`), "Evidence:", ...input.evidence.map((item) => `- ${item}`), `Bundle: ${digest}`, "", "Autonomous merge and production deployment are disabled."].join("\n");
    const pull = await this.forgejo.createPullRequest(input.owner, input.repository, branch, repo.defaultBranch, `[${input.requirementId}] approved implementation plan`, body, `${input.runId}:pull`);
    await this.forgejo.setStatus(input.owner, input.repository, commit.sha, "dx/local-required-checks", "success", "All local required checks passed", `${input.runId}:status`);
    return { branch, commitSha: commit.sha, pullRequestUrl: pull.url, evidenceDigest: digest };
  }
}
