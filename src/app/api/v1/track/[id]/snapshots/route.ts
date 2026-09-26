import { authenticateKey } from "@/lib/api-keys";
import { fail, handleError, ok, unauthorized } from "@/lib/http";
import { snapshotJson } from "@/lib/serialize";
import { admin } from "@/lib/supabase/admin";

/** GET /v1/track/:id/snapshots?full=true — the metric history, oldest first. `full` includes every field per snapshot. */
export async function GET(request: Request, ctx: RouteContext<"/api/v1/track/[id]/snapshots">) {
  const userId = await authenticateKey(request);
  if (!userId) return unauthorized();
  try {
    const { id } = await ctx.params;
    const db = admin();
    const isUuid = /^[0-9a-f-]{36}$/i.test(id);
    const { data: post } = await db.from("tracked_posts").select("id").eq("user_id", userId).eq(isUuid ? "id" : "short_code", id).maybeSingle();
    if (!post) return fail(404, "not_found", "You are not tracking that post.");
    const full = new URL(request.url).searchParams.get("full") === "true";
    const { data, error } = await db.from("snapshots").select().eq("tracked_post_id", post.id).order("taken_at").limit(5000);
    if (error) throw error;
    return ok({ snapshots: (data ?? []).map((s) => snapshotJson(s, full)) });
  } catch (e) {
    return handleError(e);
  }
}
