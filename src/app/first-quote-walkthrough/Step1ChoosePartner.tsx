"use client";

import { useState } from "react";
import { Check, Star, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { HOTELS, type Hotel, fmtMoney } from "./data";

type Props = {
  selectedHotel: Hotel | null;
  onSelect: (h: Hotel) => void;
};

export function Step1ChoosePartner({ selectedHotel, onSelect }: Props) {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Choose a preferred partner</h1>
      <p className="text-sm text-wtMuted mb-5">
        Pick the property you'd like to quote for your client.
      </p>

      {showBanner && (
        <div className="mb-6 rounded-lg p-4 pr-10 relative bg-reserveBanner border-l-[3px] border-reserve">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {HOTELS.map((h) => {
          const isSelected = selectedHotel?.id === h.id;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => onSelect(h)}
              className={cn(
                "text-left bg-wtCard rounded-xl overflow-hidden transition-all border-2 hover:shadow-md",
                isSelected ? "border-brown shadow-md" : "border-transparent",
              )}
            >
              <div className="relative h-[200px] bg-beigeImage">
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
                <div className="text-xs flex items-center gap-1.5 text-ink/80">
                  <Star size={12} className="fill-ink text-ink" />
                  <span className="font-medium">{h.rating.toFixed(1)}</span>
                  <span className="text-wtMuted">·</span>
                  <span className="font-medium">
                    {fmtMoney(h.pricePerWeek)}/wk
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
