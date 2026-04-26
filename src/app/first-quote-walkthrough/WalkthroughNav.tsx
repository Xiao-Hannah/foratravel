"use client";

import Link from "next/link";
import { STEP_NAMES } from "./data";

type Props = {
  /** Current step (1-indexed). Step 1 shows "All tools"; later steps offer "Back". */
  currentStep: number;
  /** Called when the user clicks "All tools" on step 1 to clear session state. */
  onExit: () => void;
  /** Called when the user clicks the in-walkthrough back link. */
  onBack: () => void;
};

/**
 * Top-of-walkthrough nav. On the welcome screen (step 0) it leads back to
 * the tools index; on later steps it walks the user back one step at a time.
 */
export function WalkthroughNav({ currentStep, onExit, onBack }: Props) {
  const isWelcome = currentStep <= 0;
  return (
    <nav className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-wtMuted">
      {isWelcome ? (
        <Link
          href="/"
          onClick={onExit}
          className="inline-flex items-center gap-2 transition hover:text-ink"
        >
          <span aria-hidden>←</span> All tools
        </Link>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 transition hover:text-ink cursor-pointer"
        >
          <span aria-hidden>←</span>
          {currentStep === 1
            ? "Back to welcome"
            : `Back to ${STEP_NAMES[currentStep - 2]}`}
        </button>
      )}
      <span>Tool 02</span>
    </nav>
  );
}
