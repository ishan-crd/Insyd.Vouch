export type Target =
  | { kind: "post"; shortCode: string; url: string }
  | { kind: "profile"; username: string; url: string };

const POST_RE = /instagram\.com\/(?:[\w.]+\/)?(reel|reels|p|tv)\/([\w-]+)/i;
const PROFILE_RE = /instagram\.com\/([\w.]+)\/?(?:\?.*)?$/i;
const USERNAME_RE = /^@?([\w.]{1,30})$/;
const RESERVED = new Set(["p", "reel", "reels", "tv", "explore", "stories", "accounts"]);

/** Turns whatever a customer pasted (reel URL, post URL, profile URL, @handle) into a canonical target. */
export function parseTarget(raw: string): Target | null {
  const input = raw.trim();
  if (!input) return null;

  const post = input.match(POST_RE);
  if (post) {
    const type = post[1].toLowerCase() === "p" ? "p" : "reel";
    return { kind: "post", shortCode: post[2], url: `https://www.instagram.com/${type}/${post[2]}/` };
  }
  const profile = input.match(PROFILE_RE);
  if (profile && !RESERVED.has(profile[1].toLowerCase())) {
    const username = profile[1].toLowerCase();
    return { kind: "profile", username, url: `https://www.instagram.com/${username}/` };
  }
  const handle = input.match(USERNAME_RE);
  if (handle) {
    const username = handle[1].toLowerCase();
    return { kind: "profile", username, url: `https://www.instagram.com/${username}/` };
  }
  return null;
}

/** Stable key used to match returned items back to what was asked for. */
export const targetKey = (t: Target) => (t.kind === "post" ? `post:${t.shortCode}` : `profile:${t.username}`);

export type ScrapedItem = Record<string, unknown> & {
  shortCode?: string;
  ownerUsername?: string;
  videoViewCount?: number;
  videoPlayCount?: number;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  caption?: string;
  displayUrl?: string;
  productType?: string;
  url?: string;
};

export function metricsOf(item: ScrapedItem) {
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null);
  return {
    views: n(item.videoViewCount),
    plays: n(item.videoPlayCount),
    likes: n(item.likesCount),
    comments: n(item.commentsCount),
    shares: n(item.sharesCount),
  };
}
