"use client";

import { STEP_NAMES } from "./data";

type Props = {
  /** Current step (1-indexed). Step 0 is the welcome screen with no back link. */
  currentStep: number;
  /** Called when the user clicks the in-walkthrough back link. */
  onBack: () => void;
};

/**
 * Top-of-walkthrough nav. The welcome screen (step 0) has no back link
 * because the global header already offers "All tools". From step 1 onward
 * we walk the user back one step at a time.
 */
export function WalkthroughNav({ currentStep, onBack }: Props) {
  const isWelcome = currentStep <= 0;
  return (
    <nav className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-wtMuted">
      {isWelcome ? (
        <span aria-hidden />
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
