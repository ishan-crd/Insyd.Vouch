import { BadgeCheck, Building2, LineChart, Megaphone } from "lucide-react";
import { Reveal } from "@/components/reveal";

const CASES = [
  { icon: Megaphone, who: "Influencer agencies", what: "Report campaign reach to clients with numbers that are timestamped and re-checked, not screenshots." },
  { icon: BadgeCheck, who: "Creator payouts", what: "Pay creators per view on verified counts. Vouch keeps the paper trail if anyone disputes it." },
  { icon: Building2, who: "Brands & D2C teams", what: "Watch every tagged reel and UGC post in one place and see which ones are still climbing." },
  { icon: LineChart, who: "Analytics products", what: "Drop Instagram metrics into your own product through one stable API instead of a scraper farm." },
];

export function UseCases() {
  return (
    <section className="section cases">
      <div className="wrap cases-grid">
        <Reveal className="cases-head">
          <span className="eyebrow">Who it&apos;s for</span>
          <h2 className="h2">
            Built for teams who get paid <span className="serif blue">on the numbers.</span>
          </h2>
        </Reveal>
        <div className="cases-list">
          {CASES.map((c, i) => (
            <Reveal key={c.who} className="case" delay={i * 0.06}>
              <div className="bento-icon"><c.icon size={18} /></div>
              <div>
                <h3 className="h3">{c.who}</h3>
                <p>{c.what}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
