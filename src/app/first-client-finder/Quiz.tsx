"use client";

import {
  Answers,
  Background,
  Network,
  OutreachStyle,
  Specialty,
  backgroundOptions,
  networkOptions,
  outreachStyleOptions,
  specialtyOptions,
} from "./data";

const QUIZ_STEPS: {
  key: keyof Answers;
  question: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "background",
    question: "What's your professional background?",
    options: backgroundOptions,
  },
  {
    key: "network",
    question: "Where is most of your network?",
    options: networkOptions,
  },
  {
    key: "specialty",
    question: "What type of travel do you know best?",
    options: specialtyOptions,
  },
  {
    key: "outreachStyle",
    question: "How do you want to reach your first clients?",
    options: outreachStyleOptions,
  },
];

export const QUIZ_TOTAL_STEPS = QUIZ_STEPS.length;

export default function Quiz({
  step,
  draft,
  onAnswer,
  onBack,
}: {
  step: number;
  draft: Partial<Answers>;
  onAnswer: (patch: Partial<Answers>, isFinal: boolean) => void;
  onBack: () => void;
}) {
  const config = QUIZ_STEPS[step];
  const total = QUIZ_STEPS.length;
  const selected = draft[config.key] as string | undefined;

  function pick(value: string) {
    const isFinal = step === total - 1;
    const patch = {
      [config.key]: value as
        | Background
        | Network
        | Specialty
        | OutreachStyle,
    } as Partial<Answers>;
    onAnswer(patch, isFinal);
  }

  return (
    <section key={step} className="animate-slideIn">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 transition hover:text-ink"
            aria-label="Back"
          >
            <span aria-hidden>←</span> Back
          </button>
          <span className="font-display text-base normal-case tracking-tightish text-ink/70">
            <span className="text-ink">{step + 1}</span>
            <span className="mx-1 text-ink/30">/</span>
            {total}
          </span>
        </div>
        <div className="mt-4 h-px w-full bg-ink/15">
          <div
            className="h-full bg-ink transition-[width] duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <p className="eyebrow">Question {step + 1}</p>
      <h2 className="mt-3 font-display text-3xl font-normal leading-tight tracking-tightish text-ink sm:text-[40px]">
        {config.question}
      </h2>

      <ul className="mt-8 grid gap-3">
        {config.options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => pick(opt.value)}
                aria-pressed={isSelected}
                className={`group flex w-full items-center justify-between gap-4 border px-5 py-4 text-left text-base transition active:scale-[0.995] ${
                  isSelected
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/20 bg-cream text-ink hover:border-ink hover:bg-creamDeep"
                }`}
              >
                <span className="font-display text-lg leading-snug tracking-tightish">
                  {opt.label}
                </span>
                <span
                  aria-hidden
                  className={`text-xs uppercase tracking-[0.16em] transition ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  →
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
