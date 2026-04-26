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
    addEntry,
    removeEntry,
    updateStatus,
    updateNote,
    clear,
  } = useOutreachLog();

  const [filter, setFilter] = useState<"all" | OutreachStatus>("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const [addingContact, setAddingContact] = useState(false);

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
          You can also log someone you reached out to outside the tool.
        </p>

        <div className="mt-8">
          {addingContact ? (
            <ManualContactForm
              onCancel={() => setAddingContact(false)}
              onSave={(payload) => {
                addEntry(payload);
                setAddingContact(false);
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingContact(true)}
              className="btn-outline"
            >
              + Log an outside contact
            </button>
          )}
        </div>
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

      {/* Filter — styled as a distinct labeled tab strip so it doesn't read
          as another status-update control like the per-row buttons below. */}
      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-1 border-b border-ink/15">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const count =
            f.value === "all" ? log.length : counts[f.value];
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={`-mb-px border-b-2 pb-3 pt-1 text-xs font-medium tracking-[0.04em] transition ${
                active
                  ? "border-ink text-ink"
                  : "border-transparent text-ink/55 hover:text-ink"
              }`}
            >
              {f.label}{" "}
              <span className="ml-0.5 text-ink/40">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Add an outside contact — a small CTA, not a primary action, since
          most entries flow in automatically from the finder. */}
      <div className="mt-6">
        {addingContact ? (
          <ManualContactForm
            onCancel={() => setAddingContact(false)}
            onSave={(payload) => {
              addEntry(payload);
              setAddingContact(false);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAddingContact(true)}
            className="inline-flex items-center gap-1.5 border border-ink/25 bg-cream px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/75 transition hover:border-ink hover:text-ink"
          >
            <span aria-hidden>+</span> Log an outside contact
          </button>
        )}
      </div>

      <ul className="mt-6 divide-y divide-ink/10">
        {filtered.map((entry) => (
          <LogRow
            key={entry.id}
            entry={entry}
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
  onSetStatus,
  onRemove,
  onNoteChange,
}: {
  entry: OutreachEntry;
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Status quick-set buttons — these update the contact's funnel
            stage. Visually distinct from the top-of-page filter tabs. */}
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
          Status
        </span>
        {(Object.keys(STATUS_META) as OutreachStatus[]).map((s) => {
          const active = entry.status === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSetStatus(s)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/20 bg-cream text-ink/65 hover:border-ink hover:text-ink"
              }`}
            >
              {STATUS_META[s].label}
            </button>
          );
        })}
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
          {entry.message.trim() ? (
            <>
              <p className="eyebrow">Message sent</p>
              <p className="mt-2 font-display text-sm leading-relaxed text-ink/85 whitespace-pre-line">
                {entry.message}
              </p>
            </>
          ) : (
            <p className="text-xs italic leading-relaxed text-ink/55">
              Logged outside the finder, no message body recorded.
            </p>
          )}

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

// ---------------------------------------------------------------------------
// ManualContactForm
// ---------------------------------------------------------------------------
// Lightweight form for logging a contact the advisor reached out to OUTSIDE
// of First Client Finder (in person, an old DM, etc.). We keep the schema
// identical to auto-logged entries so funnel counts and filters just work.

function ManualContactForm({
  onSave,
  onCancel,
}: {
  onSave: (payload: {
    archetypeId: string;
    archetypeName: string;
    recipientName: string;
    message: string;
    status: OutreachStatus;
    note?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<OutreachStatus>("sent");
  const [note, setNote] = useState("");

  const ready = name.trim().length > 0;

  function save() {
    if (!ready) return;
    onSave({
      // Stable id + label so these contacts are identifiable in the entry
      // metadata as having been logged outside the finder.
      archetypeId: "manual",
      archetypeName: "Logged outside the finder",
      recipientName: name.trim(),
      // No message body — the outreach happened off-tool. We leave this
      // empty rather than fake one; the details panel will hide if blank.
      message: "",
      status,
      note: note.trim() || undefined,
    });
  }

  return (
    <div className="border border-ink/25 bg-creamDeep/30 p-4 sm:p-5">
      <p className="eyebrow">Log an outside contact</p>
      <p className="mt-1 text-xs leading-relaxed text-ink/65">
        For people you reached out to in person, on a call, or somewhere
        outside this tool.
      </p>

      <label className="mt-4 block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70">
          Their name
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name (or initials)"
          className="input-editorial mt-2"
          autoFocus
        />
      </label>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70">
          Where they are now
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(STATUS_META) as OutreachStatus[]).map((s) => {
            const active = status === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                  active
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/20 bg-cream text-ink/65 hover:border-ink hover:text-ink"
                }`}
              >
                {STATUS_META[s].label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70">
          Notes (optional)
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Met at coffee, asked about a Greece trip in September."
          rows={3}
          className="input-editorial scroll-editorial mt-2 w-full resize-y"
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!ready}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to log
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">
          Cancel
        </button>
      </div>
    </div>
  );
}
