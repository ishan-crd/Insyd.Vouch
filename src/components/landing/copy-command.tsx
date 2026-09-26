"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyCommand({ command, display }: { command: string; display?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="cmd">
      <span className="cmd-prompt">$</span>
      <code className="cmd-text">{display ?? command}</code>
      <span className="caret" aria-hidden />
      <button
        className="cmd-copy"
        aria-label="Copy command"
        onClick={() => {
          navigator.clipboard.writeText(command);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
