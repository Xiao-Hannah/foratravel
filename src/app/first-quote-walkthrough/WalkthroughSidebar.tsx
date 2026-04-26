"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { STEP_NAMES } from "./data";

type Props = {
  /** Current step (1-indexed). */
  currentStep: number;
  /** Jump to a previous step. Steps after the current one stay locked. */
  onGoTo?: (step: number) => void;
  /** Optional small helper text shown under the step list. */
  hint?: string;
  /** Primary action (e.g. "Continue", "Send Quote"). Hidden if omitted. */
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onCta?: () => void;
  /** When true, render the CTA as a Link to "/" (used on the final step). */
  ctaHref?: string;
  onCtaHrefClick?: () => void;
  /** Optional contextual notice rendered just below the panel. */
  notice?: ReactNode;
};

/**
 * Persistent walkthrough panel. Shown on every step so the user always
 * knows where they are and can advance from a single, predictable place.
 */
export function WalkthroughSidebar({
  currentStep,
  onGoTo,
  hint,
  ctaLabel,
  ctaDisabled,
  onCta,
  ctaHref,
  onCtaHrefClick,
  notice,
}: Props) {
  return (
    <aside className="lg:w-72 lg:sticky lg:top-6 lg:shrink-0">
      <div className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70">
        <div className="flex items-baseline justify-between mb-1">
          <h4 className="font-bold text-sm">Walkthrough</h4>
          <span className="text-xs text-wtMuted">
            Step {currentStep} of {STEP_NAMES.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-wtBorder rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-brown transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / STEP_NAMES.length) * 100}%` }}
          />
        </div>

        <ol className="space-y-2 text-sm">
          {STEP_NAMES.map((name, i) => {
            const stepNum = i + 1;
            const status =
              stepNum < currentStep
                ? "done"
                : stepNum === currentStep
                  ? "current"
                  : "upcoming";
            const clickable = status === "done" && !!onGoTo;
            const content = (
              <>
                <span
                  className={cn(
                    "mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 text-[10px] font-bold",
                    status === "done" && "border-success bg-success text-white",
                    status === "current" && "border-brown bg-brown text-white",
                    status === "upcoming" && "border-wtBorder text-wtMuted",
                  )}
                >
                  {status === "done" ? (
                    <Check size={11} strokeWidth={3} />
                  ) : (
                    stepNum
                  )}
                </span>
                <span
                  className={cn(
                    status === "current" && "font-semibold text-ink",
                    status === "done" && "text-ink",
                    status === "upcoming" && "text-wtMuted",
                    clickable && "group-hover:text-brown group-hover:underline",
                  )}
                >
                  {name}
                </span>
              </>
            );
            return (
              <li key={name}>
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => onGoTo!(stepNum)}
                    className="group flex items-start gap-2.5 w-full text-left rounded-md py-1 px-1 -mx-1 hover:bg-wtMutedBg transition-colors cursor-pointer"
                  >
                    {content}
                  </button>
                ) : (
                  <div className="flex items-start gap-2.5 py-1 px-1 -mx-1">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {hint && (
          <p className="text-xs text-wtMuted mt-4 leading-relaxed">{hint}</p>
        )}

        {ctaHref ? (
          <Link
            href={ctaHref}
            onClick={onCtaHrefClick}
            className="mt-5 block text-center w-full text-sm font-semibold py-2.5 rounded-md bg-brown hover:bg-brownHover text-white transition-colors"
          >
            {ctaLabel ?? "Continue"}
          </Link>
        ) : ctaLabel ? (
          <button
            type="button"
            onClick={onCta}
            disabled={ctaDisabled}
            className={cn(
              "mt-5 w-full text-sm font-semibold py-2.5 rounded-md transition-colors",
              ctaDisabled
                ? "bg-wtMutedBg text-wtMuted cursor-not-allowed"
                : "bg-brown hover:bg-brownHover text-white",
            )}
          >
            {ctaLabel}
          </button>
        ) : null}
      </div>
      {notice && <div className="mt-4">{notice}</div>}
    </aside>
  );
}
