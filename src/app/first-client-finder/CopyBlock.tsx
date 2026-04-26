"use client";

import { useEffect, useState } from "react";
import { copyToClipboard } from "./clipboard";

type Props = {
  /** The plain-text content shown in the block and copied to the clipboard. */
  text: string;
  /** Optional label above the block (e.g. "Template"). */
  label?: string;
};

/**
 * A monospaced template block with a Copy button. Used by the destination
 * guide and hotel review pages so advisors can pull a starter template into
 * their own draft without leaving the tool.
 */
export default function CopyBlock({ text, label }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">{label ?? "Template"}</span>
        <button
          type="button"
          onClick={async () => {
            await copyToClipboard(text);
            setCopied(true);
          }}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition hover:text-coral"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="mt-2 whitespace-pre-wrap break-words border border-ink/15 bg-white p-5 font-mono text-[13px] leading-relaxed text-ink/85">
        {text}
      </pre>
    </div>
  );
}
