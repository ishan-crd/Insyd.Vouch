import { Fragment, type ReactNode } from "react";

/** Splits text into masked words that rise in one after another. `serif` words are set in italic. */
export function Words({ text, start = 0, step = 55, serif }: { text: string; start?: number; step?: number; serif?: boolean }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          <span className="w">
            <span className={serif ? "serif" : undefined} style={{ animationDelay: `${start + i * step}ms` }}>
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
