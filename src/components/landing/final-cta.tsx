import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";

export function FinalCta() {
  return (
    <section className="cta-sec">
      <div className="wrap">
        <Reveal className="cta" data-nav-dark>
          <div className="cta-grid-bg" />
          <div className="cta-inner">
            <h2 className="cta-title">
              Stop screenshotting insights. <span className="serif">Start vouching.</span>
            </h2>
            <p>Get an API key in under a minute. Your first tracked post is one request away.</p>
            <div className="cta-actions">
              <Link href="/signup" className="btn btn-white btn-lg">
                Create your account <ArrowUpRight size={17} className="arrow" />
              </Link>
              <a href="#api" className="btn btn-outline-light btn-lg">
                See the API
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
