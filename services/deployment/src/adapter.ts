import { evidenceDigest } from "../../../packages/evidence/src/index";

export const deploymentOperations = ["DEPLOY_CANARY", "PROMOTE", "CANCEL", "ROLLBACK", "INSPECT"] as const;
export type DeploymentOperation = (typeof deploymentOperations)[number];

export type ServiceSpec = Readonly<{
  name: string;
  image: string;
  configurationDigests: readonly string[];
  replicas: number;
}>;

export interface SwarmTransport {
  apply(stack: string, spec: ServiceSpec, mode: "canary" | "promoted", idempotencyKey: string): Promise<void>;
  removeCanary(stack: string, idempotencyKey: string): Promise<void>;
  inspect(stack: string): Promise<readonly ServiceSpec[]>;
}

export type DeploymentPolicy = Readonly<{
  environments: Readonly<Record<string, readonly string[]>>;
  operations: readonly DeploymentOperation[];
}>;

export class SwarmDeploymentAdapter {
  constructor(private readonly policy: DeploymentPolicy, private readonly transport: SwarmTransport) {}

  authorize(environment: string, stack: string, operation: DeploymentOperation): void {
    if (!this.policy.operations.includes(operation) || !this.policy.environments[environment]?.includes(stack)) {
      throw new Error("Deployment operation is not allowlisted");
    }
  }

  async apply(environment: string, stack: string, operation: "DEPLOY_CANARY" | "PROMOTE" | "ROLLBACK", spec: ServiceSpec, key: string): Promise<void> {
    this.authorize(environment, stack, operation);
    if (!/^.+@sha256:[a-f0-9]{64}$/.test(spec.image)) throw new Error("An immutable image digest is required");
    if (!spec.configurationDigests.every((digest) => /^sha256:[a-f0-9]{64}$/.test(digest))) throw new Error("Invalid configuration digest");
    await this.transport.apply(stack, spec, operation === "DEPLOY_CANARY" ? "canary" : "promoted", key);
  }

  async cancel(environment: string, stack: string, key: string): Promise<void> {
    this.authorize(environment, stack, "CANCEL");
    await this.transport.removeCanary(stack, key);
  }

  async inspectCanonical(environment: string, stack: string, expected: readonly ServiceSpec[]) {
    this.authorize(environment, stack, "INSPECT");
    const actual = await this.transport.inspect(stack);
    return { matches: evidenceDigest(actual) === evidenceDigest(expected), expectedDigest: evidenceDigest(expected), actualDigest: evidenceDigest(actual) };
  }
}
