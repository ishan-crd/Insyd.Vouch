import { authenticateKey } from "@/lib/api-keys";
import { fail, handleError, ok, unauthorized } from "@/lib/http";
import { refreshRun } from "@/lib/scrape";
import { runJson } from "@/lib/serialize";
import { admin } from "@/lib/supabase/admin";

export async function GET(request: Request, ctx: RouteContext<"/api/v1/runs/[id]">) {
  const userId = await authenticateKey(request);
  if (!userId) return unauthorized();
  try {
    const { id } = await ctx.params;
    const { data } = await admin().from("runs").select().eq("id", id).eq("user_id", userId).maybeSingle();
    if (!data) return fail(404, "not_found", "No run with that id.");
    return ok({ run: runJson(await refreshRun(data)) });
  } catch (e) {
    return handleError(e);
  }
}
