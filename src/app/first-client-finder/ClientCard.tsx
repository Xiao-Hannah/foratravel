"use client";

import { useEffect, useState } from "react";
import { fillMessage, recommend } from "./data";
import { CardState } from "./session";
import { copyToClipboard } from "./clipboard";

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

export default function ClientCard({
  archetype,
  state,
  onChange,
  isExpanded,
  onToggleExpand,
  onCollapse,
  onToast,
  onLogSent,
  onLogUndo,
}: {
  archetype: ReturnType<typeof recommend>[number];
  state: CardState;
  onChange: (updater: (prev: CardState) => CardState) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCollapse: () => void;
  onToast: (msg: string) => void;
  onLogSent: (args: {
    archetypeId: string;
    archetypeName: string;
    recipientName: string;
    message: string;
  }) => void;
  onLogUndo: (archetypeId: string) => void;
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

  function toggleSent() {
    // Side-effects (logging) must run OUTSIDE the state updater. React may
    // invoke updater functions multiple times (e.g. Strict Mode) and running
    // a `setState` from another component inside one would trigger the
    // "Cannot update a component while rendering a different component"
    // warning.
    const willBeSent = !state.sent;
    if (willBeSent) {
      onLogSent({
        archetypeId: archetype.id,
        archetypeName: archetype.name,
        recipientName: state.name,
        message: filled,
      });
    } else {
      onLogUndo(archetype.id);
    }
    onChange((p) => ({ ...p, sent: willBeSent }));
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
                      onClick={toggleSent}
                      className={`w-full ${
                        state.sent ? "btn-outline" : "btn-primary"
                      }`}
                    >
                      {state.sent ? "Sent (undo)" : "Mark as sent"}
                    </button>
                    <p className="mt-2 text-center text-xs leading-relaxed text-ink/60">
                      We&rsquo;ll add this to your outreach log so you can
                      follow up later.
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={toggleSent}
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
