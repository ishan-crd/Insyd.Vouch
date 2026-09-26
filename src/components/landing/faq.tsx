"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/reveal";

const QA = [
  { q: "What exactly counts as a result?", a: "One post fetched once. Tracking a post re-fetches it every two hours, so one tracked post is 12 results a day, which comes to $0.048." },
  { q: "Which links can I track?", a: "Any public Instagram reel or post URL (instagram.com/reel/… or instagram.com/p/…). You can also pass a public profile to pull its latest reels. Private accounts are not supported." },
  { q: "What data comes back?", a: "Everything Instagram exposes for the post: views, plays, likes, comments, caption, hashtags, mentions, tagged users, owner, audio, duration, dimensions, media URLs, the latest comments and more. More than 30 fields, same JSON shape every time." },
  { q: "Can I change the 2-hour interval or stop tracking?", a: "Two hours is the default cadence. You can stop tracking any post at any time from the dashboard or with DELETE /v1/track/:id, and set an end date when you start tracking." },
  { q: "Do I need an Instagram account or login?", a: "No. You never share credentials with us. We only read public data." },
  { q: "How am I billed?", a: "Usage is metered per result and shown live in your console, with a full log of every run and exactly what it cost. Failed runs and empty results are free." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section faq">
      <div className="wrap faq-grid">
        <Reveal className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2 className="h2">
            Questions, <span className="serif blue">answered.</span>
          </h2>
          <p className="lede">
            Something else? Write to <a className="blue" href="mailto:hello@insyd.in">hello@insyd.in</a> and a human replies.
          </p>
        </Reveal>
        <Reveal className="faq-list" delay={0.08}>
          {QA.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                  <span>{item.q}</span>
                  <Plus size={18} className="faq-icon" />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <p>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
