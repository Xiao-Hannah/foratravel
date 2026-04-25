"use client";

import { useEffect, useMemo, useState } from "react";
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
  /** advisor has triggered at least one send action (text/instagram/copy) */
  interacted: boolean;
  /** has the advisor marked this contact as sent */
  sent: boolean;
  /** is the follow-up section expanded */
  followUpOpen: boolean;
};

type SavedSession = {
  answers: Answers | null;
  cards: Record<string, CardState>;
};

// v2: CardState.copied → CardState.interacted (persists once true).
const STORAGE_KEY = "fora.first-client-finder.v2";

const emptySession: SavedSession = { answers: null, cards: {} };

const EMPTY_CARD: CardState = {
  name: "",
  interacted: false,
  sent: false,
  followUpOpen: false,
};

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
          const current: CardState = prev.cards[id] ?? EMPTY_CARD;
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

  // Only one card may be expanded at a time. Tapping another collapses
  // the current; tapping the dim backdrop also collapses.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Lightweight toast (used by the Instagram action).
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ESC closes the expanded card.
  useEffect(() => {
    if (!expandedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedId]);

  // Lock body scroll while the modal is open (no double scrollbar, no
  // background drift on iOS).
  useEffect(() => {
    if (!expandedId) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [expandedId]);

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
        Each card represents a different kind of contact in your network. Tap
        a card to personalize and send the message.
      </p>

      <div className="mt-10 rule" />

      {/* Dim + blur backdrop while a card is expanded. The heavy
          backdrop-blur + opaque-ish ink wash hides the page so the
          centered modal is unambiguously in focus. */}
      {expandedId && (
        <button
          type="button"
          aria-label="Close expanded card"
          onClick={() => setExpandedId(null)}
          className="fixed inset-0 z-40 cursor-default bg-ink/70 backdrop-blur-md transition-opacity animate-fadeUp"
        />
      )}

      <ul className="mt-2 divide-y divide-ink/10">
        {archetypes.map((a) => (
          <ClientCard
            key={a.id}
            archetype={a}
            state={cards[a.id] ?? EMPTY_CARD}
            onChange={(updater) => onCardChange(a.id, updater)}
            isExpanded={expandedId === a.id}
            onToggleExpand={() =>
              setExpandedId((prev) => (prev === a.id ? null : a.id))
            }
            onCollapse={() => setExpandedId(null)}
            onToast={setToast}
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

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </section>
  );
}

// ----------------------------------------------------------------------------
// Card
// ----------------------------------------------------------------------------

const TIE_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  close: { label: "Close tie", color: "border-ink/30 text-ink", icon: "⭐" },
  weak: { label: "Weak tie", color: "border-coral/60 text-coral", icon: "💬" },
  broadcast: {
    label: "Broadcast",
    color: "border-taupe/60 text-taupe",
    icon: "📢",
  },
};

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Fallback for older browsers / non-secure contexts.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      // Give up silently.
    }
    document.body.removeChild(ta);
  }
}

function ClientCard({
  archetype,
  state,
  onChange,
  isExpanded,
  onToggleExpand,
  onCollapse,
  onToast,
}: {
  archetype: ReturnType<typeof recommend>[number];
  state: CardState;
  onChange: (updater: (prev: CardState) => CardState) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCollapse: () => void;
  onToast: (msg: string) => void;
}) {
  const filled = fillMessage(archetype.message, state.name);
  const tie = TIE_META[archetype.tie];

  // Templates without a {{name}} placeholder are broadcast posts — the
  // recipient name input is irrelevant and only adds noise.
  const usesName = archetype.message.includes("{{name}}");

  // Transient "Copied ✓" flash on the message preview when tapped.
  const [justCopied, setJustCopied] = useState(false);

  // Web Share API (`navigator.share`) opens the OS native share sheet with
  // the message pre-populated — same UX as sharing a video. Only render
  // the button when the API is actually available so we don't show a dead
  // affordance on desktop browsers without it.
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  function markInteracted() {
    onChange((p) => (p.interacted ? p : { ...p, interacted: true }));
  }

  async function handleCopyMessage() {
    await copyToClipboard(filled);
    markInteracted();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  }

  async function handleText() {
    await copyToClipboard(filled);
    markInteracted();
    // sms: scheme is the universal native-SMS handoff. Body must be encoded.
    window.location.href = `sms:?body=${encodeURIComponent(filled)}`;
  }

  async function handleEmail() {
    await copyToClipboard(filled);
    markInteracted();
    const subject = "Quick update from me";
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(filled)}`;
  }

  async function handleInstagram() {
    await copyToClipboard(filled);
    markInteracted();
    onToast(
      "Message copied — paste it in your DM when Instagram opens",
    );
    // Try the native app first; fall back to web after a short delay so the
    // toast remains visible if the protocol handler isn't registered.
    const webFallback = "https://www.instagram.com/direct/inbox/";
    const appUrl = "instagram://direct-inbox";
    const start = Date.now();
    const opened = window.open(appUrl, "_blank");
    setTimeout(() => {
      if (Date.now() - start < 1500) {
        if (opened) opened.location.href = webFallback;
        else window.open(webFallback, "_blank");
      }
    }, 700);
  }

  async function handleShare() {
    markInteracted();
    try {
      await navigator.share({ text: filled });
    } catch {
      // User cancelled or share failed — silently no-op. Clipboard is the
      // dedicated copy affordance, so we don't auto-copy here.
    }
  }

  return (
    <>
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

        {/* Tie badge with icon */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${tie.color}`}
        >
          <span aria-hidden>{tie.icon}</span>
          {tie.label}
        </span>

        <h3 className="mt-3 pr-12 font-display text-2xl font-normal leading-tight tracking-tightish text-ink sm:text-3xl">
          {archetype.name}
        </h3>
        <p className="mt-2 font-display text-base italic leading-snug text-ink/70 sm:text-lg">
          {archetype.why}
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={onToggleExpand}
            className="btn-reach"
            aria-expanded={isExpanded}
            aria-controls={`card-modal-${archetype.id}`}
          >
            {state.sent ? "Edit message" : "Reach out"}{" "}
            <span aria-hidden>→</span>
          </button>
        </div>
      </li>

      {/* Centered modal — fixed, scroll-locked, dismissible via X / Esc /
          backdrop click. The outer wrapper handles vertical centering and
          internal scroll if the body overflows. */}
      {isExpanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`card-modal-title-${archetype.id}`}
          id={`card-modal-${archetype.id}`}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          onClick={(e) => {
            // Click on the padding area (outside the panel) closes.
            if (e.target === e.currentTarget) onCollapse();
          }}
        >
          <div className="relative w-full max-w-lg animate-fadeUp rounded-cta bg-cream p-6 shadow-2xl ring-1 ring-ink/10 sm:p-8">
            {/* Close X — top right */}
            <button
              type="button"
              onClick={onCollapse}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>

            {/* Modal header — repeats badge + title for context */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${tie.color}`}
            >
              <span aria-hidden>{tie.icon}</span>
              {tie.label}
            </span>
            <h3
              id={`card-modal-title-${archetype.id}`}
              className="mt-3 pr-10 font-display text-2xl font-normal leading-tight tracking-tightish text-ink sm:text-3xl"
            >
              {archetype.name}
            </h3>
            <p className="mt-2 font-display text-base italic leading-snug text-ink/70 sm:text-lg">
              {archetype.why}
            </p>

            <div className="mt-5">
              {/* Why this person? — editorial pull-quote style */}
              <p className="border-l border-ink/30 pl-4 text-sm leading-relaxed text-ink/75">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
                  Why this person:{" "}
                </span>
                {archetype.rationale}
              </p>

              {/* Recipient name input — only shown for templates that
                  actually use {{name}}. Broadcast templates skip this. */}
              {usesName && (
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
                    autoFocus
                  />
                </label>
              )}

              {/* Message preview — click anywhere on it to copy. The
                  whole block is the copy target now (no separate Copy
                  button), with a hover hint and a transient "Copied ✓"
                  badge in the corner. */}
              <div className={usesName ? "mt-4" : "mt-6"}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="eyebrow">Message</p>
                  <span
                    aria-hidden
                    className={`text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                      justCopied ? "text-coral" : "text-ink/45"
                    }`}
                  >
                    {justCopied ? "Copied ✓" : "Tap to copy"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  aria-label="Copy message to clipboard"
                  className={`group relative block w-full border border-dashed p-4 text-left font-display text-base leading-relaxed text-ink transition sm:text-lg ${
                    justCopied
                      ? "border-coral bg-coral/10"
                      : "border-ink/25 bg-creamDeep/40 hover:border-ink/60 hover:bg-creamDeep/70"
                  }`}
                >
                  {filled}
                </button>
              </div>

              {/* Send options row */}
              <div className="mt-5">
                <p className="eyebrow mb-2">Send via</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleText}
                    className="btn-send"
                    aria-label="Open native SMS with message pre-filled"
                  >
                    <span aria-hidden className="text-base">📱</span> Text
                  </button>
                  <button
                    type="button"
                    onClick={handleEmail}
                    className="btn-send"
                    aria-label="Open email client with message pre-filled"
                  >
                    <span aria-hidden className="text-base">✉️</span> Email
                  </button>
                  <button
                    type="button"
                    onClick={handleInstagram}
                    className="btn-send"
                    aria-label="Copy message and open Instagram"
                  >
                    <span aria-hidden className="text-base">📸</span> Instagram
                  </button>
                  {canShare && (
                    <button
                      type="button"
                      onClick={handleShare}
                      className="btn-send"
                      aria-label="Open the system share sheet with the message pre-filled"
                    >
                      <span aria-hidden className="text-base">↗</span> Share
                    </button>
                  )}
                </div>
              </div>

              {/* Mark-as-sent */}
              <div className="mt-6">
                {state.interacted ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        onChange((p) => ({ ...p, sent: !p.sent }))
                      }
                      className={`w-full ${
                        state.sent ? "btn-outline" : "btn-primary"
                      }`}
                    >
                      {state.sent ? "Sent (undo)" : "Mark as sent"}
                    </button>
                    <p className="mt-2 text-center text-xs leading-relaxed text-ink/60">
                      Let us know you sent it so we can track your progress.
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onChange((p) => ({ ...p, sent: !p.sent }))
                    }
                    className="w-full btn-outline"
                  >
                    {state.sent ? "Sent (undo)" : "Mark as sent"}
                  </button>
                )}
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
                  <span
                    aria-hidden
                    className="font-display text-xl normal-case tracking-tightish text-ink/50"
                  >
                    {state.followUpOpen ? "−" : "+"}
                  </span>
                </button>
                {state.followUpOpen && (
                  <p className="mt-3 font-display text-base italic leading-relaxed text-ink/80">
                    {archetype.followUp}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------------------------------
// Toast
// ----------------------------------------------------------------------------

function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-sm items-start gap-3 rounded-cta border border-ink/15 bg-ink px-4 py-3 text-sm leading-snug text-cream shadow-lg animate-fadeUp"
    >
      <span aria-hidden className="mt-0.5">📋</span>
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-cream/70 transition hover:text-cream"
      >
        ×
      </button>
    </div>
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
