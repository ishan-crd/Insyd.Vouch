import type { Metadata } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const display = Inter_Tight({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["italic", "normal"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Vouch — Instagram post metrics API",
  description:
    "Paste an Instagram post or reel link and Vouch tracks its views, likes, comments and shares every two hours. One API, a clean dashboard, $4 per 1,000 results.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
