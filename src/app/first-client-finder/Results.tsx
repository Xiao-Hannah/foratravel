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
