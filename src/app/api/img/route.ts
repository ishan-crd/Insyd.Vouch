// Instagram's CDN refuses hotlinked images, so thumbnails are streamed through here.
const ALLOWED = /(^|\.)(cdninstagram\.com|fbcdn\.net)$/i;

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("u");
  let target: URL;
  try {
    target = new URL(src ?? "");
  } catch {
    return new Response("Bad url", { status: 400 });
  }
  if (target.protocol !== "https:" || !ALLOWED.test(target.hostname)) return new Response("Host not allowed", { status: 400 });

  const upstream = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0" } });
  const type = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !type.startsWith("image/")) return new Response("Not found", { status: 404 });
  return new Response(upstream.body, {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
  });
}
