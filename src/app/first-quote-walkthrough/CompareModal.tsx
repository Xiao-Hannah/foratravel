"use client";

import { useEffect } from "react";
import { Check, Star, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type ClientBrief,
  type Hotel,
  cardEarnings,
  fmtMoney,
  matchesBudget,
  pricePerNight,
} from "./data";

type Props = {
  open: boolean;
  hotels: Hotel[];
  brief: ClientBrief;
  onClose: () => void;
  onAskSidekick: () => void;
  onPickHotel: (h: Hotel) => void;
};

const ROWS: {
  key: string;
  label: string;
  render: (h: Hotel, brief: ClientBrief) => React.ReactNode;
}[] = [
  {
    key: "earnings",
    label: "Your est. earnings",
    render: (h) => (
      <span className="font-semibold text-brown">
        {fmtMoney(cardEarnings(h))}
      </span>
    ),
  },
  {
    key: "perks",
    label: "Client perks",
    render: (h) =>
      h.isReserve && h.perks && h.perks.length > 0 ? (
        <ul className="space-y-0.5 text-xs text-ink/80">
          {h.perks.map((p) => (
            <li key={p}>• {p}</li>
          ))}
        </ul>
      ) : (
        <span className="text-xs text-wtMuted">—</span>
      ),
  },
  {
    key: "budget",
    label: "Matches budget",
    render: (h, brief) => {
      if (brief.undecided || brief.budget === "unsure") {
        return <span className="text-xs text-wtMuted">No budget set</span>;
      }
      return matchesBudget(h, brief.budget) ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
          <Check size={12} strokeWidth={3} /> Yes
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-wtMuted">
          <X size={12} strokeWidth={3} /> No
        </span>
      );
    },
  },
  {
    key: "rating",
    label: "Rating",
    render: (h) => (
      <span className="inline-flex items-center gap-1 text-xs">
        <Star size={11} className="fill-ink text-ink" />
        <span className="font-medium">{h.rating.toFixed(1)}</span>
      </span>
    ),
  },
  {
    key: "nightly",
    label: "Nightly rate",
    render: (h) => (
      <span className="text-xs">{fmtMoney(pricePerNight(h))}/night</span>
    ),
  },
  {
    key: "reserve",
    label: "Fora Reserve",
    render: (h) =>
      h.isReserve ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white px-2 py-0.5 rounded-full bg-reserve">
          ⭐ RESERVE
        </span>
      ) : (
        <span className="text-xs text-wtMuted">—</span>
      ),
  },
];

export function CompareModal({
  open,
  hotels,
  brief,
  onClose,
  onAskSidekick,
  onPickHotel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-ink/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Compare properties"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-wtBg rounded-t-2xl sm:rounded-2xl shadow-xl border border-wtBorder overflow-hidden fade-up"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-wtBorder bg-wtCard">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink leading-tight">
              Compare properties
            </h2>
            <p className="text-xs text-wtMuted">
              {hotels.length} selected · pick the best fit for your client
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="text-wtMuted hover:text-ink p-1 rounded-md hover:bg-wtMutedBg transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-auto">
          <div
            className="grid gap-px bg-wtBorder text-sm"
            style={{
              gridTemplateColumns: `minmax(140px, 0.8fr) repeat(${hotels.length}, minmax(180px, 1fr))`,
            }}
          >
            {/* Header row: thumbnails */}
            <div className="bg-wtBg" />
            {hotels.map((h) => (
              <div key={h.id} className="bg-wtCard p-3">
                <div className="relative h-20 w-full rounded-md overflow-hidden bg-beigeImage mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.imageUrl}
                    alt={h.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <p className="font-semibold text-sm leading-snug">{h.name}</p>
                <p className="text-[11px] text-wtMuted">{h.location}</p>
                <button
                  type="button"
                  onClick={() => {
                    onPickHotel(h);
                    onClose();
                  }}
                  className="mt-2 w-full text-[11px] font-semibold py-1.5 rounded-md bg-brown hover:bg-brownHover text-white transition-colors"
                >
                  Select this
                </button>
              </div>
            ))}

            {ROWS.map((row) => (
              <div key={row.key} className="contents">
                <div className="bg-wtBg px-3 py-2.5 text-xs font-semibold text-wtMuted uppercase tracking-wide">
                  {row.label}
                </div>
                {hotels.map((h) => (
                  <div key={h.id} className="bg-wtCard px-3 py-2.5">
                    {row.render(h, brief)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <footer className="px-5 py-3 border-t border-wtBorder bg-wtCard flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onAskSidekick}
            className={cn(
              "text-xs font-semibold text-brown hover:text-brownHover transition-colors",
            )}
          >
            ✨ Still not sure? Ask Sidekick →
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-md text-ink hover:bg-wtMutedBg transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
