import type { JobManifest } from "./protocol";
import { redactSecrets } from "./redaction";

export type CommandResult = { command: readonly string[]; exitCode: number; stdout: string; stderr: string; startedAt: string; finishedAt: string };
export type AttemptRecord = { attempt: number; outcome: "SUCCEEDED" | "FAILED" | "CANCELLED" | "EXPIRED"; results: readonly CommandResult[]; findings: readonly string[] };
export type CommandExecutor = (command: readonly string[], signal: AbortSignal) => Promise<Omit<CommandResult, "command">>;
export type LeaseStore = { acquire(jobId: string, workerId: string, expiresAt: Date): Promise<boolean>; release(jobId: string, workerId: string, outcome: AttemptRecord["outcome"]): Promise<void> };

export class IsolatedWorker {
  constructor(private readonly workerId: string, private readonly leases: LeaseStore, private readonly execute: CommandExecutor, private readonly preserve: (jobId: string, record: AttemptRecord) => Promise<void>) {}
  async run(manifest: JobManifest, attempt = 1, cancellation?: AbortSignal): Promise<AttemptRecord> {
    const expiresAt = new Date(manifest.expiresAt);
    if (!await this.leases.acquire(manifest.jobId, this.workerId, expiresAt)) throw new Error("Job lease unavailable");
    const controller = new AbortController();
    const onCancel = () => controller.abort("cancelled"); cancellation?.addEventListener("abort", onCancel, { once: true });
    const timer = setTimeout(() => controller.abort("expired"), Math.max(0, expiresAt.getTime() - Date.now()));
    const results: CommandResult[] = []; let outcome: AttemptRecord["outcome"] = "SUCCEEDED"; const findings: string[] = [];
    try {
      for (const command of manifest.allowedCommands) {
        if (controller.signal.aborted) break;
        const result = await this.execute(command, controller.signal);
        const clean = { command, ...result, stdout: redactSecrets(result.stdout).value, stderr: redactSecrets(result.stderr).value };
        results.push(clean);
        if (result.exitCode !== 0) { outcome = "FAILED"; findings.push(`Command failed: ${command[0]} (${result.exitCode})`); break; }
      }
      if (controller.signal.aborted) outcome = controller.signal.reason === "expired" ? "EXPIRED" : "CANCELLED";
    } catch (error) { outcome = controller.signal.aborted && controller.signal.reason === "expired" ? "EXPIRED" : controller.signal.aborted ? "CANCELLED" : "FAILED"; findings.push(error instanceof Error ? error.message : "Worker crashed"); }
    finally { clearTimeout(timer); cancellation?.removeEventListener("abort", onCancel); }
    const record = { attempt, outcome, results, findings } as const;
    try { await this.preserve(manifest.jobId, record); }
    finally { await this.leases.release(manifest.jobId, this.workerId, outcome); }
    return record;
  }
}
