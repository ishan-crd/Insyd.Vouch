import { getUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { admin } from "@/lib/supabase/admin";

/** Console download of a run's full dataset (session-authenticated). */
export async function GET(request: Request, ctx: RouteContext<"/dashboard/runs/[id]/export">) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const db = admin();
  const { data: run } = await db.from("runs").select("id, short_id").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!run) return new Response("Not found", { status: 404 });

  const items: Record<string, unknown>[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await db
      .from("run_items")
      .select("data")
      .eq("run_id", id)
      .order("position")
      .range(from, from + 999);
    items.push(...(data ?? []).map((r) => r.data as Record<string, unknown>));
    if (!data || data.length < 1000) break;
  }

  const csv = new URL(request.url).searchParams.get("format") === "csv";
  return new Response(csv ? toCsv(items) : JSON.stringify(items, null, 2), {
    headers: {
      "Content-Type": csv ? "text/csv; charset=utf-8" : "application/json",
      "Content-Disposition": `attachment; filename="vouch-run-${run.short_id}.${csv ? "csv" : "json"}"`,
    },
  });
}
