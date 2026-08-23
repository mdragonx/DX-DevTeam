import { ModelCallError, type ModelProvider, type ModelRequest, type ModelResponse } from "./types";

/** OpenAI-compatible transport. Endpoint and credential are injected at runtime only. */
export class OmniRouteHttpProvider implements ModelProvider {
  constructor(private readonly endpoint:string, private readonly apiKey:string, private readonly fetcher:typeof fetch=fetch) { if(!/^https?:\/\//.test(endpoint)) throw new Error("OMNIROUTE_ENDPOINT must be an HTTP(S) URL"); }
  async complete(request:ModelRequest):Promise<ModelResponse> {
    const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),request.timeoutMs); const cancel=()=>controller.abort(); request.signal?.addEventListener("abort",cancel,{once:true});
    try { const response=await this.fetcher(`${this.endpoint.replace(/\/$/,"")}/v1/chat/completions`,{method:"POST",headers:{authorization:`Bearer ${this.apiKey}`,"content-type":"application/json","idempotency-key":request.idempotencyKey},body:JSON.stringify({model:request.route,messages:request.messages,response_format:{type:"json_object"}}),signal:controller.signal});
      if(response.status===429)throw new ModelCallError("RATE_LIMIT","OmniRoute rate limited the request",Number(response.headers.get("retry-after")??0)*1_000||undefined); if(response.status>=500)throw new ModelCallError("TRANSIENT","OmniRoute is temporarily unavailable"); if(!response.ok)throw new ModelCallError("PERMANENT",`OmniRoute rejected request (${response.status})`);
      const value=await response.json() as {model?:string;provider?:string;model_family?:string;fallback?:boolean;choices?:{message?:{content?:string}}[];usage?:{prompt_tokens?:number;completion_tokens?:number;cost_usd?:number}}; const content=value.choices?.[0]?.message?.content;if(typeof content!=="string"||typeof value.model!=="string")throw new ModelCallError("PERMANENT","OmniRoute response envelope is invalid"); return {content,model:value.model,provider:value.provider,modelFamily:value.model_family,fallback:value.fallback,usage:{inputTokens:value.usage?.prompt_tokens??0,outputTokens:value.usage?.completion_tokens??0,costUsd:value.usage?.cost_usd}};
    } catch(error) { if(error instanceof ModelCallError)throw error;if(controller.signal.aborted)throw new ModelCallError(request.signal?.aborted?"CANCELLED":"TIMEOUT",request.signal?.aborted?"Task was cancelled":"OmniRoute request timed out");throw new ModelCallError("TRANSIENT","OmniRoute network failure"); } finally {clearTimeout(timeout);request.signal?.removeEventListener("abort",cancel);}
  }
}
