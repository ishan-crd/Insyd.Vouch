import { authenticateKey } from "@/lib/api-keys";
import { fail, handleError, ok, unauthorized } from "@/lib/http";
import { trackedJson } from "@/lib/serialize";
import { admin } from "@/lib/supabase/admin";

async function find(userId: string, idOrCode: string) {
  const isUuid = /^[0-9a-f-]{36}$/i.test(idOrCode);
  const { data } = await admin()
    .from("tracked_posts")
    .select()
    .eq("user_id", userId)
    .eq(isUuid ? "id" : "short_code", idOrCode)
    .maybeSingle();
  return data;
}

/** GET /v1/track/:id — accepts the tracking id or the post's shortCode. */
export async function GET(request: Request, ctx: RouteContext<"/api/v1/track/[id]">) {
  const userId = await authenticateKey(request);
  if (!userId) return unauthorized();
  try {
    const post = await find(userId, (await ctx.params).id);
    if (!post) return fail(404, "not_found", "You are not tracking that post.");
    return ok({ tracked: trackedJson(post) });
  } catch (e) {
    return handleError(e);
  }
}

/** DELETE /v1/track/:id — stop tracking. History is kept. */
export async function DELETE(request: Request, ctx: RouteContext<"/api/v1/track/[id]">) {
  const userId = await authenticateKey(request);
  if (!userId) return unauthorized();
  try {
    const post = await find(userId, (await ctx.params).id);
    if (!post) return fail(404, "not_found", "You are not tracking that post.");
    const { data } = await admin().from("tracked_posts").update({ status: "ended" }).eq("id", post.id).select().single();
    return ok({ tracked: trackedJson(data ?? post) });
  } catch (e) {
    return handleError(e);
  }
}
