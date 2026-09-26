const FIELDS = [
  "videoViewCount",
  "videoPlayCount",
  "likesCount",
  "commentsCount",
  "caption",
  "hashtags",
  "mentions",
  "ownerUsername",
  "ownerFullName",
  "timestamp",
  "videoDuration",
  "musicInfo",
  "latestComments",
  "taggedUsers",
  "displayUrl",
  "videoUrl",
  "productType",
  "isSponsored",
  "coauthorProducers",
  "dimensionsHeight",
  "shortCode",
];

export function FieldsMarquee() {
  // Two copies back to back make the loop seamless; the second copy is decorative.
  const row = [...FIELDS.map((f) => ({ f, copy: false })), ...FIELDS.map((f) => ({ f, copy: true }))];
  return (
    <section className="marquee-sec" aria-label="Fields returned for every post">
      <p className="marquee-label">Every field Instagram exposes, returned as clean JSON</p>
      <div className="marquee">
        <div className="marquee-track">
          {row.map(({ f, copy }) => (
            <span key={`${copy ? "b" : "a"}-${f}`} className="marquee-item" aria-hidden={copy}>
              <span className="dot" />
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
