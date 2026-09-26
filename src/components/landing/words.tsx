import { Fragment, type ReactNode } from "react";

/** Splits text into masked words that rise in one after another. `serif` words are set in italic. */
export function Words({ text, start = 0, step = 55, serif }: { text: string; start?: number; step?: number; serif?: boolean }) {
  const words = text.split(" ").map((word, i) => ({ word, key: `${i}-${word}`, delay: start + i * step }));
  return (
    <>
      {words.map(({ word, key, delay }) => (
        <Fragment key={key}>
          <span className="w">
            <span className={serif ? "serif" : undefined} style={{ animationDelay: `${delay}ms` }}>
              {word}
            </span>
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

export function Rise({ delay, children, className }: { delay: number; children: ReactNode; className?: string }) {
  return (
    <div className={`rise ${className ?? ""}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
