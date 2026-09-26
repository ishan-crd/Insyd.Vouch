import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { runScheduler } from "@/lib/scrape";

export const maxDuration = 300;

/** Scheduler tick: queue due tracked posts and finish stray jobs. Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer /i, "");
  const expected = env.cronSecret();
  if (given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
    return fail(401, "unauthorized", "Bad cron secret.");
  }
  return ok(await runScheduler());
}
