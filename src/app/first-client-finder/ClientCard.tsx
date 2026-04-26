"use client";

import { useEffect, useState } from "react";
import { fillMessage, recommend } from "./data";
import { CardState } from "./session";
import { copyToClipboard } from "./clipboard";

const TIE_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  // Friendlier, plain-English labels. The internal keys (close/weak/broadcast)
  // are kept so the recommendation logic stays unchanged.
  close: {
    label: "People close to you",
    color: "border-ink/30 text-ink",
    icon: "⭐",
  },
  weak: {
    label: "People in your wider circle",
    color: "border-taupe/60 text-taupe",
    icon: "💬",
  },
  broadcast: {
    label: "Your broader audience",
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

  // Email handoff is unreliable on macOS when the user doesn't use Mail.app
  // (mailto: either silently fails or pops a system prompt to pick a default).
  // Showing a small chooser — Default mail / Gmail / Outlook — lets users
  // open their actual mail tool with the body pre-filled.
  const [emailMenuOpen, setEmailMenuOpen] = useState(false);
  useEffect(() => {
    if (!emailMenuOpen) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest("[data-email-menu]")) {
        setEmailMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setEmailMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [emailMenuOpen]);

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
    // Use a temporary anchor click instead of `window.location.href = mailto:`.
    // Some browsers (notably mobile Safari and certain in-app webviews) will
    // either ignore the assignment or navigate the page away from the tool.
    // A click on a same-tab anchor reliably hands the URL to the OS protocol
    // handler, which opens the native mail composer with the body pre-filled.
    const href = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(filled)}`;
    const a = document.createElement("a");
    a.href = href;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleEmailGmail() {
    await copyToClipboard(filled);
    markInteracted();
    const subject = "Quick update from me";
    // Gmail web compose URL — works on macOS/Windows for anyone signed into
    // Gmail in the browser, no default-mail-app config required.
    const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(filled)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setEmailMenuOpen(false);
  }

  async function handleEmailOutlook() {
    await copyToClipboard(filled);
    markInteracted();
    const subject = "Quick update from me";
    // Outlook web compose — works for outlook.com / Microsoft 365 users.
    const url = `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(filled)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setEmailMenuOpen(false);
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
                  <div className="relative" data-email-menu>
                    <button
                      type="button"
                      onClick={() => setEmailMenuOpen((v) => !v)}
                      className="btn-send"
                      aria-haspopup="menu"
                      aria-expanded={emailMenuOpen}
                      aria-label="Choose how to send by email"
                    >
                      <span aria-hidden className="text-base">✉️</span> Email
                      <span aria-hidden className="ml-1 text-xs opacity-60">▾</span>
                    </button>
                    {emailMenuOpen && (
                      <div
                        role="menu"
                        className="absolute left-0 top-full z-20 mt-1 w-56 border border-ink/20 bg-cream shadow-lg"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setEmailMenuOpen(false);
                            void handleEmail();
                          }}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-creamDeep/60"
                        >
                          Default mail app
                          <span className="block text-xs text-taupe">
                            Apple Mail, Outlook desktop…
                          </span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleEmailGmail}
                          className="block w-full border-t border-ink/10 px-3 py-2 text-left text-sm hover:bg-creamDeep/60"
                        >
                          Gmail (web)
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleEmailOutlook}
                          className="block w-full border-t border-ink/10 px-3 py-2 text-left text-sm hover:bg-creamDeep/60"
                        >
                          Outlook (web)
                        </button>
                      </div>
                    )}
                  </div>
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

              {/* Sidekick reply helper — replaces the static "what to say
                  if they reply" disclosure. The advisor pastes whatever the
                  client wrote and gets a tailored reply suggestion. */}
              <div className="mt-6 border-t border-ink/10 pt-4">
                <SidekickReplyHelper
                  fallback={archetype.followUp}
                  archetypeName={archetype.name}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------------------------------
// SidekickReplyHelper
// ----------------------------------------------------------------------------
//
// Lightweight stand-in for a real Sidekick API. The advisor pastes what the
// client wrote, we show the prompt that would be sent to Sidekick, simulate
// thinking with a short delay, then render a canned (but contextual) reply
// suggestion. No network calls.

function SidekickReplyHelper({
  fallback,
  archetypeName,
}: {
  fallback: string;
  archetypeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [clientReply, setClientReply] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);

  const composedPrompt = `My client replied to my travel advisor outreach. Here's what they said: ${
    clientReply.trim() || "[paste their reply]"
  } How should I respond?`;

  function ask() {
    if (!clientReply.trim() || thinking) return;
    setThinking(true);
    setResponse(null);
    // Simulate Sidekick "thinking" so the UI feels real.
    window.setTimeout(() => {
      setResponse(buildSuggestedReply(clientReply, fallback));
      setThinking(false);
    }, 700);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-3 border border-ink/20 bg-creamDeep/40 px-4 py-3 text-left transition hover:border-ink hover:bg-creamDeep/70"
        aria-expanded={false}
      >
        <span className="font-display text-base leading-snug tracking-tightish text-ink">
          Ask Sidekick how to reply{" "}
          <span aria-hidden className="text-coral">
            ✨
          </span>
        </span>
        <span
          aria-hidden
          className="text-xs uppercase tracking-[0.16em] text-ink/55"
        >
          Open
        </span>
      </button>
    );
  }

  return (
    <div className="border border-ink/15 bg-creamDeep/40 p-4">
      <div className="flex items-center justify-between">
        <p className="eyebrow">
          Sidekick <span aria-hidden>✨</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setResponse(null);
          }}
          className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55 transition hover:text-ink"
          aria-label="Close Sidekick helper"
        >
          Close
        </button>
      </div>

      <label className="mt-3 block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70">
          What did {archetypeName.toLowerCase().includes("the ")
            ? archetypeName
            : "they"}{" "}
          say?
        </span>
        <textarea
          value={clientReply}
          onChange={(e) => setClientReply(e.target.value)}
          placeholder="Paste their reply here&hellip;"
          rows={3}
          className="input-editorial mt-2 w-full resize-y"
        />
      </label>

      {/* Show the composed prompt so the advisor can see exactly what would
          be sent to Sidekick. Helpful for trust + transparency. */}
      <details className="mt-3">
        <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55 transition hover:text-ink">
          Show prompt
        </summary>
        <p className="mt-2 border-l border-ink/20 pl-3 font-mono text-xs leading-relaxed text-ink/70">
          {composedPrompt}
        </p>
      </details>

      <button
        type="button"
        onClick={ask}
        disabled={!clientReply.trim() || thinking}
        className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {thinking ? "Thinking…" : "Ask Sidekick ✨"}
      </button>

      {response && (
        <div className="mt-4 animate-fadeUp border-l-2 border-ink/80 pl-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70">
            Suggested reply
          </p>
          <p className="mt-2 font-display text-base leading-relaxed text-ink whitespace-pre-line sm:text-lg">
            {response}
          </p>
          <button
            type="button"
            onClick={() => copyToClipboard(response)}
            className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/60 underline-offset-4 transition hover:text-ink hover:underline"
          >
            Copy reply
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Mock Sidekick reply builder. Picks a tone based on simple keyword sniffing
 * and folds in the archetype's followUp text as a baseline. Deliberately
 * deterministic so the demo is predictable.
 */
function buildSuggestedReply(clientReply: string, fallback: string): string {
  const lower = clientReply.toLowerCase();

  const isHesitant = /not sure|maybe|thinking|don't know|unsure|later/.test(
    lower,
  );
  const isInterested = /yes|sounds great|love|interested|tell me more|let's/.test(
    lower,
  );
  const askedCost = /cost|price|fee|expensive|how much|charge/.test(lower);

  if (askedCost) {
    return `Great question. There's no cost to you for using me as your advisor — the hotels and travel partners pay my commission directly. You'd pay the same room rate you'd find online, often less, plus the perks I can add (room upgrades, breakfast, resort credits where available).\n\n${fallback}`;
  }

  if (isHesitant) {
    return `No pressure at all. When you're ready, even a rough idea of where and when works as a starting point. I'll come back with one or two options you can react to, and we go from there.`;
  }

  if (isInterested) {
    return `Wonderful! ${fallback}\n\nWhenever you have a few minutes, just send over the basics (rough dates, who's traveling, anything you already know you want or want to avoid) and I'll handle the rest.`;
  }

  // Generic fallback.
  return `Thanks for getting back to me! ${fallback}`;
}
