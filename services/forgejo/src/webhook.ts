import { createHmac, timingSafeEqual } from "node:crypto";

export type WebhookReceiptStore = { claim(deliveryId: string, digest: string, receivedAt: Date): Promise<boolean> };
export type WebhookRequest = { deliveryId: string; timestamp: string; signature: string; body: Uint8Array };

export class ForgejoWebhookHandler {
  constructor(private readonly secret: string, private readonly store: WebhookReceiptStore, private readonly maxSkewMs = 300_000) {}
  async handle(request: WebhookRequest, now = new Date()): Promise<{ duplicate: boolean; payload?: unknown }> {
    const sentAt = Date.parse(request.timestamp);
    if (!Number.isFinite(sentAt) || Math.abs(now.getTime() - sentAt) > this.maxSkewMs) throw new Error("Webhook timestamp outside replay window");
    const expected = createHmac("sha256", this.secret).update(request.timestamp).update(".").update(request.body).digest("hex");
    const supplied = request.signature.replace(/^sha256=/, "");
    if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) throw new Error("Invalid webhook signature");
    const claimed = await this.store.claim(request.deliveryId, `sha256:${expected}`, now);
    if (!claimed) return { duplicate: true };
    return { duplicate: false, payload: JSON.parse(Buffer.from(request.body).toString("utf8")) };
  }
}
