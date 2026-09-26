import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { processJob } from "@/lib/scrape";
import { admin } from "@/lib/supabase/admin";

export const maxDuration = 300;

const safeEqual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Called by the scraper when an upstream run finishes. */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret") ?? "";
  if (!safeEqual(secret, env.webhookSecret())) return fail(401, "unauthorized", "Bad secret.");

  const body = (await request.json().catch(() => null)) as { resource?: { id?: string } } | null;
  const upstreamId = body?.resource?.id;
  if (!upstreamId) return fail(400, "invalid_input", "Missing resource.id.");

  const { data: job } = await admin().from("jobs").select("id").eq("upstream_run_id", upstreamId).maybeSingle();
  if (!job) return ok({ ignored: true });
  await processJob(job.id);
  return ok({ processed: job.id });
}
