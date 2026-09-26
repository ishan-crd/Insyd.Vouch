const FIELDS = [
  "videoViewCount", "videoPlayCount", "likesCount", "commentsCount", "caption", "hashtags", "mentions",
  "ownerUsername", "ownerFullName", "timestamp", "videoDuration", "musicInfo", "latestComments", "taggedUsers",
  "displayUrl", "videoUrl", "productType", "isSponsored", "coauthorProducers", "dimensionsHeight", "shortCode",
];

export function FieldsMarquee() {
  const row = [...FIELDS, ...FIELDS];
  return (
    <section className="marquee-sec" aria-label="Fields returned for every post">
      <p className="marquee-label">Every field Instagram exposes, returned as clean JSON</p>
      <div className="marquee">
        <div className="marquee-track">
          {row.map((f, i) => (
            <span key={i} className="marquee-item" aria-hidden={i >= FIELDS.length}>
              <span className="dot" />
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
