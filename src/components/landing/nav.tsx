"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#tracking", label: "Tracking" },
  { href: "#api", label: "API" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="wrap nav-inner">
        <Link href="/" aria-label="Vouch home" className="nav-brand">
          <Logo />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <Link href="/login" className="nav-login">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary nav-cta">
            Get API key <ArrowUpRight size={16} className="arrow" />
          </Link>
        </div>
      </div>
    </header>
  );
}
