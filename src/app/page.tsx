import { ApiSection } from "@/components/landing/api-section";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FieldsMarquee } from "@/components/landing/fields-marquee";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { How } from "@/components/landing/how";
import { Nav } from "@/components/landing/nav";
import { Pricing } from "@/components/landing/pricing";
import { Tracking } from "@/components/landing/tracking";
import { UseCases } from "@/components/landing/use-cases";

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
        <Pricing />
        <UseCases />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
