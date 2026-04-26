"use client";

import { useMemo, useState } from "react";
import {
  OutreachEntry,
  OutreachStatus,
  STATUS_META,
  useOutreachLog,
} from "./useOutreachLog";

const FILTERS: { value: "all" | OutreachStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "replied", label: "Replied" },
  { value: "booked", label: "Booked" },
];

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    });
  } catch {
    return "";
  }
}

export default function OutreachLog() {
  const {
    log,
    hydrated,
    removeEntry,
    updateStatus,
    updateNote,
    clear,
  } = useOutreachLog();

  const [filter, setFilter] = useState<"all" | OutreachStatus>("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(
    () => (filter === "all" ? log : log.filter((e) => e.status === filter)),
    [log, filter],
  );

  const counts = useMemo(() => {
    const c: Record<OutreachStatus, number> = {
      sent: 0,
      replied: 0,
      booked: 0,
    };
    for (const e of log) c[e.status] += 1;
    return c;
  }, [log]);

  // Avoid SSR/hydration flash showing the empty state for users who actually
  // have a saved log.
  if (!hydrated) {
    return (
      <section className="animate-fadeUp">
        <p className="eyebrow">Outreach log</p>
        <h1 className="mt-4 font-display text-4xl font-normal leading-[1.02] tracking-tighter2 text-ink sm:text-[56px]">
          Loading&hellip;
        </h1>
      </section>
    );
  }

  if (log.length === 0) {
    return (
      <section className="animate-fadeUp">
        <p className="eyebrow">Outreach log</p>
        <h1 className="mt-4 font-display text-4xl font-normal leading-[1.02] tracking-tighter2 text-ink sm:text-[56px]">
          Nothing logged
          <br />
          <span className="italic">yet.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink/75">
          When you mark a message as sent in the First Client Finder, the
          contact will show up here so you can track replies and bookings.
        </p>
      </section>
    );
  }

  return (
    <section className="animate-fadeUp">
      <p className="eyebrow">Outreach log</p>
      <h1 className="mt-4 font-display text-4xl font-normal leading-[1.02] tracking-tighter2 text-ink sm:text-[56px]">
        {log.length} {log.length === 1 ? "person" : "people"}
        <br />
        <span className="italic">contacted.</span>
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-ink/75">
        Tap a status to move someone through the funnel. Everything is stored
        on this device only.
      </p>

      {/* Funnel summary */}
      <dl className="mt-8 grid grid-cols-3 gap-3">
        {(Object.keys(counts) as OutreachStatus[]).map((s) => (
          <div
            key={s}
            className="border border-ink/15 bg-creamDeep/30 px-4 py-3"
          >
            <dt className="eyebrow">{STATUS_META[s].label}</dt>
            <dd className="mt-1 font-display text-3xl tracking-tightish text-ink">
              {counts[s]}
            </dd>
          </div>
        ))}
      </dl>

      {/* Filter chips */}
      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/25 bg-cream text-ink/70 hover:border-ink hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <ul className="mt-6 divide-y divide-ink/10">
        {filtered.map((entry) => (
          <LogRow
            key={entry.id}
            entry={entry}
            onAdvance={() => {
              const next = STATUS_META[entry.status].next;
              if (next) updateStatus(entry.id, next);
            }}
            onSetStatus={(s) => updateStatus(entry.id, s)}
            onRemove={() => removeEntry(entry.id)}
            onNoteChange={(note) => updateNote(entry.id, note)}
          />
        ))}
        {filtered.length === 0 && (
          <li className="py-8 text-center text-sm italic text-ink/60">
            No contacts in this status.
          </li>
        )}
      </ul>

      <div className="mt-12 border-t border-ink/15 pt-8">
        {confirmClear ? (
          <div className="flex flex-col items-center gap-3">
            <p className="font-display text-base italic text-ink/80">
              Delete the entire outreach log?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  clear();
                  setConfirmClear(false);
                }}
                className="btn-primary"
              >
                Yes, delete everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/60 underline-offset-4 transition hover:text-ink hover:underline"
            >
              Clear log
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function LogRow({
  entry,
  onAdvance,
  onSetStatus,
  onRemove,
  onNoteChange,
}: {
  entry: OutreachEntry;
  onAdvance: () => void;
  onSetStatus: (s: OutreachStatus) => void;
  onRemove: () => void;
  onNoteChange: (note: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[entry.status];

  const displayName = entry.recipientName.trim() || "(no name)";

  return (
    <li className="py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">
            {entry.archetypeName} · {formatDate(entry.sentAt)}
          </p>
          <h3 className="mt-1 truncate font-display text-xl leading-snug tracking-tightish text-ink sm:text-2xl">
            {displayName}
          </h3>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${meta.tone}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {/* Status quick-set buttons */}
        {(Object.keys(STATUS_META) as OutreachStatus[]).map((s) => {
          const active = entry.status === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSetStatus(s)}
              aria-pressed={active}
              className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/20 bg-cream text-ink/65 hover:border-ink hover:text-ink"
              }`}
            >
              {STATUS_META[s].label}
            </button>
          );
        })}
        {meta.next && (
          <button
            type="button"
            onClick={onAdvance}
            className="border border-ink bg-ink/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-ink/10"
          >
            → {STATUS_META[meta.next].label}
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="ml-auto text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55 underline-offset-4 transition hover:text-ink hover:underline"
        >
          {open ? "Hide" : "Details"}
        </button>
      </div>

      {open && (
        <div className="mt-4 border-l border-ink/20 pl-4">
          <p className="eyebrow">Message sent</p>
          <p className="mt-2 font-display text-sm leading-relaxed text-ink/85 whitespace-pre-line">
            {entry.message}
          </p>

          <label className="mt-5 block">
            <span className="eyebrow">Notes</span>
            <textarea
              defaultValue={entry.note ?? ""}
              onBlur={(e) => onNoteChange(e.target.value)}
              placeholder="e.g. Asked about Italy in June; will follow up Friday."
              rows={3}
              className="input-editorial mt-3 w-full resize-y"
            />
          </label>

          <div className="mt-4">
            <button
              type="button"
              onClick={onRemove}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55 underline-offset-4 transition hover:text-coral hover:underline"
            >
              Remove from log
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
