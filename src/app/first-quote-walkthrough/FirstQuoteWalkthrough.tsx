"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { usePersistentState } from "@/lib/usePersistentState";
import { Step1ChoosePartner } from "./Step1ChoosePartner";
import { Step0Welcome } from "./Step0Welcome";
import { Step2YourSelection } from "./Step2YourSelection";
import { Step3BuildQuote } from "./Step3BuildQuote";
import { Step4ReviewSend } from "./Step4ReviewSend";
import { Step5Complete } from "./Step5Complete";
import { WalkthroughNav } from "./WalkthroughNav";
import { WalkthroughSidebar } from "./WalkthroughSidebar";
import { HOTELS, type Hotel, calcBasePrice, calcEarnings, nightsBetween } from "./data";
import { EMPTY_SESSION, STORAGE_KEY, type Session } from "./session";

/**
 * Quote form state. Lives in component state (not localStorage) so typing
 * stays snappy. The user keeps it for the lifetime of a session and it
 * resets when the walkthrough is restarted.
 */
type QuoteForm = {
  clientName: string;
  startDate: string;
  endDate: string;
  guests: number;
  markup: number;
};

const EMPTY_QUOTE: QuoteForm = {
  clientName: "",
  startDate: "",
  endDate: "",
  guests: 2,
  markup: 10,
};

export default function FirstQuoteWalkthrough() {
  const [session, setSession] = usePersistentState<Session>(
    STORAGE_KEY,
    EMPTY_SESSION,
  );
  const [quote, setQuote] = useState<QuoteForm>(EMPTY_QUOTE);

  const hotel: Hotel | null =
    HOTELS.find((h) => h.id === session.hotelId) ?? null;

  const goTo = (step: number) => {
    setSession((s) => ({ ...s, step }));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const reset = () => {
    setSession(EMPTY_SESSION);
    setQuote(EMPTY_QUOTE);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /** Exit to / and clear persisted session so re-entry starts fresh. */
  const handleExit = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore (private mode, quota, etc.)
    }
  };

  // If the persisted step somehow refers to a hotel we don't have any more
  // (e.g. catalog changed), bounce back to step 1.
  useEffect(() => {
    if (session.step > 1 && session.step < 5 && !hotel) {
      setSession((s) => ({ ...s, step: 1 }));
    }
  }, [session.step, hotel, setSession]);

  const { step } = session;

  // ---- Per-step CTA wiring -------------------------------------------------
  const today = new Date().toISOString().slice(0, 10);
  const datesProvided = !!quote.startDate && !!quote.endDate;
  const datesInOrder =
    !datesProvided ||
    new Date(quote.endDate).getTime() >
      new Date(quote.startDate).getTime();
  const startInPast = !!quote.startDate && quote.startDate < today;
  const datesValid = datesProvided && datesInOrder && !startInPast;
  const clientAdded = quote.clientName.trim().length > 0;
  const step3Ready = clientAdded && datesValid;

  let ctaLabel: string | undefined;
  let ctaDisabled = false;
  let ctaAction: (() => void) | undefined;
  let ctaHref: string | undefined;
  let ctaHrefOnClick: (() => void) | undefined;
  let hint: string | undefined;

  if (step === 1) {
    ctaLabel = "Continue to selection";
    ctaDisabled = !hotel;
    ctaAction = () => goTo(2);
    if (!hotel) hint = "Pick a property above to continue.";
  } else if (step === 2) {
    ctaLabel = "Build your quote";
    ctaAction = () => goTo(3);
  } else if (step === 3) {
    ctaLabel = "Review quote";
    ctaDisabled = !step3Ready;
    ctaAction = () => goTo(4);
    if (!clientAdded) hint = "Add a client name to continue.";
    else if (!datesValid) hint = "Pick valid travel dates to continue.";
  } else if (step === 4) {
    ctaLabel = "Send quote";
    ctaAction = () => goTo(5);
  } else if (step === 5) {
    ctaLabel = "Back to all tools";
    ctaHref = "/";
    ctaHrefOnClick = reset;
  }

  return (
    <>
      <div className="container-walkthrough pt-6 lg:max-w-5xl lg:px-6">
        <WalkthroughNav
          currentStep={step}
          onExit={handleExit}
          onBack={() => goTo(Math.max(0, step - 1))}
        />
      </div>

      {step === 0 && (
        <div className="lg:max-w-5xl lg:mx-auto lg:px-6 px-4 py-6 lg:py-10">
          <Step0Welcome
            clientName={quote.clientName}
            onClientNameChange={(v) =>
              setQuote((q) => ({ ...q, clientName: v }))
            }
          />
          <div className="max-w-xl mx-auto mt-8">
            <button
              type="button"
              onClick={() => goTo(1)}
              className="w-full text-sm font-semibold py-3 rounded-md bg-brown hover:bg-brownHover text-white transition-colors"
            >
              Let's get started →
            </button>
          </div>
        </div>
      )}

      {step > 0 && (
      <div className="lg:flex lg:gap-8 lg:max-w-5xl lg:mx-auto lg:px-6 lg:items-start lg:py-6 px-4 py-4">
      {/* Main column */}
      <div className="lg:flex-1 min-w-0">
        {step === 1 && (
          <Step1ChoosePartner
            selectedHotel={hotel}
            onSelect={(h) => setSession((s) => ({ ...s, hotelId: h.id }))}
          />
        )}

        {step === 2 && hotel && <Step2YourSelection hotel={hotel} />}

        {step === 3 && hotel && (
          <Step3BuildQuote
            hotel={hotel}
            value={quote}
            onChange={(patch) => setQuote((q) => ({ ...q, ...patch }))}
            today={today}
            datesValid={datesValid}
            startInPast={startInPast}
            datesInOrder={datesInOrder}
            datesProvided={datesProvided}
          />
        )}

        {step === 4 && hotel && (
          <Step4ReviewSend
            hotel={hotel}
            clientName={quote.clientName}
            startDate={quote.startDate}
            endDate={quote.endDate}
            guests={quote.guests}
            markup={quote.markup}
          />
        )}

        {step === 5 && hotel && (
          <Step5Complete
            earnings={calcEarnings(
              calcBasePrice(hotel, nightsBetween(quote.startDate, quote.endDate) || 7),
              hotel,
            )}
            onRestart={reset}
          />
        )}
      </div>

      {/* Sidebar — present on every step */}
      <WalkthroughSidebar
        currentStep={step}
        onGoTo={step < 5 ? goTo : undefined}
        hint={hint}
        ctaLabel={ctaLabel}
        ctaDisabled={ctaDisabled}
        onCta={ctaAction}
        ctaHref={ctaHref}
        onCtaHrefClick={ctaHrefOnClick}
        notice={
          step === 1 && hotel && !hotel.isReserve ? (
            <div className="rounded-lg p-4 bg-warningBanner border-l-[3px] border-reserve fade-up">
              <div className="flex gap-2 items-start text-xs text-ink/90 leading-relaxed">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold">Heads up:</span> this
                  property isn't a Fora Reserve partner. You'll still earn
                  commission, but Reserve properties offer higher rates and
                  exclusive client perks.
                </p>
              </div>
            </div>
          ) : undefined
        }
      />
      </div>
      )}
    </>
  );
}
