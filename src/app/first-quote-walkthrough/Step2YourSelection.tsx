"use client";

import { Check, Star } from "lucide-react";
import {
  ADVISOR_SHARE,
  type Hotel,
  calcCommission,
  calcEarnings,
  commissionRateFor,
  fmtMoney,
} from "./data";

type Props = {
  hotel: Hotel;
};

export function Step2YourSelection({ hotel }: Props) {
  const commission = calcCommission(hotel.pricePerWeek, hotel);
  const earnings = calcEarnings(hotel.pricePerWeek, hotel);
  const rate = commissionRateFor(hotel);

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-bold mb-1">Your selection</h1>
      <p className="text-sm text-wtMuted mb-5">
        Here's what you've picked, and what you'll earn.
      </p>

      {/* Hotel card */}
      <div className="bg-wtCard rounded-xl overflow-hidden shadow-sm border border-wtBorder/70">
        <div className="relative h-[180px] bg-beigeImage">
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1 bg-success">
            <Check size={12} strokeWidth={3} /> Selected
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold">{hotel.name}</h3>
          <p className="text-sm text-wtMuted mb-3">{hotel.location}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {hotel.amenities.map((a) => (
              <span
                key={a}
                className="text-[11px] px-2 py-0.5 border border-wtBorder rounded-full text-wtMuted"
              >
                {a}
              </span>
            ))}
          </div>
          <div className="text-sm flex items-center gap-1.5">
            <Star size={13} className="fill-ink text-ink" />
            <span className="font-medium">{hotel.rating.toFixed(1)}</span>
            <span className="text-wtMuted">·</span>
            <span className="font-medium">
              {fmtMoney(hotel.pricePerWeek)}/week
            </span>
          </div>
        </div>
      </div>

      {/* Commission preview */}
      <div className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70 mt-5">
        <h4 className="font-bold mb-4">What you'll earn</h4>
        <div className="space-y-2.5 text-sm">
          <Row
            label="Base price"
            value={`${fmtMoney(hotel.pricePerWeek)}/week`}
          />
          <Row
            label="Commission rate"
            value={`${(rate * 100).toFixed(0)}% (${
              hotel.isReserve ? "Fora Reserve" : "Standard partner"
            })`}
          />
          <div className="border-t border-wtBorder my-3" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-earn">
              Your share ({ADVISOR_SHARE * 100}%):
            </span>
            <span className="font-bold text-earn text-[22px] leading-none">
              {fmtMoney(earnings)}
            </span>
          </div>
          <p className="text-xs text-wtMuted pt-1">
            Paid after client completes trip.
          </p>
        </div>
        {/* hidden math reference for clarity */}
        <span className="sr-only">Commission {fmtMoney(commission)}</span>
      </div>

      {/* Tip */}
      {hotel.isReserve ? (
        <div className="rounded-xl p-4 mt-5 bg-tipBg text-sm">
          💡 Fora Reserve includes automatic room upgrades and welcome gifts —
          free for your client, impressive for you.
        </div>
      ) : (
        <div className="rounded-xl p-4 mt-5 bg-tipBg text-sm">
          💡 Standard partners pay a {(rate * 100).toFixed(0)}% commission.
          Fora Reserve properties pay {(0.15 * 100).toFixed(0)}% plus client
          perks — worth a look if you want to compare.
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-wtMuted">{label}:</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
