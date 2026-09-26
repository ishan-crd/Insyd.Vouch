import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";

export default function Home() {
  return (
    <>
      <div className="page-light" />
      <Nav />
      <main style={{ position: "relative" }}>
        <Hero />
      </main>
    </>
  );
}
