import { z } from "zod";
import { authenticateKey } from "@/lib/api-keys";
import { handleError, ok, unauthorized } from "@/lib/http";
import { startScrape } from "@/lib/scrape";
import { runJson, trackedJson } from "@/lib/serialize";
import { admin } from "@/lib/supabase/admin";

const TrackSchema = z.object({
  urls: z.array(z.string()).min(1),
  trackForDays: z.number().int().min(1).max(365).optional(),
  includeSharesCount: z.boolean().optional(),
});

/** POST /v1/track — fetch now, then re-check every 2 hours. Only post/reel URLs can be tracked. */
export async function POST(request: Request) {
  const userId = await authenticateKey(request);
  if (!userId) return unauthorized();
  try {
    const body = TrackSchema.parse(await request.json());
    const run = await startScrape(userId, "API", { ...body, track: true });
    const { data } = await admin()
      .from("tracked_posts")
      .select()
      .eq("user_id", userId)
      .in("short_code", run.targets.filter((t) => t.startsWith("post:")).map((t) => t.slice(5)));
    return ok({ run: runJson(run), tracked: (data ?? []).map(trackedJson) }, 201);
  } catch (e) {
    return handleError(e);
  }
}

/** GET /v1/track?status=active — everything you track. */
export async function GET(request: Request) {
  const userId = await authenticateKey(request);
  if (!userId) return unauthorized();
  try {
    const q = new URL(request.url).searchParams;
    let query = admin().from("tracked_posts").select().eq("user_id", userId);
    if (q.get("status")) query = query.eq("status", q.get("status")!);
    const { data, error } = await query.order("created_at", { ascending: false }).limit(1000);
    if (error) throw error;
    return ok({ tracked: (data ?? []).map(trackedJson) });
  } catch (e) {
    return handleError(e);
  }
}
