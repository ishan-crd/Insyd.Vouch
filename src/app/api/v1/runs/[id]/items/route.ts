import { authenticateKey } from "@/lib/api-keys";
import { toCsv } from "@/lib/csv";
import { fail, handleError, ok, unauthorized } from "@/lib/http";
import { refreshRun } from "@/lib/scrape";
import { admin } from "@/lib/supabase/admin";

/** GET /v1/runs/:id/items?format=json|csv&limit=&offset= — the raw post objects, exactly as scraped. */
export async function GET(request: Request, ctx: RouteContext<"/api/v1/runs/[id]/items">) {
  const userId = await authenticateKey(request);
  if (!userId) return unauthorized();
  try {
    const { id } = await ctx.params;
    const db = admin();
    const { data: run } = await db.from("runs").select().eq("id", id).eq("user_id", userId).maybeSingle();
    if (!run) return fail(404, "not_found", "No run with that id.");
    await refreshRun(run);

    const q = new URL(request.url).searchParams;
    const limit = Math.min(5000, Math.max(1, Number(q.get("limit") ?? 1000) || 1000));
    const offset = Math.max(0, Number(q.get("offset") ?? 0) || 0);
    const { data, error } = await db
      .from("run_items")
      .select("data")
      .eq("run_id", id)
      .order("position")
      .range(offset, offset + limit - 1);
    if (error) throw error;
    const items = (data ?? []).map((r) => r.data as Record<string, unknown>);

    if (q.get("format") === "csv") {
      return new Response(toCsv(items), {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="run-${id}.csv"` },
      });
    }
    return ok(items);
  } catch (e) {
    return handleError(e);
  }
}
