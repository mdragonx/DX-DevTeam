export type ForgejoRepository = { owner: string; name: string; defaultBranch: string; archived: boolean; laboratory: boolean };
export type ForgejoCommit = { sha: string; message: string };
export type ForgejoPullRequest = { number: number; url: string; state: "open" | "closed" };

export class ForgejoError extends Error {
  constructor(message: string, readonly retryable: boolean, readonly status?: number) { super(message); }
}

export interface ForgejoOperations {
  getRepository(owner: string, repository: string): Promise<ForgejoRepository>;
  createBranch(owner: string, repository: string, branch: string, from: string, idempotencyKey: string): Promise<void>;
  createCommit(owner: string, repository: string, branch: string, message: string, files: Readonly<Record<string, string>>, idempotencyKey: string): Promise<ForgejoCommit>;
  createIssue(owner: string, repository: string, title: string, body: string, idempotencyKey: string): Promise<{ number: number }>;
  createPullRequest(owner: string, repository: string, head: string, base: string, title: string, body: string, idempotencyKey: string): Promise<ForgejoPullRequest>;
  setStatus(owner: string, repository: string, sha: string, context: string, state: "pending" | "success" | "failure", description: string, idempotencyKey: string): Promise<void>;
  configureWebhook(owner: string, repository: string, targetUrl: string, events: readonly string[], idempotencyKey: string): Promise<void>;
}

export type ForgejoAdapterOptions = { baseUrl: string; token: string; serviceIdentity: string; allowedRepository: string };

export class ForgejoAdapter implements ForgejoOperations {
  private readonly results = new Map<string, unknown>();
  constructor(private readonly options: ForgejoAdapterOptions, private readonly fetcher: typeof fetch = fetch) {
    if (!options.baseUrl.startsWith("https://")) throw new Error("Forgejo requires HTTPS");
    if (!options.token || !options.serviceIdentity) throw new Error("Dedicated Forgejo service identity is required");
  }
  private assertScope(owner: string, repository: string) {
    if (`${owner}/${repository}` !== this.options.allowedRepository) throw new ForgejoError("Repository is outside the laboratory capability", false, 403);
  }
  private async request<T>(owner: string, repository: string, method: string, path: string, idempotencyKey?: string, body?: unknown): Promise<T> {
    this.assertScope(owner, repository);
    if (idempotencyKey && this.results.has(idempotencyKey)) return this.results.get(idempotencyKey) as T;
    const response = await this.fetcher(`${this.options.baseUrl}/api/v1${path}`, { method, headers: { authorization: `token ${this.options.token}`, accept: "application/json", "content-type": "application/json", ...(idempotencyKey ? { "x-idempotency-key": idempotencyKey } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    if (!response.ok) throw new ForgejoError(`Forgejo ${method} ${path} failed (${response.status})`, response.status >= 500 || response.status === 429, response.status);
    const result = response.status === 204 ? undefined : await response.json();
    if (idempotencyKey) this.results.set(idempotencyKey, result);
    return result as T;
  }
  async getRepository(owner: string, repository: string) { const raw = await this.request<{ owner: { login: string }; name: string; default_branch: string; archived: boolean; topics?: string[] }>(owner, repository, "GET", `/repos/${owner}/${repository}`); return { owner: raw.owner.login, name: raw.name, defaultBranch: raw.default_branch, archived: raw.archived, laboratory: raw.topics?.includes("dx-laboratory") === true }; }
  async createBranch(o: string, r: string, branch: string, from: string, key: string) { await this.request(o, r, "POST", `/repos/${o}/${r}/branches`, key, { new_branch_name: branch, old_branch_name: from }); }
  async createCommit(o: string, r: string, branch: string, message: string, files: Readonly<Record<string, string>>, key: string) { return this.request<ForgejoCommit>(o, r, "POST", `/repos/${o}/${r}/contents`, key, { branch, message, files }); }
  async createIssue(o: string, r: string, title: string, body: string, key: string) { return this.request<{ number: number }>(o, r, "POST", `/repos/${o}/${r}/issues`, key, { title, body }); }
  async createPullRequest(o: string, r: string, head: string, base: string, title: string, body: string, key: string) { return this.request<ForgejoPullRequest>(o, r, "POST", `/repos/${o}/${r}/pulls`, key, { head, base, title, body }); }
  async setStatus(o: string, r: string, sha: string, context: string, state: "pending" | "success" | "failure", description: string, key: string) { await this.request(o, r, "POST", `/repos/${o}/${r}/statuses/${sha}`, key, { context, state, description }); }
  async configureWebhook(o: string, r: string, url: string, events: readonly string[], key: string) { await this.request(o, r, "POST", `/repos/${o}/${r}/hooks`, key, { type: "forgejo", active: true, events, config: { url, content_type: "json" } }); }
}
