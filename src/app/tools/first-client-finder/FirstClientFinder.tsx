"use client";

import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/usePersistentState";
import {
  Answers,
  Background,
  Network,
  Specialty,
  backgroundOptions,
  fillMessage,
  networkOptions,
  recommend,
  specialtyOptions,
} from "./data";

type Stage = "intro" | "quiz" | "results";

type CardState = {
  /** recipient name input, drives the live template fill */
  name: string;
  /** has the message been copied at least once */
  copied: boolean;
  /** has the advisor marked this contact as sent */
  sent: boolean;
  /** is the follow-up section expanded */
  followUpOpen: boolean;
};

type SavedSession = {
  answers: Answers | null;
  cards: Record<string, CardState>;
};

const STORAGE_KEY = "fora.first-client-finder.v1";

const emptySession: SavedSession = { answers: null, cards: {} };

export default function FirstClientFinder() {
  const [session, setSession, hydrated] = usePersistentState<SavedSession>(
    STORAGE_KEY,
    emptySession,
  );

  // Stage is derived but allowed to override (e.g. user clicks "Start over").
  const [stageOverride, setStageOverride] = useState<Stage | null>(null);
  const stage: Stage =
    stageOverride ??
    (session.answers ? "results" : hydrated ? "intro" : "intro");

  // Quiz local state (only relevant during quiz stage)
  const [quizStep, setQuizStep] = useState(0);
  const [draft, setDraft] = useState<Partial<Answers>>({});

  function startQuiz() {
    setDraft({});
    setQuizStep(0);
    setStageOverride("quiz");
  }

  function completeQuiz(final: Answers) {
    setSession({ answers: final, cards: {} });
    setStageOverride("results");
  }

  function reset() {
    setSession(emptySession);
    setDraft({});
    setQuizStep(0);
    setStageOverride("intro");
  }

  if (stage === "intro") {
    return <Intro onStart={startQuiz} hasSavedSession={!!session.answers} />;
  }

  if (stage === "quiz") {
    return (
      <Quiz
        step={quizStep}
        draft={draft}
        onAnswer={(patch, isFinal) => {
          const next = { ...draft, ...patch };
          setDraft(next);
          if (isFinal) {
            completeQuiz(next as Answers);
          } else {
            setQuizStep((s) => s + 1);
          }
        }}
        onBack={() => {
          if (quizStep === 0) {
            setStageOverride("intro");
          } else {
            setQuizStep((s) => s - 1);
          }
        }}
      />
    );
  }

  // results
  return (
    <Results
      answers={session.answers!}
      cards={session.cards}
      onCardChange={(id, updater) =>
        setSession((prev) => {
          const current: CardState =
            prev.cards[id] ??
            { name: "", copied: false, sent: false, followUpOpen: false };
          return {
            ...prev,
            cards: { ...prev.cards, [id]: updater(current) },
          };
        })
      }
      onReset={reset}
    />
  );
}

// ----------------------------------------------------------------------------
// Intro
// ----------------------------------------------------------------------------

function Intro({
  onStart,
  hasSavedSession,
}: {
  onStart: () => void;
  hasSavedSession: boolean;
}) {
  return (
    <section className="animate-fadeUp">
      <p className="eyebrow">A field guide</p>
      <h1 className="mt-5 font-display text-5xl font-normal leading-[0.95] tracking-tighter2 text-ink sm:text-6xl">
        Find your first
        <br />
        <span className="italic">three clients.</span>
      </h1>

      <p className="mt-6 max-w-md text-base leading-relaxed text-ink/75 sm:text-lg">
        Most new advisors don't lack potential clients. They just don't
        recognize them. Answer three quick questions and we'll show you
        exactly who to message first, in words that sound like you.
      </p>

      {/* Sample card preview so the value is visible BEFORE the quiz. */}
      <figure className="relative mt-10 border-l-2 border-ink/80 pl-6">
        <p className="eyebrow">Example outreach</p>
        <p className="mt-3 font-display text-xl leading-snug tracking-tightish text-ink sm:text-2xl">
          The friend who just got engaged.
        </p>
        <blockquote className="mt-3 font-display text-base italic leading-relaxed text-ink/80 sm:text-lg">
          &ldquo;Hi Sam, congrats again on the engagement! Quick update on my
          end: I recently joined Fora as a travel advisor. If you haven&rsquo;t
          booked your honeymoon yet, I&rsquo;d be happy to put a couple of
          options together.&rdquo;
        </blockquote>
      </figure>

      <div className="mt-12">
        <button type="button" onClick={onStart} className="btn-primary w-full sm:w-auto">
          {hasSavedSession ? "Start over" : "Begin (60 seconds)"}
        </button>
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-ink/55">
          No login · Nothing leaves your device
        </p>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Quiz
// ----------------------------------------------------------------------------

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
];

function Quiz({
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
    const patch = { [config.key]: value as Background | Network | Specialty } as Partial<Answers>;
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

// ----------------------------------------------------------------------------
// Results
// ----------------------------------------------------------------------------

function Results({
  answers,
  cards,
  onCardChange,
  onReset,
}: {
  answers: Answers;
  cards: Record<string, CardState>;
  onCardChange: (id: string, updater: (prev: CardState) => CardState) => void;
  onReset: () => void;
}) {
  const archetypes = useMemo(() => recommend(answers), [answers]);
  const sentCount = archetypes.filter((a) => cards[a.id]?.sent).length;
  const allSent = sentCount === archetypes.length;

  return (
    <section className="animate-fadeUp">
      <p className="eyebrow">Your starter list</p>
      <h1 className="mt-4 font-display text-4xl font-normal leading-[1.02] tracking-tighter2 text-ink sm:text-[56px]">
        Three people.
        <br />
        Three messages.
        <br />
        <span className="italic">Today.</span>
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-ink/75">
        Each card represents a different kind of contact in your network. Fill
        in a name, copy the message, and reach out.
      </p>

      <div className="mt-10 rule" />

      <ul className="mt-2 divide-y divide-ink/10">
        {archetypes.map((a) => (
          <ClientCard
            key={a.id}
            archetype={a}
            state={
              cards[a.id] ?? {
                name: "",
                copied: false,
                sent: false,
                followUpOpen: false,
              }
            }
            onChange={(updater) => onCardChange(a.id, updater)}
          />
        ))}
      </ul>

      <Tracker count={sentCount} total={archetypes.length} allSent={allSent} />

      <div className="mt-12 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/60 underline-offset-4 transition hover:text-ink hover:underline"
        >
          Start over
        </button>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Card
// ----------------------------------------------------------------------------

const TIE_LABELS: Record<string, { label: string; color: string }> = {
  close: { label: "Close tie", color: "border-ink/30 text-ink" },
  weak: { label: "Weak tie", color: "border-coral/60 text-coral" },
  broadcast: { label: "Broadcast", color: "border-taupe/60 text-taupe" },
};

function ClientCard({
  archetype,
  state,
  onChange,
}: {
  archetype: ReturnType<typeof recommend>[number];
  state: CardState;
  onChange: (updater: (prev: CardState) => CardState) => void;
}) {
  const filled = fillMessage(archetype.message, state.name);
  const tie = TIE_LABELS[archetype.tie];

  async function copy() {
    try {
      await navigator.clipboard.writeText(filled);
    } catch {
      // Fallback: select text via a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = filled;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // Give up silently.
      }
      document.body.removeChild(ta);
    }
    onChange((p) => ({ ...p, copied: true }));
    setTimeout(() => onChange((p) => ({ ...p, copied: false })), 2000);
  }

  return (
    <li
      className={`relative py-8 transition ${
        state.sent ? "opacity-95" : ""
      }`}
    >
      {/* Sent overlay checkmark */}
      {state.sent && (
        <span
          aria-hidden
          className="absolute right-0 top-7 flex h-8 w-8 animate-pop items-center justify-center rounded-full bg-ink text-cream"
        >
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 10.5l4 4 8-9" />
          </svg>
        </span>
      )}

      <span
        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${tie.color}`}
      >
        {tie.label}
      </span>

      <h3 className="mt-3 pr-12 font-display text-2xl font-normal leading-tight tracking-tightish text-ink sm:text-3xl">
        {archetype.name}
      </h3>
      <p className="mt-2 font-display text-base italic leading-snug text-ink/70 sm:text-lg">
        {archetype.why}
      </p>

      {/* Why this person? — editorial pull-quote style */}
      <p className="mt-4 border-l border-ink/30 pl-4 text-sm leading-relaxed text-ink/75">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
          Why this person:{" "}
        </span>
        {archetype.rationale}
      </p>

      {/* Recipient name input */}
      <label className="mt-6 block">
        <span className="eyebrow">Who are you sending this to?</span>
        <input
          type="text"
          value={state.name}
          onChange={(e) =>
            onChange((p) => ({ ...p, name: e.target.value }))
          }
          placeholder="First name"
          className="input-editorial mt-3"
        />
      </label>

      {/* Message preview */}
      <div className="mt-4 border border-dashed border-ink/25 bg-creamDeep/40 p-4 font-display text-base leading-relaxed text-ink sm:text-lg">
        {filled}
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={copy}
          className={`flex-1 ${state.copied ? "btn-taupe" : "btn-outline"}`}
        >
          {state.copied ? "Copied ✓" : "Copy message"}
        </button>
        <button
          type="button"
          onClick={() =>
            onChange((p) => ({ ...p, sent: !p.sent }))
          }
          className={`flex-1 ${state.sent ? "btn-outline" : "btn-primary"}`}
        >
          {state.sent ? "Sent (undo)" : "Mark as sent"}
        </button>
      </div>

      {/* Follow-up disclosure */}
      <div className="mt-6 border-t border-ink/10 pt-4">
        <button
          type="button"
          onClick={() =>
            onChange((p) => ({ ...p, followUpOpen: !p.followUpOpen }))
          }
          className="flex w-full items-center justify-between text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70 transition hover:text-ink"
          aria-expanded={state.followUpOpen}
        >
          <span>What to say if they reply</span>
          <span aria-hidden className="font-display text-xl normal-case tracking-tightish text-ink/50">
            {state.followUpOpen ? "−" : "+"}
          </span>
        </button>
        {state.followUpOpen && (
          <p className="mt-3 font-display text-base italic leading-relaxed text-ink/80">
            {archetype.followUp}
          </p>
        )}
      </div>
    </li>
  );
}

// ----------------------------------------------------------------------------
// Tracker
// ----------------------------------------------------------------------------

function Tracker({
  count,
  total,
  allSent,
}: {
  count: number;
  total: number;
  allSent: boolean;
}) {
  return (
    <div className="mt-12 border-t border-ink/15 pt-8">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">Progress</p>
        <p className="font-display text-2xl tracking-tightish text-ink">
          <span className="text-ink">{count}</span>
          <span className="mx-1 text-ink/30">/</span>
          <span className="text-ink/50">{total}</span>
        </p>
      </div>
      <p className="mt-2 font-display text-xl leading-snug tracking-tightish text-ink/80 sm:text-2xl">
        {count === 0
          ? "Three conversations away from your first booking."
          : count < total
          ? `${total - count} ${total - count === 1 ? "message" : "messages"} to go.`
          : "You've started three conversations."}
      </p>
      <div className="mt-5 h-px w-full bg-ink/15">
        <div
          className="h-full bg-ink transition-[width] duration-500"
          style={{ width: `${(count / total) * 100}%` }}
        />
      </div>
      {allSent && (
        <p className="mt-6 animate-fadeUp font-display text-lg italic leading-relaxed text-ink">
          Every Fora advisor began exactly here.
        </p>
      )}
    </div>
  );
}
