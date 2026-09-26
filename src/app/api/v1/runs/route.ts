import { authenticateKey } from "@/lib/api-keys";
import { handleError, ok, unauthorized } from "@/lib/http";
import { runJson } from "@/lib/serialize";
import { admin } from "@/lib/supabase/admin";

/** GET /v1/runs?limit=20&offset=0&status=SUCCEEDED — newest first. */
export async function GET(request: Request) {
  const userId = await authenticateKey(request);
  if (!userId) return unauthorized();
  try {
    const q = new URL(request.url).searchParams;
    const limit = Math.min(100, Math.max(1, Number(q.get("limit") ?? 20) || 20));
    const offset = Math.max(0, Number(q.get("offset") ?? 0) || 0);
    let query = admin().from("runs").select("*", { count: "exact" }).eq("user_id", userId);
    if (q.get("status")) query = query.eq("status", q.get("status")!.toUpperCase());
    const { data, count, error } = await query.order("started_at", { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return ok({ total: count ?? 0, limit, offset, runs: (data ?? []).map(runJson) });
  } catch (e) {
    return handleError(e);
  }
}
