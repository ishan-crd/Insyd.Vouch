import "server-only";
import { admin } from "@/lib/supabase/admin";

export function monthStart(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export async function usageSince(userId: string, since: Date) {
  const { data } = await admin()
    .from("runs")
    .select("result_count, cost_usd, started_at")
    .eq("user_id", userId)
    .gte("started_at", since.toISOString())
    .limit(10_000);
  const rows = data ?? [];
  return {
    runs: rows.length,
    results: rows.reduce((a, r) => a + r.result_count, 0),
    costUsd: Math.round(rows.reduce((a, r) => a + Number(r.cost_usd), 0) * 10_000) / 10_000,
    rows,
  };
}
