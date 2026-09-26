import { FieldsMarquee } from "@/components/landing/fields-marquee";
import { Hero } from "@/components/landing/hero";
import { How } from "@/components/landing/how";
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
      </main>
    </>
  );
}
