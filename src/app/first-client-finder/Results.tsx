"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Answers, recommend } from "./data";
import { CardState, EMPTY_CARD } from "./session";
import { useOutreachLog } from "./useOutreachLog";
import ClientCard from "./ClientCard";
import Toast from "./Toast";
import Tracker from "./Tracker";

export default function Results({
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

  const { log, addEntry, removeLastForArchetype } = useOutreachLog();

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
            onLogSent={(args) => addEntry(args)}
            onLogUndo={(archetypeId) => removeLastForArchetype(archetypeId)}
          />
        ))}
      </ul>

      <Tracker count={sentCount} total={archetypes.length} allSent={allSent} />

      {/* Secondary path: presence-building options for advisors who aren't
          ready to send a direct outreach yet. Visually softer than the main
          cards above (white surfaces on cream, smaller type). */}
      <section
        aria-labelledby="warmup-heading"
        className="border-ink/15 pt-10"
      >
        <p className="eyebrow">Or, ease in</p>
        <h2
          id="warmup-heading"
          className="mt-3 font-display text-2xl font-normal leading-snug tracking-tightish text-ink sm:text-3xl"
        >
          Not ready to reach out yet?
        </h2>
        <p className="mt-2 text-base leading-relaxed text-ink/70">
          Build your presence while you warm up.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/first-client-finder/destination-guide"
            className="group flex flex-col border border-ink/15 bg-white p-5 transition hover:border-ink/40"
          >
            <span aria-hidden className="text-2xl">
              📝
            </span>
            <h3 className="mt-3 font-display text-lg leading-snug tracking-tightish text-ink">
              Write a destination guide
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
              Publish on Fora&rsquo;s platform and show up when clients search
              for travel inspiration.
            </p>
            <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brown transition group-hover:text-brownHover">
              Open the guide walkthrough →
            </span>
          </Link>

          <Link
            href="/first-client-finder/hotel-review"
            className="group flex flex-col border border-ink/15 bg-white p-5 transition hover:border-ink/40"
          >
            <span aria-hidden className="text-2xl">
              📸
            </span>
            <h3 className="mt-3 font-display text-lg leading-snug tracking-tightish text-ink">
              Post a hotel review
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
              Share your honest take on a stay. Your network will start seeing
              you as the person to ask about travel.
            </p>
            <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brown transition group-hover:text-brownHover">
              Open the review walkthrough →
            </span>
          </Link>
        </div>

        {/* Forum item — a third option below the two cards, intentionally
            styled as a row, not a third card. */}
        <a
          href="https://advisor.fora.travel/forum"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 flex items-start gap-3 border border-ink/15 bg-white px-5 py-4 transition hover:border-ink/40"
        >
          <span aria-hidden className="text-xl">
            💬
          </span>
          <span className="flex-1 text-sm leading-relaxed text-ink/80">
            Not sure where to start? Advisors in Forum share what worked for
            their first client.
          </span>
          <span className="shrink-0 self-center text-[11px] font-semibold uppercase tracking-[0.16em] text-brown transition group-hover:text-brownHover">
            Visit Forum →
          </span>
        </a>

        <p className="mt-4 text-xs leading-relaxed text-ink/55">
          Content builds long-term visibility. Direct outreach gets your first
          booking faster.
        </p>
      </section>

      {/* Outreach log CTA — link to the persistent tracker. Only render once
          there is something to look at, so empty states don't clutter. */}
      {log.length > 0 && (
        <div className="mt-10 border border-ink/15 bg-creamDeep/40 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Outreach log</p>
              <p className="mt-1 font-display text-lg leading-snug tracking-tightish text-ink">
                {log.length}{" "}
                {log.length === 1 ? "person" : "people"} contacted
              </p>
            </div>
            <Link
              href="/first-client-finder/log"
              className="btn-outline whitespace-nowrap"
            >
              Open log <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      )}

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
