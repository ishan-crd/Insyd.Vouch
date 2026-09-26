"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

export function CountUp({ to, duration = 1.6 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (node.textContent = Math.round(v).toLocaleString("en-US")),
    });
    return () => controls.stop();
  }, [inView, to, duration]);
  return <span ref={ref}>0</span>;
}
