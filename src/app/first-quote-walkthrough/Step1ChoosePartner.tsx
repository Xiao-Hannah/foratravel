"use client";

import { useMemo, useState } from "react";
import { Check, Star, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type ClientBrief,
  type Hotel,
  HOTELS,
  cardEarnings,
  fmtMoney,
  matchesBudget,
  pricePerNight,
} from "./data";

type Props = {
  selectedHotel: Hotel | null;
  onSelect: (h: Hotel) => void;
  /** The Client Brief from the previous step. Drives filtering + Sidekick context. */
  brief: ClientBrief;
};

type SortKey = "perks" | "commission" | "rating";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "perks", label: "Best perks" },
  { value: "commission", label: "Highest commission" },
  { value: "rating", label: "Top rated" },
];

export function Step1ChoosePartner({ selectedHotel, onSelect, brief }: Props) {
  const [showBanner, setShowBanner] = useState(true);
  const [sort, setSort] = useState<SortKey>("perks");
  const [sidekickQuery, setSidekickQuery] = useState("");
  const [sidekickAnswer, setSidekickAnswer] = useState<{
    text: string;
    hotelId: string;
    hotelName: string;
  } | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // When the brief is "undecided", treat budget as unfiltered so the user
  // sees everything. Otherwise, filter to in-budget hotels (but always show
  // results — fall back to the full list if the filter would be empty so
  // we don't strand the user).
  const filtered = useMemo(() => {
    if (brief.undecided || brief.budget === "unsure") return HOTELS;
    const inBudget = HOTELS.filter((h) => matchesBudget(h, brief.budget));
    return inBudget.length > 0 ? inBudget : HOTELS;
  }, [brief.undecided, brief.budget]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sort === "perks") {
      // Reserve first, then by rating desc.
      list.sort((a, b) => {
        if (a.isReserve !== b.isReserve) return a.isReserve ? -1 : 1;
        return b.rating - a.rating;
      });
    } else if (sort === "commission") {
      list.sort((a, b) => cardEarnings(b) - cardEarnings(a));
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [filtered, sort]);

  // Sidekick is intentionally deterministic / mocked — picks the highest-
  // earning Reserve hotel in the current sorted list when available,
  // otherwise the highest-rated overall.
  function askSidekick() {
    if (!sidekickQuery.trim()) return;
    const reserveCandidates = sorted.filter((h) => h.isReserve);
    const pick =
      reserveCandidates[0] ??
      [...sorted].sort((a, b) => b.rating - a.rating)[0];
    if (!pick) return;
    const earn = cardEarnings(pick);
    const perks =
      pick.perks?.slice(0, 2).join(" and ").toLowerCase() ??
      "exclusive amenities";
    const isHoneymoon = /honeymoon|romance|romantic/i.test(
      sidekickQuery + " " + brief.preferences,
    );
    const tripLabel = isHoneymoon ? "a honeymoon" : "this trip";
    const text = pick.isReserve
      ? `For ${tripLabel}, ${pick.name} offers the best perks — ${perks}. It's also one of your highest-commission options at an estimated ${fmtMoney(
          earn,
        )} for this booking.`
      : `${pick.name} is your top-rated match. You'd earn an estimated ${fmtMoney(
          earn,
        )} on this booking.`;
    setSidekickAnswer({ text, hotelId: pick.id, hotelName: pick.name });
  }

  function jumpToHotel(id: string) {
    const el = document.getElementById(`hotel-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(id);
      window.setTimeout(() => setHighlightedId(null), 2000);
    }
  }

  const sidekickPlaceholder = brief.undecided
    ? "e.g. What's a good property for a first-time luxury traveler?"
    : `e.g. Which property gives my client the best perks for ${
        brief.preferences
          ? brief.preferences.split(",")[0].trim()
          : "their trip"
      } in ${brief.destination || "this destination"}${
        brief.budget !== "unsure" ? " under their budget" : ""
      }?`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Choose a preferred partner</h1>
      <p className="text-sm text-wtMuted mb-5">
        Pick the property you'd like to quote for your client.
        {!brief.undecided && brief.destination && (
          <>
            {" "}
            Searching{" "}
            <span className="font-medium text-ink">{brief.destination}</span>
            {brief.budget !== "unsure" && <> at this budget</>}.
          </>
        )}
      </p>

      {/* Sidekick bar */}
      <div className="mb-5 bg-wtCard rounded-xl p-4 shadow-sm border border-wtBorder/70">
        <label
          htmlFor="sidekick-input"
          className="block text-xs font-semibold text-ink mb-2"
        >
          ✨ Ask Sidekick
        </label>
        <div className="flex gap-2">
          <input
            id="sidekick-input"
            type="text"
            value={sidekickQuery}
            onChange={(e) => setSidekickQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                askSidekick();
              }
            }}
            placeholder={sidekickPlaceholder}
            className="flex-1 min-w-0 px-3 py-2 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
          />
          <button
            type="button"
            onClick={askSidekick}
            disabled={!sidekickQuery.trim()}
            className={cn(
              "shrink-0 text-sm font-semibold px-4 py-2 rounded-md transition-colors",
              sidekickQuery.trim()
                ? "bg-brown hover:bg-brownHover text-white"
                : "bg-wtMutedBg text-wtMuted cursor-not-allowed",
            )}
          >
            Ask →
          </button>
        </div>

        {sidekickAnswer && (
          <div className="mt-4 p-4 bg-wtCard border-l-[3px] border-brown rounded-md fade-up">
            <p className="text-sm text-ink/90 leading-relaxed">
              <span className="font-semibold">✨ Sidekick recommends:</span>{" "}
              {sidekickAnswer.text}
            </p>
            <button
              type="button"
              onClick={() => jumpToHotel(sidekickAnswer.hotelId)}
              className="mt-3 text-xs font-semibold text-brown hover:text-brownHover transition-colors"
            >
              View {sidekickAnswer.hotelName} →
            </button>
          </div>
        )}
      </div>

      {showBanner && (
        <div className="mb-5 rounded-lg p-4 pr-10 relative bg-reserveBanner border-l-[3px] border-reserve">
          <div className="flex gap-2 items-start text-sm text-ink/90">
            <span aria-hidden>⭐</span>
            <p>
              <span className="font-semibold">Fora Reserve</span> properties
              offer higher commission and exclusive client perks. We
              recommend starting here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss"
            className="absolute top-3 right-3 text-wtMuted hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Sort pills */}
      <div className="mb-5 flex items-center flex-wrap gap-2">
        <span className="text-xs font-semibold text-wtMuted uppercase tracking-wide mr-1">
          Sort by:
        </span>
        {SORT_OPTIONS.map((opt) => {
          const active = sort === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSort(opt.value)}
              aria-pressed={active}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                active
                  ? "bg-brown text-white border-brown"
                  : "bg-wtCard text-brown border-brown/60 hover:bg-brown/5",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {sorted.map((h) => {
          const isSelected = selectedHotel?.id === h.id;
          const isHighlighted = highlightedId === h.id;
          const earnings = cardEarnings(h);
          const showMatch =
            !brief.undecided &&
            brief.budget !== "unsure" &&
            matchesBudget(h, brief.budget);
          const ppn = pricePerNight(h);
          return (
            <button
              key={h.id}
              id={`hotel-card-${h.id}`}
              type="button"
              onClick={() => onSelect(h)}
              className={cn(
                "text-left bg-wtCard rounded-xl overflow-hidden transition-all border-2 hover:shadow-md flex flex-col items-stretch",
                isSelected
                  ? "border-brown shadow-md"
                  : isHighlighted
                    ? "border-brown shadow-md ring-2 ring-brown/30"
                    : "border-transparent",
              )}
            >
              <div className="relative h-[200px] bg-beigeImage overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={h.imageUrl}
                  alt={`${h.name}, ${h.location}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {h.isReserve && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white tracking-wide bg-reserve">
                    ⭐ FORA RESERVE
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1 bg-success">
                    <Check size={12} strokeWidth={3} /> Selected
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-base">{h.name}</h3>
                <p className="text-xs text-wtMuted mb-3">{h.location}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {h.amenities.map((a) => (
                    <span
                      key={a}
                      className="text-[10.5px] px-2 py-0.5 border border-wtBorder rounded-full text-wtMuted"
                    >
                      {a}
                    </span>
                  ))}
                </div>

                {/* Earnings + perks rows. Earnings always shown; perks row
                    only for Reserve cards (where perks are real). */}
                <div className="space-y-1 mb-3">
                  <div className="text-xs font-semibold text-brown">
                    💰 Est. your earnings: {fmtMoney(earnings)}
                  </div>
                  {h.isReserve && h.perks && h.perks.length > 0 && (
                    <div className="text-xs text-wtMuted">
                      🎁 Client perks: {h.perks.join(", ")}
                    </div>
                  )}
                </div>

                {showMatch && (
                  <div className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                    <Check size={12} strokeWidth={3} /> Matches your
                    client&rsquo;s budget
                  </div>
                )}

                <div className="text-xs flex items-center gap-1.5 text-ink/80">
                  <Star size={12} className="fill-ink text-ink" />
                  <span className="font-medium">{h.rating.toFixed(1)}</span>
                  <span className="text-wtMuted">·</span>
                  <span className="font-medium">
                    {fmtMoney(h.pricePerWeek)}/wk
                  </span>
                  <span className="text-wtMuted">·</span>
                  <span className="text-wtMuted">{fmtMoney(ppn)}/night</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
