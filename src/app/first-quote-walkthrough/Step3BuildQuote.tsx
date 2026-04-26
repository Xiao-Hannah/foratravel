"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  ADVISOR_SHARE,
  type Hotel,
  calcBasePrice,
  commissionRateFor,
  fmtMoney,
  nightsBetween,
} from "./data";

type QuoteValue = {
  clientName: string;
  startDate: string;
  endDate: string;
  guests: number;
  markup: number;
};

type Props = {
  hotel: Hotel;
  value: QuoteValue;
  onChange: (patch: Partial<QuoteValue>) => void;
  today: string;
  datesValid: boolean;
  startInPast: boolean;
  datesInOrder: boolean;
  datesProvided: boolean;
};

export function Step3BuildQuote({
  hotel,
  value,
  onChange,
  today,
  datesValid,
  startInPast,
  datesInOrder,
  datesProvided,
}: Props) {
  const [showSidekick, setShowSidekick] = useState(false);

  const { clientName, startDate, endDate, guests, markup } = value;

  const nights = nightsBetween(startDate, endDate);
  // Show a 1-week preview before the user has picked valid dates so the
  // pricing card isn't all zeros.
  const previewNights = nights || 7;
  const basePrice = calcBasePrice(hotel, previewNights);
  const markupAmount = basePrice * (markup / 100);
  const clientPays = basePrice + markupAmount;
  const rate = commissionRateFor(hotel);
  const commission = basePrice * rate;
  const earnings = Math.round(commission * ADVISOR_SHARE);

  let dateError: string | null = null;
  if (startDate && startInPast) {
    dateError = "Start date can't be in the past.";
  } else if (datesProvided && !datesInOrder) {
    dateError = "End date must be after start date.";
  } else if (!datesProvided && (startDate || endDate)) {
    dateError = "Please pick both a start and end date.";
  } else if (datesValid) {
    dateError = null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Build your quote</h1>
      <p className="text-sm text-wtMuted mb-5">
        Add client details and set your markup.
      </p>

      {/* Hotel summary */}
      <div className="bg-wtCard rounded-xl p-4 shadow-sm border border-wtBorder/70 flex items-center gap-4">
        <div className="w-[60px] h-[60px] rounded-md bg-beigeImage shrink-0" />
        <div>
          <div className="font-semibold text-sm">{hotel.name}</div>
          <div className="text-xs text-wtMuted">{hotel.location}</div>
        </div>
      </div>

      {/* Quote details */}
      <div className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70 mt-5 space-y-5">
        <h4 className="font-bold">Quote details</h4>

        <Field label="Client Name">
          <input
            type="text"
            value={clientName}
            onChange={(e) => onChange({ clientName: e.target.value })}
            placeholder="Enter client name"
            className="w-full px-3 py-2 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
          />
        </Field>

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start Date">
              <input
                type="date"
                value={startDate}
                min={today}
                max={endDate || undefined}
                onChange={(e) => onChange({ startDate: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 rounded-md border bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40",
                  dateError ? "border-reserve" : "border-wtBorder",
                )}
              />
            </Field>
            <Field label="End Date">
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => onChange({ endDate: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 rounded-md border bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40",
                  dateError ? "border-reserve" : "border-wtBorder",
                )}
              />
            </Field>
          </div>
          {dateError && (
            <p className="text-xs text-earn mt-2 font-medium">{dateError}</p>
          )}
        </div>

        <Field label="Number of Guests">
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) =>
              onChange({
                guests: Math.max(1, parseInt(e.target.value, 10) || 1),
              })
            }
            className="w-full px-3 py-2 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
          />
        </Field>

        <Field label="Base Price">
          <div className="w-full px-3 py-2 rounded-md border border-wtBorder bg-wtMutedBg text-sm text-wtMuted">
            {fmtMoney(basePrice)}
          </div>
        </Field>

        <Field label="Optional Markup %">
          <input
            type="number"
            min={0}
            value={markup}
            onChange={(e) =>
              onChange({
                markup: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            className="w-full px-3 py-2 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
          />
          <p className="text-xs text-wtMuted mt-1.5">
            Most new advisors start with 5–10%.
          </p>
          <button
            type="button"
            onClick={() => setShowSidekick(true)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brown bg-wtCard border border-brown px-3 py-1.5 hover:bg-brown/5 transition-colors rounded-md"
          >
            ✨ Ask Sidekick
          </button>
        </Field>

        <Field label="Client Pays">
          <div className="w-full px-3 py-2 rounded-md border border-wtBorder bg-wtMutedBg text-sm font-semibold">
            {fmtMoney(clientPays)}
          </div>
        </Field>
      </div>

      {/* Earnings calculator */}
      <div className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70 mt-5">
        <h4 className="font-bold mb-4">Your estimated earnings</h4>
        <div className="space-y-2.5 text-sm">
          <Row
            label={
              nights
                ? `Base Price (${nights} night${nights === 1 ? "" : "s"} × ${fmtMoney(hotel.pricePerWeek / 7)}/night)`
                : `Base Price (1-week preview · pick dates to update)`
            }
            value={fmtMoney(basePrice)}
          />
          <Row
            label={`Markup (${markup}%)`}
            value={`+${fmtMoney(markupAmount)}`}
          />
          <div className="border-t border-wtBorder my-2" />
          <Row label="Client pays" value={fmtMoney(clientPays)} bold />
          <Row
            label={`Your commission (${(rate * 100).toFixed(0)}% of base)`}
            value={fmtMoney(commission)}
          />
          <div className="flex justify-between items-center">
            <span className="font-bold text-earn">
              Your earnings ({ADVISOR_SHARE * 100}%):
            </span>
            <span className="font-bold text-earn">{fmtMoney(earnings)}</span>
          </div>
        </div>
      </div>

      {/* Sidekick modal */}
      {showSidekick && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowSidekick(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-wtCard rounded-xl p-6 max-w-md w-full shadow-xl relative"
          >
            <button
              type="button"
              onClick={() => setShowSidekick(false)}
              className="absolute top-3 right-3 text-wtMuted hover:text-ink"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h3 className="font-bold text-lg mb-2">✨ Sidekick says:</h3>
            <p className="text-sm text-ink/90 mb-5">
              For a Fora Reserve property at this price, 5–10% markup is
              standard and keeps your quote competitive.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowSidekick(false)}
                className="bg-brown hover:bg-brownHover text-white text-sm font-semibold px-4 py-2 rounded-md"
              >
                Got it ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink/80 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn(bold ? "font-semibold" : "text-wtMuted")}>
        {label}:
      </span>
      <span className={cn("font-medium", bold && "font-bold")}>{value}</span>
    </div>
  );
}
