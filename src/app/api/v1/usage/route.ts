import { authenticateKey } from "@/lib/api-keys";
import { handleError, ok, unauthorized } from "@/lib/http";
import { monthStart, usageSince } from "@/lib/usage";

/** GET /v1/usage — results and spend for the current calendar month (UTC). */
export async function GET(request: Request) {
  const userId = await authenticateKey(request);
  if (!userId) return unauthorized();
  try {
    const since = monthStart();
    const u = await usageSince(userId, since);
    return ok({ periodStart: since.toISOString(), runs: u.runs, results: u.results, costUsd: u.costUsd });
  } catch (e) {
    return handleError(e);
  }
}
