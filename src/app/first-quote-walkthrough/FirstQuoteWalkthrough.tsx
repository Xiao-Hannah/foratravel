"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { usePersistentState } from "@/lib/usePersistentState";
import { Step0Welcome } from "./Step0Welcome";
import { StepClientBrief } from "./StepClientBrief";
import { Step1ChoosePartner } from "./Step1ChoosePartner";
import { Step2YourSelection } from "./Step2YourSelection";
import { Step3BuildQuote } from "./Step3BuildQuote";
import { Step4ReviewSend } from "./Step4ReviewSend";
import { Step5Complete } from "./Step5Complete";
import { WalkthroughNav } from "./WalkthroughNav";
import { WalkthroughSidebar } from "./WalkthroughSidebar";
import {
  HOTELS,
  type Hotel,
  calcBasePrice,
  calcEarnings,
  nightsBetween,
} from "./data";
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

// Step constants — indexes line up with STEP_NAMES via (step - 1).
const STEP_WELCOME = 0;
const STEP_BRIEF = 1;
const STEP_PARTNER = 2;
const STEP_SELECTION = 3;
const STEP_QUOTE = 4;
const STEP_REVIEW = 5;
const STEP_COMPLETE = 6;

export default function FirstQuoteWalkthrough() {
  const [session, setSession] = usePersistentState<Session>(
    STORAGE_KEY,
    EMPTY_SESSION,
  );
  const [quote, setQuote] = useState<QuoteForm>(EMPTY_QUOTE);
  // Tracks whether we've already copied the brief into the quote form on
  // first entry into the build-quote step. Without this, the default
  // `guests: 2` from EMPTY_QUOTE would always win against the brief value
  // (because `2 || brief.guests === 2`) so the brief's guest count would
  // silently never be applied.
  const briefAppliedRef = useRef(false);

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
    briefAppliedRef.current = false;
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // If the persisted step somehow refers to a hotel we don't have any more
  // (e.g. catalog changed), bounce back to the property picker.
  useEffect(() => {
    if (
      session.step > STEP_PARTNER &&
      session.step < STEP_COMPLETE &&
      !hotel
    ) {
      setSession((s) => ({ ...s, step: STEP_PARTNER }));
    }
  }, [session.step, hotel, setSession]);

  // Pre-fill the quote dates and guest count from the brief on first entry
  // into the quote step, but never overwrite values the user has already
  // typed. We use a ref so the copy happens exactly once per session \u2014
  // otherwise navigating back-and-forth could re-overwrite user edits, and
  // the default `guests: 2` would block the brief's value from ever being
  // applied via `||`.
  useEffect(() => {
    if (session.step !== STEP_QUOTE) return;
    if (briefAppliedRef.current) return;
    briefAppliedRef.current = true;
    if (session.brief.undecided) return;
    setQuote((q) => ({
      ...q,
      startDate: q.startDate || session.brief.startDate || "",
      endDate: q.endDate || session.brief.endDate || "",
      guests: session.brief.guests > 0 ? session.brief.guests : q.guests,
    }));
  }, [session.step, session.brief]);

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
  const quoteReady = clientAdded && datesValid;

  let ctaLabel: string | undefined;
  let ctaDisabled = false;
  let ctaAction: (() => void) | undefined;
  let ctaHref: string | undefined;
  let ctaHrefOnClick: (() => void) | undefined;
  let hint: string | undefined;

  if (step === STEP_PARTNER) {
    ctaLabel = "Continue to selection";
    ctaDisabled = !hotel;
    ctaAction = () => goTo(STEP_SELECTION);
    if (!hotel) hint = "Pick a property above to continue.";
  } else if (step === STEP_SELECTION) {
    ctaLabel = "Build your quote";
    ctaAction = () => goTo(STEP_QUOTE);
  } else if (step === STEP_QUOTE) {
    ctaLabel = "Review quote";
    ctaDisabled = !quoteReady;
    ctaAction = () => goTo(STEP_REVIEW);
    if (!clientAdded) hint = "Add a client name to continue.";
    else if (!datesValid) hint = "Pick valid travel dates to continue.";
  } else if (step === STEP_REVIEW) {
    ctaLabel = "Send quote";
    ctaAction = () => goTo(STEP_COMPLETE);
  }

  return (
    <>
      <div className="container-walkthrough pt-6 lg:max-w-5xl lg:px-6">
        <WalkthroughNav
          currentStep={step}
          onBack={() => goTo(Math.max(0, step - 1))}
        />
      </div>

      {step === STEP_WELCOME && (
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
              onClick={() => goTo(STEP_BRIEF)}
              className="w-full text-sm font-semibold py-3 rounded-md bg-brown hover:bg-brownHover text-white transition-colors"
            >
              Let&rsquo;s get started →
            </button>
          </div>
        </div>
      )}

      {step === STEP_BRIEF && (
        <div className="lg:max-w-5xl lg:mx-auto lg:px-6 px-4 py-6 lg:py-10">
          <StepClientBrief
            brief={session.brief}
            onChange={(patch) =>
              setSession((s) => ({ ...s, brief: { ...s.brief, ...patch } }))
            }
            onSubmit={() => goTo(STEP_PARTNER)}
            onSkip={() => goTo(STEP_PARTNER)}
          />
        </div>
      )}

      {step > STEP_BRIEF && (
        <div className="lg:flex lg:gap-8 lg:max-w-5xl lg:mx-auto lg:px-6 lg:items-start lg:py-6 px-4 py-4">
          {/* Main column */}
          <div className="lg:flex-1 min-w-0">
            {step === STEP_PARTNER && (
              <Step1ChoosePartner
                selectedHotel={hotel}
                onSelect={(h) =>
                  setSession((s) => ({ ...s, hotelId: h.id }))
                }
                brief={session.brief}
              />
            )}

            {step === STEP_SELECTION && hotel && (
              <Step2YourSelection hotel={hotel} />
            )}

            {step === STEP_QUOTE && hotel && (
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

            {step === STEP_REVIEW && hotel && (
              <Step4ReviewSend
                hotel={hotel}
                clientName={quote.clientName}
                startDate={quote.startDate}
                endDate={quote.endDate}
                guests={quote.guests}
                markup={quote.markup}
              />
            )}

            {step === STEP_COMPLETE && hotel && (
              <Step5Complete
                earnings={calcEarnings(
                  calcBasePrice(
                    hotel,
                    nightsBetween(quote.startDate, quote.endDate) || 7,
                  ),
                  hotel,
                )}
                onRestart={reset}
              />
            )}
          </div>

          {/* Sidebar — present on every step from the brief onward */}
          <WalkthroughSidebar
            currentStep={step}
            onGoTo={step < STEP_COMPLETE ? goTo : undefined}
            hint={hint}
            ctaLabel={ctaLabel}
            ctaDisabled={ctaDisabled}
            onCta={ctaAction}
            ctaHref={ctaHref}
            onCtaHrefClick={ctaHrefOnClick}
            notice={
              step === STEP_PARTNER && hotel && !hotel.isReserve ? (
                <div className="rounded-lg p-4 bg-warningBanner border-l-[3px] border-reserve fade-up">
                  <div className="flex gap-2 items-start text-xs text-ink/90 leading-relaxed">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <p>
                      <span className="font-semibold">Heads up:</span> this
                      property isn&rsquo;t a Fora Reserve partner. You&rsquo;ll
                      still earn commission, but Reserve properties offer
                      higher rates and exclusive client perks.
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
