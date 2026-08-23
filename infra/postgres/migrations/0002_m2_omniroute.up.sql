CREATE TABLE model_invocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), schema_version int NOT NULL DEFAULT 1 CHECK(schema_version=1), run_id uuid NOT NULL REFERENCES runs(id),
  idempotency_key varchar(240) NOT NULL, requested_route varchar(40) NOT NULL CHECK(requested_route IN ('requirements','architecture','code','critic','security','judge','fast')),
  effective_provider varchar(120), effective_model varchar(200) NOT NULL, latency_ms int NOT NULL CHECK(latency_ms>=0), input_tokens int, output_tokens int, cost_usd numeric(14,8), fallback boolean NOT NULL,
  prompt_version varchar(120) NOT NULL, input_digest varchar(71) NOT NULL CHECK(input_digest ~ '^sha256:[0-9a-f]{64}$'), output_digest varchar(71), result varchar(20) NOT NULL CHECK(result IN ('SUCCEEDED','FAILED')), error_code varchar(80), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(run_id,idempotency_key)
);
CREATE TABLE generated_artifacts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), schema_version int NOT NULL DEFAULT 1 CHECK(schema_version=1), run_id uuid NOT NULL REFERENCES runs(id), artifact_type varchar(80) NOT NULL, revision int NOT NULL CHECK(revision>=0), schema_name varchar(120) NOT NULL, digest varchar(71) NOT NULL CHECK(digest ~ '^sha256:[0-9a-f]{64}$'), document jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(run_id,artifact_type,revision));
