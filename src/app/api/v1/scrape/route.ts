import { authenticateKey } from "@/lib/api-keys";
import { handleError, ok, unauthorized } from "@/lib/http";
import { ScrapeInputSchema, startScrape, waitForRun } from "@/lib/scrape";
import { runJson } from "@/lib/serialize";
import { admin } from "@/lib/supabase/admin";

export const maxDuration = 300;

/** POST /v1/scrape — fetch posts now. `?wait=60` blocks up to that many seconds and inlines the items. */
export async function POST(request: Request) {
  const userId = await authenticateKey(request);
  if (!userId) return unauthorized();
  try {
    const body = ScrapeInputSchema.parse(await request.json());
    let run = await startScrape(userId, "API", body);

    const wait = Math.min(240, Math.max(0, Number(new URL(request.url).searchParams.get("wait") ?? 0) || 0));
    if (wait) run = await waitForRun(run, wait);

    if (run.status === "SUCCEEDED" || (wait && run.result_count)) {
      const { data } = await admin().from("run_items").select("data").eq("run_id", run.id).order("position").limit(5000);
      return ok({ run: runJson(run), items: (data ?? []).map((r) => r.data) }, 201);
    }
    return ok({ run: runJson(run) }, 202);
  } catch (e) {
    return handleError(e);
  }
}
