"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  type ClientBrief,
  type Hotel,
  HOTELS,
  calcBasePrice,
  calcEarnings,
  fmtDate,
  fmtMoney,
  nightsBetween,
} from "./data";
import { SidekickDrawer } from "./SidekickDrawer";

type Props = {
  hotel: Hotel;
  clientName: string;
  startDate: string;
  endDate: string;
  guests: number;
  markup: number;
  /** Client brief from the parent — passed through to Sidekick for context. */
  brief: ClientBrief;
};

export function Step4ReviewSend({
  hotel,
  clientName,
  startDate,
  endDate,
  guests,
  markup,
  brief,
}: Props) {
  const nights = nightsBetween(startDate, endDate);
  const basePrice = calcBasePrice(hotel, nights);
  const markupAmount = basePrice * (markup / 100);
  const total = basePrice + markupAmount;
  const earnings = calcEarnings(basePrice, hotel);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  return (
    <>
      <div className="fade-up">
        <h1 className="text-2xl font-bold mb-1">Review &amp; send</h1>
      <p className="text-sm text-wtMuted mb-5">
        Take one last look before sending to your client.
      </p>

      {/* Quote preview */}
      <div className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70">
        <div className="flex gap-4 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hotel.imageUrl}
            alt={`${hotel.name}, ${hotel.location}`}
            className="w-20 h-20 rounded-md bg-beigeImage object-cover shrink-0"
          />
          <div>
            <h3 className="font-bold">{hotel.name}</h3>
            <p className="text-xs text-wtMuted mb-2">{hotel.location}</p>
            <div className="flex flex-wrap gap-1.5">
              {hotel.amenities.map((a) => (
                <span
                  key={a}
                  className="text-[10.5px] px-2 py-0.5 border border-wtBorder rounded-full text-wtMuted"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-wtBorder my-4" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Cell label="Client Name" value={clientName || "—"} />
          <Cell label="Guests" value={String(guests)} />
          <Cell label="Check-in" value={fmtDate(startDate)} />
          <Cell label="Check-out" value={fmtDate(endDate)} />
        </div>
        <div className="border-t border-wtBorder my-4" />
        <div className="space-y-2 text-sm">
          <Row
            label={
              nights
                ? `Base Price (${nights} night${nights === 1 ? "" : "s"})`
                : "Base Price"
            }
            value={fmtMoney(basePrice)}
          />
          <Row
            label={`Markup (${markup}%)`}
            value={`+${fmtMoney(markupAmount)}`}
          />
          <div className="border-t border-ink/30 my-2" />
          <div className="flex justify-between items-center">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-base">{fmtMoney(total)}</span>
          </div>
        </div>
      </div>

      {/* Ready */}
      <div className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70 mt-5">
        <h3 className="font-bold text-center mb-4">You're ready to send</h3>
        <ul className="space-y-2 text-sm max-w-sm mx-auto">
          <Done
            label={
              hotel.isReserve
                ? "Fora Reserve property selected"
                : "Standard partner property selected"
            }
          />
          <Done label="Pricing reviewed" />
          <Done label={`Commission calculated: you'll earn ${fmtMoney(earnings)}`} />
          <Done label="Client details added" />
        </ul>
      </div>

      {/* Earnings reminder */}
      <div className="rounded-xl p-4 mt-5 bg-earnBg text-sm border-l-[3px] border-earn">
        You'll earn an estimated{" "}
        <span className="font-bold text-earn">{fmtMoney(earnings)}</span>{" "}
        when this booking completes.
      </div>

        {/* Sidekick */}
        <div className="rounded-xl p-4 mt-5 bg-sidekickBg">
          <p className="text-sm mb-3">
            <span className="mr-1">✨</span>
            First time sending a quote? Sidekick can help you know what to
            expect when your client responds.
          </p>
          <button
            type="button"
            onClick={() => setSidekickOpen(true)}
            className="text-sm font-semibold px-4 py-2 rounded-md border border-brown text-brown bg-transparent hover:bg-brown/5 transition-colors"
          >
            Chat with Sidekick →
          </button>
        </div>
      </div>
      {/* Rendered as a sibling of `.fade-up` so the parent’s lingering
          `transform: translateY(0)` (animation fill-mode: forwards) doesn’t
          create a containing block for this `position: fixed` drawer. */}
      <SidekickDrawer
        open={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
        brief={brief}
        clientName={clientName}
        hotels={HOTELS}
        seedQuery={`What should I expect after I send this quote to ${clientName || "my client"}?`}
      />
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-wtMuted">
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-wtMuted">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Done({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-white shrink-0 bg-success">
        <Check size={10} strokeWidth={3} />
      </span>
      <span>{label}</span>
    </li>
  );
}
