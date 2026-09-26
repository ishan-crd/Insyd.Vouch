import { ApiSection } from "@/components/landing/api-section";
import { Features } from "@/components/landing/features";
import { FieldsMarquee } from "@/components/landing/fields-marquee";
import { Hero } from "@/components/landing/hero";
import { How } from "@/components/landing/how";
import { Tracking } from "@/components/landing/tracking";
import { Nav } from "@/components/landing/nav";

export default function Home() {
  return (
    <>
      <div className="page-light" />
      <Nav />
      <main style={{ position: "relative" }}>
        <Hero />
        <FieldsMarquee />
        <How />
        <Tracking />
        <Features />
        <ApiSection />
      </main>
    </>
  );
}
