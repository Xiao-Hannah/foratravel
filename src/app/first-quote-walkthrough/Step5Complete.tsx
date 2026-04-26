"use client";

import { Check } from "lucide-react";
import { fmtMoney } from "./data";

type Props = {
  earnings: number;
  onRestart: () => void;
};

export function Step5Complete({ earnings, onRestart }: Props) {
  return (
    <div className="pt-[60px] pb-16 text-center">
      {/* Animated check */}
      <div className="check-pop mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-8 bg-success">
        <Check size={44} strokeWidth={3} className="text-white" />
      </div>

      <h1 className="text-[28px] font-bold leading-tight">
        Your quote is on its way.
      </h1>
      <p className="text-wtMuted text-sm mt-3 mb-8 max-w-md mx-auto">
        You just did what most new advisors take weeks to do.
      </p>

      <div className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70 max-w-[400px] mx-auto">
        <p className="text-xs text-wtMuted">
          Estimated earnings from this booking
        </p>
        <p className="text-[48px] font-bold text-earn leading-none my-2">
          {fmtMoney(earnings)}
        </p>
        <p className="text-xs text-wtMuted">Paid after trip completion</p>
      </div>

      <WhatHappensNext />

      <div className="max-w-[400px] mx-auto mt-8 space-y-3">
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3 rounded-md font-semibold text-white text-sm bg-brown hover:bg-brownHover transition-colors"
        >
          Send another quote →
        </button>
      </div>

      <p className="text-xs text-wtMuted mt-8">
        Questions? Sidekick is always available in your Portal.
      </p>
    </div>
  );
}

const NEXT_STEPS: { title: string; body: string }[] = [
  {
    title: "Client confirms",
    body: "Once your client approves the quote, the booking is locked in.",
  },
  {
    title: "Trip completes",
    body: "Your commission is released after the trip\u2019s end date.",
  },
  {
    title: "You get paid",
    body: "Payment hits your account within 7\u201310 business days. Track it anytime in your Portal.",
  },
];

function WhatHappensNext() {
  return (
    <section
      aria-label="What happens next"
      className="max-w-[400px] mx-auto mt-8 text-left bg-wtBg rounded-xl border border-wtBorder/70 p-5"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-wtMuted mb-4">
        What happens next
      </h2>
      <ol className="space-y-4">
        {NEXT_STEPS.map((s, i) => {
          const isLast = i === NEXT_STEPS.length - 1;
          return (
            <li key={s.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-brown bg-wtCard text-[10px] font-bold text-brown shrink-0">
                  {i + 1}
                </span>
                {!isLast && (
                  <span
                    aria-hidden
                    className="flex-1 w-px bg-wtBorder mt-1 min-h-[20px]"
                  />
                )}
              </div>
              <div className="pb-1">
                <p className="text-sm font-semibold text-ink leading-tight">
                  Step {i + 1} &mdash; {s.title}
                </p>
                <p className="text-xs text-wtMuted leading-relaxed mt-1">
                  {s.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
