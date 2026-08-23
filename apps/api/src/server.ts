import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { ZodError } from "zod";
import { completeStageSchema, failure, idempotencyKeySchema, leaseRequestSchema, projectCreateSchema, requirementCreateSchema, runCreateSchema, success } from "../../../packages/contracts/src/index";
import { createDatabase } from "../../../packages/database/src/client";
import { ControlPlaneError, ControlPlaneStore } from "../../../services/orchestrator/src/store";

const db=createDatabase(); const store=new ControlPlaneStore(db); const started=Date.now(); const counters={requests:0,errors:0};
function send(res:ServerResponse,status:number,body:unknown,requestId:string){res.writeHead(status,{"content-type":"application/json","x-request-id":requestId,"cache-control":"no-store"});res.end(JSON.stringify(body));}
async function body(req:IncomingMessage){const chunks:Buffer[]=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1_048_576)throw new ControlPlaneError("PAYLOAD_TOO_LARGE","Payload exceeds 1 MiB",413);chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{throw new ControlPlaneError("INVALID_JSON","Request body must be valid JSON",400);}}
function authorized(req:IncomingMessage){const expected=process.env.CONTROL_PLANE_API_TOKEN;if(!expected)throw new ControlPlaneError("AUTH_CONFIGURATION_ERROR","API token is not configured",503);const actual=req.headers.authorization?.replace(/^Bearer /,"")??"";const a=Buffer.from(actual),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b);}
export async function handler(req:IncomingMessage,res:ServerResponse){const requestId=(req.headers["x-request-id"] as string)?.slice(0,100)||randomUUID();counters.requests++;const url=new URL(req.url??"/","http://localhost");try{
  if(url.pathname==="/healthz"){send(res,200,success({status:"ok",uptimeSeconds:Math.floor((Date.now()-started)/1000)},requestId),requestId);return;}
  if(url.pathname==="/readyz"){await db.query("SELECT 1");send(res,200,success({status:"ready"},requestId),requestId);return;}
  if(url.pathname==="/metrics"){if(!authorized(req))throw new ControlPlaneError("UNAUTHORIZED","Valid bearer token required",401);res.writeHead(200,{"content-type":"text/plain; version=0.0.4"});res.end(`dx_control_plane_requests_total ${counters.requests}\ndx_control_plane_errors_total ${counters.errors}\n`);return;}
  if(!authorized(req))throw new ControlPlaneError("UNAUTHORIZED","Valid bearer token required",401);
  const key=()=>idempotencyKeySchema.parse(req.headers["idempotency-key"]);
  if(req.method==="POST"&&url.pathname==="/v1/projects"){const input=projectCreateSchema.parse(await body(req));send(res,201,success(await store.createProject(input.name),requestId),requestId);return;}
  let match=url.pathname.match(/^\/v1\/projects\/([0-9a-f-]+)\/requirements$/);if(req.method==="POST"&&match){const input=requirementCreateSchema.parse(await body(req));send(res,201,success(await store.createRequirement(match[1],input,key()),requestId),requestId);return;}
  if(req.method==="POST"&&url.pathname==="/v1/runs"){const input=runCreateSchema.parse(await body(req));send(res,201,success(await store.startRun(input.requirementId,key()),requestId),requestId);return;}
  match=url.pathname.match(/^\/v1\/runs\/([0-9a-f-]+)\/lease$/);if(req.method==="POST"&&match){const input=leaseRequestSchema.parse(await body(req));send(res,200,success(await store.lease(match[1],input.workerId,input.leaseSeconds),requestId),requestId);return;}
  match=url.pathname.match(/^\/v1\/runs\/([0-9a-f-]+)\/stages\/([0-9a-f-]+)\/complete$/);if(req.method==="POST"&&match){const input=completeStageSchema.parse(await body(req));send(res,200,success(await store.complete(match[1],match[2],input),requestId),requestId);return;}
  if(req.method==="GET"&&url.pathname==="/v1/dashboard"){send(res,200,success(await store.snapshot(),requestId),requestId);return;}
  throw new ControlPlaneError("NOT_FOUND","Route not found",404);
 }catch(error){counters.errors++;if(error instanceof ZodError){send(res,400,failure("SCHEMA_VALIDATION_FAILED","Request failed schema validation",requestId,error.issues),requestId);return;}const known=error instanceof ControlPlaneError?error:new ControlPlaneError("DATABASE_UNCERTAIN","Operation failed without conclusive database evidence",503);send(res,known.status,failure(known.code,known.message,requestId),requestId);}}
if(import.meta.url===`file://${process.argv[1]}`){const port=Number(process.env.PORT??3001);createServer(handler).listen(port,()=>process.stdout.write(`api listening on ${port}\n`));}
