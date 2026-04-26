"use client";

import { usePersistentState } from "@/lib/usePersistentState";

export type OutreachStatus = "sent" | "replied" | "booked";

export type OutreachEntry = {
  /** Stable id (timestamp + random suffix) */
  id: string;
  /** Archetype id from data.ts (e.g. "engaged-friend") */
  archetypeId: string;
  /** Snapshot of the archetype display name at send time */
  archetypeName: string;
  /** Recipient name as the advisor entered it (may be empty) */
  recipientName: string;
  /** Snapshot of the filled message that was sent */
  message: string;
  /** ISO timestamp */
  sentAt: string;
  /** Current funnel status */
  status: OutreachStatus;
  /** Optional advisor note */
  note?: string;
};

export const OUTREACH_LOG_KEY = "fora.first-client-finder.log.v1";

export const STATUS_META: Record<
  OutreachStatus,
  { label: string; tone: string; next: OutreachStatus | null }
> = {
  sent: {
    label: "Sent",
    tone: "border-ink/30 bg-cream text-ink/70",
    next: "replied",
  },
  replied: {
    // Neutral, warm tone — coral was reading as an error/alert.
    label: "Replied",
    tone: "border-taupe/60 bg-creamDeep text-ink",
    next: "booked",
  },
  booked: {
    label: "Booked",
    tone: "border-ink bg-ink text-cream",
    next: null,
  },
};

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useOutreachLog() {
  const [log, setLog, hydrated] = usePersistentState<OutreachEntry[]>(
    OUTREACH_LOG_KEY,
    [],
  );

  function addEntry(
    entry: Omit<OutreachEntry, "id" | "sentAt" | "status"> &
      Partial<Pick<OutreachEntry, "status" | "sentAt">>,
  ): string {
    const id = makeId();
    const next: OutreachEntry = {
      id,
      sentAt: entry.sentAt ?? new Date().toISOString(),
      status: entry.status ?? "sent",
      archetypeId: entry.archetypeId,
      archetypeName: entry.archetypeName,
      recipientName: entry.recipientName,
      message: entry.message,
      note: entry.note,
    };
    setLog((prev) => [next, ...prev]);
    return id;
  }

  function removeEntry(id: string) {
    setLog((prev) => prev.filter((e) => e.id !== id));
  }

  /** Remove the most recent entry for an archetype. Used when "Mark as sent" is undone. */
  function removeLastForArchetype(archetypeId: string): boolean {
    let removed = false;
    setLog((prev) => {
      const idx = prev.findIndex((e) => e.archetypeId === archetypeId);
      if (idx === -1) return prev;
      removed = true;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    return removed;
  }

  function updateStatus(id: string, status: OutreachStatus) {
    setLog((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e)),
    );
  }

  function updateNote(id: string, note: string) {
    setLog((prev) =>
      prev.map((e) => (e.id === id ? { ...e, note } : e)),
    );
  }

  function clear() {
    setLog([]);
  }

  return {
    log,
    hydrated,
    addEntry,
    removeEntry,
    removeLastForArchetype,
    updateStatus,
    updateNote,
    clear,
  };
}
