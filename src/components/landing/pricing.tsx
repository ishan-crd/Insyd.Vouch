"use client";

import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/reveal";

const PRICE_PER_1K = 4;
const CHECKS_PER_DAY = 12;

const INCLUDED = [
  "Every field for every post, no tiers",
  "Automatic re-check every 2 hours",
  "Full snapshot history, kept forever",
  "Dashboard, runs log and exports",
  "Webhooks and unlimited API keys",
  "Only successful results are billed",
];

const fmt = (n: number) => n.toLocaleString("en-US");
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 10 ? 2 : 0 });

export function Pricing() {
  const [posts, setPosts] = useState(100);
  const [days, setDays] = useState(7);
  const [oneOff, setOneOff] = useState(2000);

  const tracked = posts * days * CHECKS_PER_DAY;
  const results = tracked + oneOff;
  const cost = (results / 1000) * PRICE_PER_1K;

  return (
    <section id="pricing" className="section pricing">
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="eyebrow">Pricing</span>
          <h2 className="h2">
            One price. <span className="serif blue">Pay per pull.</span>
          </h2>
          <p className="lede">No seats, no plans to outgrow, no monthly minimum. A result is one post fetched once.</p>
        </Reveal>

        <div className="price-grid">
          <Reveal className="card price-card">
            <span className="price-tag">Pay as you go</span>
            <div className="price-amount">
              <b>$4</b>
              <span>/ 1,000 results</span>
            </div>
            <p className="price-sub">That&apos;s $0.004 per post fetch. Tracking one post for a full day costs under five cents.</p>
            <ul className="price-list">
              {INCLUDED.map((i) => (
                <li key={i}>
                  <Check size={15} strokeWidth={2.6} /> {i}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn btn-primary btn-lg price-cta">
              Get your API key <ArrowUpRight size={17} className="arrow" />
            </Link>
          </Reveal>

          <Reveal className="card calc" delay={0.1}>
            <h3 className="h3">Estimate your bill</h3>
            <Slider label="Posts you track" value={posts} min={0} max={2000} step={10} onChange={setPosts} display={fmt(posts)} />
            <Slider
              label="Days you track each post"
              value={days}
              min={1}
              max={30}
              step={1}
              onChange={setDays}
              display={`${days} ${days === 1 ? "day" : "days"}`}
            />
            <Slider label="One-off fetches" value={oneOff} min={0} max={50000} step={500} onChange={setOneOff} display={fmt(oneOff)} />

            <div className="calc-math mono">
              <div>
                <span>
                  {fmt(posts)} posts × {days}d × 12 checks
                </span>
                <span>{fmt(tracked)}</span>
              </div>
              <div>
                <span>one-off fetches</span>
                <span>{fmt(oneOff)}</span>
              </div>
              <div className="calc-total-row">
                <span>results</span>
                <span>{fmt(results)}</span>
              </div>
            </div>
            <div className="calc-total">
              <span>Estimated cost</span>
              <b className="num">{money(cost)}</b>
            </div>
          </Reveal>
        </div>

        <Reveal className="price-foot">
          Pulling more than 5 million results a month? <a href="mailto:hello@insyd.in">Talk to us about volume pricing →</a>
        </Reveal>
      </div>
    </section>
  );
}

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  const pct = ((props.value - props.min) / (props.max - props.min)) * 100;
  return (
    <label className="slider">
      <span className="slider-top">
        <span>{props.label}</span>
        <b className="num">{props.display}</b>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
      />
    </label>
  );
}
