import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { admin } from "@/lib/supabase/admin";

export type WebhookEvent = "run.succeeded" | "run.failed" | "snapshots.created" | "ping";

export const newWebhookSecret = () => `whsec_${randomBytes(24).toString("hex")}`;

/**
 * POSTs an event to the customer's endpoint. Header `Vouch-Signature: t=<unix>,v1=<hex hmac-sha256 of "t.body">`.
 * Best effort, 5 s timeout, never throws.
 */
export async function deliver(userId: string, event: WebhookEvent, data: unknown): Promise<number | null> {
  const db = admin();
  const { data: p } = await db.from("profiles").select("webhook_url, webhook_secret").eq("id", userId).maybeSingle();
  if (!p?.webhook_url || !p.webhook_secret) return null;

  const body = JSON.stringify({ event, createdAt: new Date().toISOString(), data });
  const t = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", p.webhook_secret).update(`${t}.${body}`).digest("hex");
  let status = 0;
  try {
    const res = await fetch(p.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Vouch-Webhooks/1", "Vouch-Event": event, "Vouch-Signature": `t=${t},v1=${sig}` },
      body,
      signal: AbortSignal.timeout(5000),
    });
    status = res.status;
  } catch {
    status = 0;
  }
  await db.from("profiles").update({ webhook_last_status: status, webhook_last_at: new Date().toISOString() }).eq("id", userId);
  return status;
}
