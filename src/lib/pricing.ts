/** What customers pay. One result = one post returned once. */
export const PRICE_PER_1K_RESULTS = 4;
/** Shares count is an upstream add-on with its own per-result cost, so it is billed on top. */
export const SHARES_ADDON_PER_1K = 10;

export const TRACK_INTERVAL_MINUTES = 120;
export const MAX_TARGETS_PER_REQUEST = 500;

export function costFor(results: number, includeShares: boolean) {
  const per1k = PRICE_PER_1K_RESULTS + (includeShares ? SHARES_ADDON_PER_1K : 0);
  return Math.round(((results * per1k) / 1000) * 10_000) / 10_000;
}

export const usd = (n: number, digits = 2) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: Math.max(digits, 3),
  });
