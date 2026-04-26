"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, GitCompare, Star, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { CompareModal } from "./CompareModal";
import { SidekickDrawer } from "./SidekickDrawer";
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
  /** Optional client name from the welcome step — used in AI copy. */
  clientName?: string;
};

type SortKey = "perks" | "commission" | "rating";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "perks", label: "Best perks" },
  { value: "commission", label: "Highest commission" },
  { value: "rating", label: "Top rated" },
];

const MAX_COMPARE = 3;

export function Step1ChoosePartner({
  selectedHotel,
  onSelect,
  brief,
  clientName,
}: Props) {
  const [showBanner, setShowBanner] = useState(true);
  const [sort, setSort] = useState<SortKey>("perks");
  const [sidekickQuery, setSidekickQuery] = useState("");

  // Compare mode state.
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Drawer state.
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSeed, setDrawerSeed] = useState<string | undefined>(undefined);

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

  // Drop selections that fall out of the visible list (e.g. after sort/filter).
  useEffect(() => {
    setCompareIds((ids) => ids.filter((id) => sorted.some((h) => h.id === id)));
  }, [sorted]);

  // Exit compare mode cleanly: also clear selections.
  useEffect(() => {
    if (!compareMode) setCompareIds([]);
  }, [compareMode]);

  const compareHotels = useMemo(
    () =>
      compareIds
        .map((id) => sorted.find((h) => h.id === id))
        .filter((h): h is Hotel => !!h),
    [compareIds, sorted],
  );

  // ---- AI banner copy ----
  const who = clientName?.trim() || "your client";
  const dest = brief.destination?.trim();
  const reserveCountVisible = sorted.filter((h) => h.isReserve).length;
  const bannerText = (() => {
    if (reserveCountVisible === 0) {
      return `Based on ${who}${dest ? `'s ${dest} trip` : "'s preferences"}, here are the strongest matches — sort by Highest commission to see your best earners.`;
    }
    if (dest) {
      return `Based on ${who}'s ${dest} trip, we recommend Fora Reserve properties — they offer exclusive perks and earn you the highest commission.`;
    }
    return `Based on ${who}'s preferences, we recommend Fora Reserve properties — they offer exclusive client perks and earn you the highest commission.`;
  })();

  function toggleCompareSelect(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  function openDrawerFromInline() {
    const q = sidekickQuery.trim();
    if (q) {
      setDrawerSeed(q);
      setSidekickQuery("");
    } else {
      setDrawerSeed(undefined);
    }
    setDrawerOpen(true);
  }

  function openDrawerFromBanner() {
    setDrawerSeed(undefined);
    setDrawerOpen(true);
  }

  function openDrawerFromCompare() {
    setDrawerSeed(undefined);
    setCompareOpen(false);
    setDrawerOpen(true);
  }

  const sidekickPlaceholder = brief.undecided
    ? "e.g. What's a good property for a first-time luxury traveler?"
    : `e.g. Which property gives ${who} the best perks${
        dest ? ` in ${dest}` : ""
      }?`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Choose a preferred partner</h1>
      <p className="text-sm text-wtMuted mb-5">
        Pick the property you&rsquo;d like to quote for your client.
        {clientName?.trim() && (
          <>
            {" "}
            Searching for{" "}
            <span className="font-medium text-ink">{clientName.trim()}</span>
            {dest && (
              <>
                {" "}in <span className="font-medium text-ink">{dest}</span>
              </>
            )}
            .
          </>
        )}
        {!clientName?.trim() && !brief.undecided && dest && (
          <>
            {" "}
            Searching <span className="font-medium text-ink">{dest}</span>
            {brief.budget !== "unsure" && <> at this budget</>}.
          </>
        )}
      </p>

      {/* Inline Sidekick bar — opens the chat drawer on submit. */}
      <div className="mb-4 bg-wtCard rounded-xl p-4 shadow-sm border border-wtBorder/70">
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
                openDrawerFromInline();
              }
            }}
            placeholder={sidekickPlaceholder}
            className="flex-1 min-w-0 px-3 py-2 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
          />
          <button
            type="button"
            onClick={openDrawerFromInline}
            className="shrink-0 text-sm font-semibold px-4 py-2 rounded-md bg-brown hover:bg-brownHover text-white transition-colors"
          >
            Ask →
          </button>
        </div>
      </div>

      {/* AI recommendation banner */}
      {showBanner && (
        <div className="mb-5 rounded-lg p-4 pr-10 relative bg-[#FDF3DC] border-l-[3px] border-reserve fade-up">
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss recommendation"
            className="absolute top-2.5 right-2.5 text-wtMuted hover:text-ink"
          >
            <X size={14} />
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex gap-2 items-start text-sm text-ink/90 flex-1">
              <span aria-hidden className="text-base leading-none mt-0.5">
                ✨
              </span>
              <p className="leading-relaxed">{bannerText}</p>
            </div>
            <button
              type="button"
              onClick={openDrawerFromBanner}
              className="shrink-0 text-xs font-semibold text-brown hover:text-brownHover transition-colors self-start sm:self-auto"
            >
              Ask Sidekick →
            </button>
          </div>
        </div>
      )}

      {/* Sort pills + Compare toggle */}
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

        <span className="hidden sm:inline-block w-px h-4 bg-wtBorder mx-1" />

        <button
          type="button"
          onClick={() => setCompareMode((v) => !v)}
          aria-pressed={compareMode}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
            compareMode
              ? "bg-brown text-white border-brown"
              : "bg-wtCard text-brown border-brown/60 hover:bg-brown/5",
          )}
        >
          <GitCompare size={12} />
          {compareMode ? "Exit compare" : "Compare"}
        </button>

        {compareMode && (
          <span className="text-[11px] text-wtMuted ml-1">
            Pick up to {MAX_COMPARE} properties
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {sorted.map((h) => {
          const isSelected = selectedHotel?.id === h.id;
          const isCompared = compareIds.includes(h.id);
          const earnings = cardEarnings(h);
          const showMatch =
            !brief.undecided &&
            brief.budget !== "unsure" &&
            matchesBudget(h, brief.budget);
          const ppn = pricePerNight(h);
          const atCompareCap =
            compareIds.length >= MAX_COMPARE && !isCompared;
          return (
            <button
              key={h.id}
              id={`hotel-card-${h.id}`}
              type="button"
              onClick={() => {
                if (compareMode) {
                  if (atCompareCap) return;
                  toggleCompareSelect(h.id);
                } else {
                  onSelect(h);
                }
              }}
              aria-pressed={compareMode ? isCompared : isSelected}
              className={cn(
                "relative text-left bg-wtCard rounded-xl overflow-hidden transition-all border-2 hover:shadow-md flex flex-col items-stretch",
                compareMode
                  ? isCompared
                    ? "border-brown shadow-md"
                    : atCompareCap
                      ? "border-transparent opacity-60 cursor-not-allowed"
                      : "border-transparent"
                  : isSelected
                    ? "border-brown shadow-md"
                    : "border-transparent",
              )}
            >
              {/* Compare-mode checkbox overlay */}
              {compareMode && (
                <span
                  className={cn(
                    "absolute top-3 left-3 z-10 inline-flex items-center justify-center w-6 h-6 rounded-md border-2 transition-colors shadow-sm",
                    isCompared
                      ? "bg-brown border-brown text-white"
                      : "bg-wtCard/95 border-wtBorder text-transparent",
                  )}
                  aria-hidden
                >
                  <Check size={14} strokeWidth={3} />
                </span>
              )}

              <div className="relative h-[200px] bg-beigeImage overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={h.imageUrl}
                  alt={`${h.name}, ${h.location}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {h.isReserve && (
                  <div
                    className={cn(
                      "absolute top-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white tracking-wide bg-reserve",
                      compareMode ? "left-12" : "left-3",
                    )}
                  >
                    ⭐ FORA RESERVE
                  </div>
                )}
                {!compareMode && isSelected && (
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

      {/* Sticky compare bar */}
      {compareMode && compareIds.length >= 2 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 fade-up">
          <div className="bg-brown text-white rounded-full shadow-xl pl-5 pr-2 py-2 flex items-center gap-3">
            <span className="text-sm font-semibold">
              Comparing {compareIds.length}{" "}
              {compareIds.length === 1 ? "property" : "properties"}
            </span>
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              className="text-xs font-semibold bg-wtCard text-brown px-3 py-1.5 rounded-full hover:bg-wtMutedBg transition-colors"
            >
              View comparison →
            </button>
          </div>
        </div>
      )}

      <CompareModal
        open={compareOpen && compareHotels.length >= 2}
        hotels={compareHotels}
        brief={brief}
        onClose={() => setCompareOpen(false)}
        onAskSidekick={openDrawerFromCompare}
        onPickHotel={(h) => {
          onSelect(h);
          setCompareMode(false);
        }}
      />

      <SidekickDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        brief={brief}
        clientName={clientName}
        hotels={sorted}
        seedQuery={drawerSeed}
      />
    </div>
  );
}
