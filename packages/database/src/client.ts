import pg from "pg";

export type QueryResult<T = Record<string, unknown>> = { rows: T[]; rowCount?: number | null };
export interface Queryable { query<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<QueryResult<T>> }
export interface Transactional extends Queryable { transaction<T>(work: (tx: Queryable) => Promise<T>): Promise<T> }

export function createDatabase(connectionString = process.env.DATABASE_URL): Transactional & { close(): Promise<void> } {
  if (!connectionString) throw new Error("DATABASE_URL is required; refusing to use non-durable workflow state");
  const pool = new pg.Pool({ connectionString, max: 10, connectionTimeoutMillis: 5_000, idleTimeoutMillis: 30_000 });
  return {
    query: (text, values) => pool.query(text, values) as Promise<QueryResult<never>>,
    async transaction(work) { const client = await pool.connect(); try { await client.query("BEGIN"); const result = await work(client); await client.query("COMMIT"); return result; } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } },
    close: () => pool.end(),
  };
}
