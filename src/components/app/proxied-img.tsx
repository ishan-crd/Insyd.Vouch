/* eslint-disable @next/next/no-img-element -- proxied, expiring CDN image; see note below */

/**
 * Instagram CDN thumbnail served through /api/img. A plain <img> on purpose: the proxy already caches,
 * and the source URLs expire, so next/image optimisation would only add a second cache layer.
 */
export function ProxiedImg({ src, className, lazy = true }: { src: string; className?: string; lazy?: boolean }) {
  // biome-ignore lint/performance/noImgElement: proxied, expiring CDN image; see component note
  return <img src={src} alt="" className={className} loading={lazy ? "lazy" : undefined} />;
}
