import { createHash } from "node:crypto";
import type { Queryable } from "../../../packages/database/src/client";
import type { TaskBudget } from "../../omniroute/src/types";
import { SpecificationWorkflow, type SpecificationRun } from "./specification-workflow";

/** Loads the authoritative requirement and persists only schema-validated workflow artifacts. */
export async function runPersistedRequirement(db:Queryable,workflow:SpecificationWorkflow,runId:string,budget:TaskBudget,revision=0,signal?:AbortSignal):Promise<SpecificationRun>{
  const result=await db.query<{requirement_id:string;statement:string}>("SELECT r.requirement_id,q.statement FROM runs r JOIN requirements q ON q.id=r.requirement_id WHERE r.id=$1",[runId]);
  if(!result.rows[0])return {state:"BLOCKED",reason:"PERSISTED_REQUIREMENT_NOT_FOUND",revision};
  const criteria=await db.query<{description:string}>("SELECT description FROM acceptance_criteria WHERE requirement_id=$1 ORDER BY ordinal",[result.rows[0].requirement_id]);
  const outcome=await workflow.execute({id:result.rows[0].requirement_id,statement:result.rows[0].statement,acceptanceCriteria:criteria.rows.map(row=>row.description)},budget,revision,signal);
  const artifacts:{type:string;document:unknown}[]=[];
  if(outcome.specification)artifacts.push({type:"SPECIFICATION",document:outcome.specification}); if(outcome.plan)artifacts.push({type:"IMPLEMENTATION_PLAN",document:outcome.plan}); if(outcome.critic)artifacts.push({type:"CRITIC_REVIEW",document:outcome.critic}); if(outcome.judge)artifacts.push({type:"JUDGE_DECISION",document:outcome.judge});
  artifacts.push({type:"WORKFLOW_RESULT",document:{schemaVersion:"workflow-result.v1",state:outcome.state,reason:outcome.reason??"REVIEWED",revision:outcome.revision}});
  for(const {type,document} of artifacts){const schemaVersion=(document as {schemaVersion:string}).schemaVersion;const digest=`sha256:${createHash("sha256").update(JSON.stringify(document)).digest("hex")}`;await db.query("INSERT INTO generated_artifacts(run_id,artifact_type,revision,schema_name,digest,document) VALUES($1,$2,$3,$4,$5,$6::jsonb) ON CONFLICT(run_id,artifact_type,revision) DO NOTHING",[runId,type,revision,schemaVersion,digest,JSON.stringify(document)]);}
  return outcome;
}
