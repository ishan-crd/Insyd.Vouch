export const num = (n: number | null | undefined) => (n === null || n === undefined ? "—" : n.toLocaleString("en-US"));

export function compact(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function dateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function duration(secs: number | null) {
  if (secs === null) return "—";
  if (secs < 60) return `${secs} s`;
  const m = Math.floor(secs / 60);
  if (m < 60) return `${m} m ${secs % 60} s`;
  return `${Math.floor(m / 60)} h ${m % 60} m`;
}

export function relative(iso: string | null | undefined) {
  if (!iso) return "—";
  const diff = (Date.parse(iso) - Date.now()) / 1000;
  const abs = Math.abs(diff);
  const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60) return fmt.format(Math.round(diff), "second");
  if (abs < 3600) return fmt.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return fmt.format(Math.round(diff / 3600), "hour");
  return fmt.format(Math.round(diff / 86400), "day");
}

/** Instagram CDN images must go through our proxy. */
export const img = (url: unknown) => (typeof url === "string" && url ? `/api/img?u=${encodeURIComponent(url)}` : null);

export function inputSummary(input: unknown) {
  const u = (input as { username?: string[] })?.username ?? [];
  if (!u.length) return "—";
  const first = u[0].replace(/^https?:\/\/(www\.)?instagram\.com/, "").replace(/\/$/, "") || u[0];
  return u.length === 1 ? first : `${first} +${u.length - 1} more`;
}

/** ISO timestamp `hours` ago. */
export const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString();

export const secondsSince = (iso: string) => Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
