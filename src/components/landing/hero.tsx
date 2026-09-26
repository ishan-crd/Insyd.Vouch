import { ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CopyCommand } from "./copy-command";
import { DashboardMock } from "./dashboard-mock";
import { Rise, Words } from "./words";

const CMD = `curl -X POST https://api.vouch.dev/v1/track -H "Authorization: Bearer $VOUCH_KEY" -d '{"url":"https://instagram.com/reel/C8x…"}'`;

export function Hero() {
  return (
    <section className="hero">
      <div className="grid-bg" />
      <div className="wrap hero-inner">
        <Rise delay={0}>
          <a href="#tracking" className="chip">
            <span className="tag">NEW</span> Auto-refresh every 2 hours, built in <ArrowUpRight size={13} />
          </a>
        </Rise>
        <h1 className="h1 hero-title">
          <Words text="Every view, like and share." start={80} />
          <br />
          <span className="blue">
            <Words text="Vouched for." start={380} serif />
          </span>
        </h1>
        <Rise delay={550}>
          <p className="lede hero-lede">
            Paste any Instagram post or reel link. Vouch pulls its full metrics, re-checks them every two hours, and hands
            you the history through one clean API and a dashboard your team will actually open.
          </p>
        </Rise>
        <Rise delay={680} className="hero-ctas">
          <Link href="/signup" className="btn btn-primary btn-lg">
            Start tracking <ArrowUpRight size={17} className="arrow" />
          </Link>
          <a href="#api" className="btn btn-ghost btn-lg">
            Read the API docs
          </a>
        </Rise>
        <Rise delay={800}>
          <CopyCommand
            command={CMD}
            display={
              <>
                curl -X POST api.vouch.dev/v1/track -d <span style={{ color: "#9be3b9" }}>{`'{"url":"instagram.com/reel/C8x…"}'`}</span>
              </>
            }
          />
        </Rise>
        <Rise delay={900} className="hero-meta">
          <span><ShieldCheck size={15} /> $4 per 1,000 results</span>
          <span>No Instagram login needed</span>
          <span>30+ fields per post</span>
        </Rise>
      </div>
      <Rise delay={1050} className="wrap hero-shot">
        <DashboardMock />
      </Rise>
    </section>
  );
}
