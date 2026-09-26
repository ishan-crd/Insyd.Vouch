"use client";

import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/reveal";

const ENDPOINTS = [
  { m: "POST", p: "/v1/scrape", d: "Fetch one or many posts right now" },
  { m: "POST", p: "/v1/track", d: "Start tracking, re-checked every 2h" },
  { m: "GET", p: "/v1/posts/:id/snapshots", d: "Full metric history for a post" },
  { m: "GET", p: "/v1/runs", d: "Every pull you've made, with cost" },
  { m: "DEL", p: "/v1/track/:id", d: "Stop tracking a post" },
];

const SAMPLES: Record<string, string> = {
  cURL: `curl https://api.vouch.dev/v1/scrape \\
  -H "Authorization: Bearer $VOUCH_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "urls": ["https://www.instagram.com/reel/C8xQ2Lm/"],
    "track": true
  }'`,
  Node: `import Vouch from "@vouch/sdk";

const vouch = new Vouch(process.env.VOUCH_KEY);

const { items } = await vouch.scrape({
  urls: ["https://www.instagram.com/reel/C8xQ2Lm/"],
  track: true, // re-check every 2 hours
});

console.log(items[0].videoViewCount);`,
  Python: `from vouch import Vouch

vouch = Vouch(api_key=os.environ["VOUCH_KEY"])

res = vouch.scrape(
    urls=["https://www.instagram.com/reel/C8xQ2Lm/"],
    track=True,  # re-check every 2 hours
)

print(res.items[0].video_view_count)`,
};

function Highlight({ code }: { code: string }) {
  // Tiny tokenizer: strings, numbers, comments and a handful of keywords.
  const parts = code.split(
    /("(?:[^"\\]|\\.)*"|'[^']*'|(?<![:\w])\/\/.*|(?<![\w"$])#.*|\b\d+\b|\b(?:import|from|const|await|true|True|print|new)\b)/g,
  );
  const cls = (t: string) =>
    /^["']/.test(t)
      ? "tok-s"
      : /^(\/\/|#)/.test(t)
        ? "tok-c"
        : /^\d+$/.test(t)
          ? "tok-n"
          : /^(import|from|const|await|true|True|print|new)$/.test(t)
            ? "tok-k"
            : undefined;
  // Tokens are keyed by their character offset in the snippet, which is stable for a given code string.
  const tokens = parts.reduce<{ t: string; at: number }[]>((acc, t) => {
    const prev = acc[acc.length - 1];
    acc.push({ t, at: prev ? prev.at + prev.t.length : 0 });
    return acc;
  }, []);
  return (
    <>
      {tokens.map(({ t, at }) =>
        t ? (
          <span key={at} className={cls(t)}>
            {t}
          </span>
        ) : null,
      )}
    </>
  );
}

const RESPONSE = `{
  "runId": "run_8fK2mQx1",
  "status": "SUCCEEDED",
  "items": [{
    "inputUrl": "https://www.instagram.com/reel/C8xQ2Lm/",
    "type": "Video",
    "shortCode": "C8xQ2Lm",
    "caption": "₹80 thali that beat a 5-star 🍛",
    "hashtags": ["foodie", "delhi"],
    "ownerUsername": "nomad.eats",
    "ownerFullName": "Nomad Eats",
    "videoViewCount": 1094600,
    "videoPlayCount": 2931775,
    "likesCount": 78811,
    "commentsCount": 1970,
    "videoDuration": 31.4,
    "timestamp": "2026-09-25T14:02:11.000Z",
    "musicInfo": { "artist_name": "Prateek Kuhad" },
    "productType": "clips"
  }],
  "tracking": { "interval": "2h", "nextCheckAt": "2026-09-27T04:00:00Z" }
}`;

export function ApiSection() {
  const [tab, setTab] = useState<keyof typeof SAMPLES>("cURL");
  const [copied, setCopied] = useState(false);

  return (
    <section id="api" className="section api" data-nav-dark>
      <div className="api-glow" />
      <div className="wrap api-grid">
        <Reveal className="api-copy">
          <span className="eyebrow">Developer API</span>
          <h2 className="h2">
            An API you can read <span className="serif">in one sitting.</span>
          </h2>
          <p className="lede">
            REST, JSON, bearer tokens. The response carries every field Instagram exposes for a post, in the exact same shape whether you
            fetch once or track forever.
          </p>
          <ul className="endpoints">
            {ENDPOINTS.map((e) => (
              <li key={e.p}>
                <span className={`method m-${e.m.toLowerCase()}`}>{e.m}</span>
                <code>{e.p}</code>
                <small>{e.d}</small>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="api-code" delay={0.1}>
          <div className="terminal">
            <div className="window-bar api-tabs">
              {Object.keys(SAMPLES).map((k) => (
                <button type="button" key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
                  {k}
                  {tab === k && (
                    <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
                  )}
                </button>
              ))}
              <button
                type="button"
                className="api-copy-btn"
                aria-label="Copy code"
                onClick={() => {
                  navigator.clipboard.writeText(SAMPLES[tab]);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.pre
                key={tab}
                className="api-pre"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <Highlight code={SAMPLES[tab]} />
              </motion.pre>
            </AnimatePresence>
          </div>

          <div className="terminal api-response">
            <div className="window-bar">
              <span className="resp-status">200 OK</span>
              <span className="url">application/json · 1.2 s</span>
            </div>
            <pre className="api-pre api-pre-scroll" data-lenis-prevent>
              <Highlight code={RESPONSE} />
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
