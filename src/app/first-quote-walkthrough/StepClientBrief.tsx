"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type BudgetTier,
  type ClientBrief,
  budgetOptions,
  isHighEndBrief,
} from "./data";

type Props = {
  brief: ClientBrief;
  onChange: (patch: Partial<ClientBrief>) => void;
  /** Submit the brief and move forward to the property search. */
  onSubmit: () => void;
  /** Skip the brief entirely (e.g. client hasn't decided). */
  onSkip: () => void;
};

/**
 * The Client Brief — captures destination / dates / guests / budget so we
 * can pre-filter the property search and pre-fill Step 4. The advisor can
 * also tick a checkbox to skip the form entirely if they're just exploring.
 */
export function StepClientBrief({ brief, onChange, onSubmit, onSkip }: Props) {
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const showHighEndNudge =
    !nudgeDismissed && !brief.undecided && isHighEndBrief(brief);

  const today = new Date().toISOString().slice(0, 10);
  const datesInOrder =
    !brief.startDate ||
    !brief.endDate ||
    new Date(brief.endDate).getTime() > new Date(brief.startDate).getTime();

  // Either the user fills in at least a destination, OR opts out via the
  // "hasn't decided" checkbox. Keeps the CTA enabled for the common cases.
  const canContinue = brief.undecided || brief.destination.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    if (brief.undecided) onSkip();
    else onSubmit();
  }

  return (
    <div className="max-w-xl mx-auto fade-up">
      <h1 className="text-2xl font-bold mb-1 leading-tight">
        First, tell us about your client&rsquo;s trip.
      </h1>
      <p className="text-sm text-wtMuted mb-6">
        This helps us show you the right properties and perks.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70 space-y-5"
      >
        <Field label="Destination">
          <input
            type="text"
            value={brief.destination}
            onChange={(e) => onChange({ destination: e.target.value })}
            placeholder="e.g. Amalfi Coast, Italy"
            className="w-full px-3 py-2 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
            disabled={brief.undecided}
          />
        </Field>

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Check-in">
              <input
                type="date"
                value={brief.startDate}
                min={today}
                max={brief.endDate || undefined}
                onChange={(e) => onChange({ startDate: e.target.value })}
                disabled={brief.undecided}
                className={cn(
                  "w-full px-3 py-2 rounded-md border bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40",
                  !datesInOrder ? "border-reserve" : "border-wtBorder",
                )}
              />
            </Field>
            <Field label="Check-out">
              <input
                type="date"
                value={brief.endDate}
                min={brief.startDate || today}
                onChange={(e) => onChange({ endDate: e.target.value })}
                disabled={brief.undecided}
                className={cn(
                  "w-full px-3 py-2 rounded-md border bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40",
                  !datesInOrder ? "border-reserve" : "border-wtBorder",
                )}
              />
            </Field>
          </div>
          {!datesInOrder && (
            <p className="text-xs text-earn mt-2 font-medium">
              Check-out must be after check-in.
            </p>
          )}
        </div>

        <Field label="Number of guests">
          <input
            type="number"
            min={1}
            value={brief.guests}
            onChange={(e) =>
              onChange({
                guests: Math.max(1, parseInt(e.target.value, 10) || 1),
              })
            }
            disabled={brief.undecided}
            className="w-full px-3 py-2 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
          />
        </Field>

        <Field label="Budget per night">
          <select
            value={brief.budget}
            onChange={(e) =>
              onChange({ budget: e.target.value as BudgetTier })
            }
            disabled={brief.undecided}
            className="w-full px-3 py-2 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
          >
            {budgetOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Any special preferences? (optional)">
          <input
            type="text"
            value={brief.preferences}
            onChange={(e) => onChange({ preferences: e.target.value })}
            placeholder="e.g. honeymoon, ocean view, kid-friendly"
            disabled={brief.undecided}
            className="w-full px-3 py-2 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
          />
        </Field>

        {/* High-end soft nudge — appears when the brief edges into luxury
            territory. Dismissible, non-blocking, surfaces between the form
            and the CTA so it's noticed without interrupting the flow. */}
        {showHighEndNudge && (
          <div className="relative rounded-lg p-4 pr-10 bg-tipBg border-l-[3px] border-brown">
            <div className="flex gap-2 items-start text-sm text-ink/90">
              <span aria-hidden>✨</span>
              <p>
                <span className="font-semibold">New to luxury bookings?</span>{" "}
                Fora has a training on booking high-end properties.{" "}
                <a
                  href="https://advisor.fora.travel/training/luxury"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-brown"
                >
                  Watch 10-min training →
                </a>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNudgeDismissed(true)}
              aria-label="Dismiss"
              className="absolute top-3 right-3 text-wtMuted hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <label className="flex items-start gap-2.5 pt-2 border-t border-wtBorder/70 cursor-pointer">
          <input
            type="checkbox"
            checked={brief.undecided}
            onChange={(e) => onChange({ undecided: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-brown cursor-pointer"
          />
          <span className="text-sm text-ink/85 leading-snug">
            My client hasn&rsquo;t decided on details yet
            <span className="block text-xs text-wtMuted mt-0.5">
              Skip this step and browse all properties without filters.
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={!canContinue || !datesInOrder}
          className={cn(
            "w-full text-sm font-semibold py-3 rounded-md transition-colors",
            !canContinue || !datesInOrder
              ? "bg-wtMutedBg text-wtMuted cursor-not-allowed"
              : "bg-brown hover:bg-brownHover text-white",
          )}
        >
          Find the right property →
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink/80 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
