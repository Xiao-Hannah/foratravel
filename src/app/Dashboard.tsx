"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "../lib/cn";

/* -------------------------------------------------------------------------
   First 60 Days dashboard
   Demo-toggle implementation: a client-side useState pill switcher swaps
   every piece of state-dependent copy. No persistence — see the comment
   above `useState` if/when this is wired to real session data.
   ------------------------------------------------------------------------- */

type Status = "green" | "amber" | "red" | "gray";
type StepIcon = "done" | "active" | "locked";

type StepState = {
  icon: StepIcon;
  title: string;
  detail: string;
  cta?: string; // optional inline CTA pill
  ctaHref?: string;
  date: string;
};

type MetricDelta = "up" | "warn" | "down" | "neutral";
type Metric = [value: string, label: string, delta: string, tone: MetricDelta];

type Segment = {
  key: string;
  pillLabel: string;
  hint: string;
  status: Status;
  statusLabel: string;
  dayBadge: string;
  title: React.ReactNode;
  sub: string;
  statusMsg: string;
  naTitle: string;
  naSub: string;
  naBtn: string;
  naHref?: string;
  /** Canned Sidekick response shown inline when a no-href CTA is clicked.
   *  Each string is one paragraph in the reply. */
  sidekickReply?: string[];
  fs: StepState;
  q: StepState;
  b: StepState;
  metrics: [Metric, Metric, Metric];
  res: [string, string, string];
};

const SEGMENTS: Segment[] = [
  {
    key: "NS",
    pillLabel: "🔴 Not Started (Day 10)",
    hint: "Stage: No client · Day 10 · Behind pace · No First Client Finder usage",
    status: "red",
    statusLabel: "Not started",
    dayBadge: "Day 10",
    title: (
      <>
        Your first client is
        <br />
        <em className="italic">closer than you think.</em>
      </>
    ),
    sub: "Most advisors already know their first client — they just haven't reached out yet. First Client Finder helps you find them in 60 seconds.",
    statusMsg:
      "You haven't found your first client yet. Start with First Client Finder — it takes 60 seconds and shows you exactly who to message first.",
    naTitle: "Find your first client",
    naSub:
      "Answer 5 quick questions and we'll show you who to message first — in words that sound like you.",
    naBtn: "Open First Client Finder →",
    naHref: "/first-client-finder",
    fs: {
      icon: "active",
      title: "Find your first client",
      detail: "Use First Client Finder to identify 3 potential clients in 60 seconds.",
      cta: "Start First Client Finder →",
      ctaHref: "/first-client-finder",
      date: "Start here",
    },
    q: {
      icon: "locked",
      title: "Send your first quote",
      detail: "Build and send a bookable quote using the Quote Walkthrough.",
      date: "Upcoming",
    },
    b: {
      icon: "locked",
      title: "Get your first booking confirmed",
      detail: "Client confirms your quote and the booking is made.",
      date: "Upcoming",
    },
    metrics: [
      ["0", "Tutorials completed", "→ Start with the basics", "warn"],
      ["0", "Forum posts", "→ Introduce yourself", "warn"],
      ["0", "Quotes sent", "→ Not started yet", "warn"],
    ],
    res: [
      'Start with "How to find your first client"',
      "Read how other advisors found their first client",
      "Answers to common getting-started questions",
    ],
  },
  {
    key: "CF",
    pillLabel: "🟡 Client Found (Day 22)",
    hint: "Stage: Client identified · Day 22 · Behind pace · No quote started",
    status: "amber",
    statusLabel: "Client found",
    dayBadge: "Day 22",
    title: (
      <>
        You found a client.
        <br />
        <em className="italic">Now send the quote.</em>
      </>
    ),
    sub: "You've identified your first potential client. The next step is sending a quote — the Quote Walkthrough takes less than 5 minutes.",
    statusMsg:
      "You identified a client 9 days ago but haven't started a quote yet. Your client may still be thinking about travel — one quote could start the booking.",
    naTitle: "Send your first quote",
    naSub:
      "Your next step takes less than 5 minutes. The Quote Walkthrough walks you through every step — from choosing a property to hitting send.",
    naBtn: "Open Quote Walkthrough →",
    naHref: "/first-quote-walkthrough",
    fs: {
      icon: "done",
      title: "Used First Client Finder",
      detail: "Built your pitch and identified 3 potential clients.",
      date: "Apr 10",
    },
    q: {
      icon: "active",
      title: "Send your first quote",
      detail:
        "Use the Quote Walkthrough to build and send a quote in under 5 minutes.",
      cta: "Open Quote Walkthrough →",
      ctaHref: "/first-quote-walkthrough",
      date: "Next",
    },
    b: {
      icon: "locked",
      title: "Get your first booking confirmed",
      detail: "Client confirms your quote and the booking is made.",
      date: "Upcoming",
    },
    metrics: [
      ["2", "Tutorials completed", '→ Try "Sending your first quote"', "warn"],
      ["1", "Forum posts", "→ Join the conversation", "warn"],
      ["0", "Quotes sent", "→ Your next step", "warn"],
    ],
    res: [
      '"Sending your first quote in 5 min" walkthrough',
      "See how other advisors sent their first quote",
      "How to find and compare the right suppliers",
    ],
  },
  {
    key: "QS",
    pillLabel: "🟡 Quote Started (Day 30)",
    hint: "Stage: Quote drafted · Day 30 · Behind pace · Not sent yet",
    status: "amber",
    statusLabel: "Quote started",
    dayBadge: "Day 30",
    title: (
      <>
        Your draft is
        <br />
        <em className="italic">almost ready to send.</em>
      </>
    ),
    sub: "You started a quote but haven't sent it yet. Advisors who send their first quote within 30 days are 3x more likely to complete a booking.",
    statusMsg:
      "Your quote draft is saved. Pick up where you left off — finishing and sending takes less than 2 minutes.",
    naTitle: "Finish and send your quote",
    naSub:
      "Not sure about pricing? Most new advisors start with a 5–10% markup. Sidekick can walk you through it.",
    naBtn: "Continue your draft →",
    naHref: "/first-quote-walkthrough",
    fs: {
      icon: "done",
      title: "Used First Client Finder",
      detail: "Built your pitch and identified 3 potential clients.",
      date: "Apr 5",
    },
    q: {
      icon: "active",
      title: "Send your first quote",
      detail: "Your draft is saved — finish and send it to your client.",
      cta: "Continue draft →",
      ctaHref: "/first-quote-walkthrough",
      date: "In progress",
    },
    b: {
      icon: "locked",
      title: "Get your first booking confirmed",
      detail: "Client confirms your quote and the booking is made.",
      date: "Upcoming",
    },
    metrics: [
      ["4", "Tutorials completed", "↑ Good progress", "up"],
      ["1", "Forum posts", "→ Join the conversation", "warn"],
      ["0", "Quotes sent", "→ Finish your draft", "warn"],
    ],
    res: [
      '"How to set your markup" — pricing guide',
      "How other advisors priced their first booking",
      "Commission tracking and payment timelines",
    ],
  },
  {
    key: "AT",
    pillLabel: "🟢 Almost There (Day 40)",
    hint: "Stage: Quote sent · On pace · Awaiting confirmation",
    status: "green",
    statusLabel: "Almost there",
    dayBadge: "Day 40",
    title: (
      <>
        Almost at your
        <br />
        <em className="italic">first booking.</em>
      </>
    ),
    sub: "Your quote is out and your client has replied. Most first bookings close within a few days of a client responding — keep the conversation going.",
    statusMsg:
      "You're on pace and your quote is out. Follow up to confirm the booking — you're closer than you think.",
    naTitle: "Follow up with your client",
    naSub:
      "Your client replied 2 days ago. A short message to confirm details can close this booking today. Sidekick can write it for you in 30 seconds.",
    naBtn: "✨ Ask Sidekick to write a follow-up →",
    sidekickReply: [
      "Hi Jamie — just checking in on the Paris quote I sent over Tuesday. Wanted to make sure it landed and see if you had any questions about the room category or the spa add-on.",
      "Happy to lock in the dates as soon as you give me the green light — the Reserve rate I quoted is held until Friday.",
      "Want me to tweak the tone, shorten it, or add a price reminder? Just say the word.",
    ],
    fs: {
      icon: "done",
      title: "Used First Client Finder",
      detail: "Built your pitch and identified 3 potential clients.",
      date: "Mar 19",
    },
    q: {
      icon: "done",
      title: "Sent your first quote",
      detail: "Quote sent to client via the Quote Walkthrough.",
      date: "Apr 2",
    },
    b: {
      icon: "active",
      title: "Get your first booking confirmed",
      detail: "Client confirms your quote and the booking is made.",
      date: "Pending",
    },
    metrics: [
      ["6", "Tutorials completed", "↑ Keep going", "up"],
      ["3", "Forum posts", "↑ Active in community", "up"],
      ["1", "Quotes sent", "→ Awaiting confirmation", "neutral"],
    ],
    res: [
      "Courses and walkthroughs to build your skills",
      "See what worked for other advisors' first clients",
      "Answers to common questions about the Portal",
    ],
  },
  {
    key: "ST",
    pillLabel: "⚫ Stalled (Day 35)",
    hint: "Stage: Client identified · 14+ days inactive · Stalled modifier active",
    status: "gray",
    statusLabel: "Stalled",
    dayBadge: "Day 35",
    title: (
      <>
        Waiting won't make
        <br />
        <em className="italic">it easier.</em>
      </>
    ),
    sub: "Every day you wait, the momentum gets harder to restart. The good news: it takes less than 5 minutes to get back on track — and Sidekick will walk you through it.",
    statusMsg:
      "You've been inactive for 14 days. The longer the gap, the harder it is to start again. One small action right now is all it takes.",
    naTitle: "Tell Sidekick what's got you stuck",
    naSub:
      "Not sure where to start? Just ask. Sidekick will figure out where you left off and give you one thing to do right now — no overwhelm, no judgment.",
    naBtn: '✨ Ask Sidekick "where do I start?" →',
    sidekickReply: [
      "No judgment — here’s where you actually are: you identified a client, you have a quote draft saved, and you’ve been quiet for two weeks. The hardest part is already done.",
      "One thing to do right now: open your saved draft and read it as if you were the client. If it still feels right, hit send. If something feels off, change one line and then send.",
      "That’s it. Don’t add new clients, don’t research more hotels — just finish the message that’s already 80% there.",
    ],
    fs: {
      icon: "done",
      title: "Used First Client Finder",
      detail: "Built your pitch and identified 3 potential clients.",
      date: "Mar 22",
    },
    q: {
      icon: "active",
      title: "Send your first quote",
      detail: "Your next step — pick up where you left off. It's still saved.",
      cta: "Continue draft →",
      ctaHref: "/first-quote-walkthrough",
      date: "Paused",
    },
    b: {
      icon: "locked",
      title: "Get your first booking confirmed",
      detail: "Client confirms your quote and the booking is made.",
      date: "Upcoming",
    },
    metrics: [
      ["2", "Tutorials completed", "↓ No activity recently", "down"],
      ["0", "Forum posts", "↓ No activity recently", "down"],
      ["0", "Quotes sent", "→ Ready when you are", "neutral"],
    ],
    res: [
      "Pick up where you left off — your progress is saved",
      "Stories from advisors who restarted and succeeded",
      "Talk to someone on the Fora team",
    ],
  },
];

/* ----- Style maps ------------------------------------------------------- */

const STATUS_BANNER: Record<Status, string> = {
  green: "bg-statusGreenBg border-statusGreenBorder",
  amber: "bg-statusAmberBg border-statusAmberBorder",
  red: "bg-statusRedBg border-statusRedBorder",
  gray: "bg-creamDeep border-ink/15",
};
const STATUS_LABEL: Record<Status, string> = {
  green: "text-statusGreenText",
  amber: "text-statusAmberText",
  red: "text-statusRedText",
  gray: "text-ink/60",
};
const STATUS_MSG: Record<Status, string> = {
  green: "text-statusGreenInk",
  amber: "text-statusAmberInk",
  red: "text-statusRedInk",
  gray: "text-ink/70",
};
const DAY_BADGE: Record<Status, string> = {
  green: "bg-statusGreenChip text-statusGreenInk",
  amber: "bg-statusAmberChip text-statusAmberInk",
  red: "bg-statusRedChip text-statusRedInk",
  gray: "bg-ink/10 text-ink/60",
};

const DELTA_TONE: Record<MetricDelta, string> = {
  up: "text-statusGreenText",
  warn: "text-statusAmberText",
  down: "text-statusRedText",
  neutral: "text-ink/60",
};

/* ----- Atoms ------------------------------------------------------------ */

function StepRow({ step }: { step: StepState }) {
  const { icon, title, detail, cta, ctaHref, date } = step;
  const muted = icon === "locked";
  return (
    <div className="flex items-start gap-3 border-t border-ink/10 py-4 last:border-b">
      <div
        className={cn(
          "mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full",
          icon === "done" && "bg-taupeDark",
          icon === "active" && "border-2 border-taupeDark bg-cream",
          icon === "locked" && "border border-ink/15 bg-creamDeep"
        )}
      >
        {icon === "done" && (
          <svg
            viewBox="0 0 12 12"
            className="h-[11px] w-[11px]"
            fill="none"
            stroke="#fff"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2,6 5,9 10,3" />
          </svg>
        )}
        {icon === "active" && (
          <span className="block h-[6px] w-[6px] rounded-full bg-taupeDark" />
        )}
        {icon === "locked" && (
          <svg
            viewBox="0 0 12 12"
            className="h-[11px] w-[11px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="6" r="3" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <div
          className={cn(
            "text-sm font-medium text-ink",
            muted && "font-normal text-ink/60"
          )}
        >
          {title}
        </div>
        <div className="mt-0.5 text-xs leading-relaxed text-ink/65">
          {detail}
        </div>
        {cta && ctaHref && (
          <Link
            href={ctaHref}
            className="mt-2 inline-block rounded-full border border-taupeDark px-3 py-0.5 text-xs font-medium text-taupeDark transition hover:bg-taupeDark hover:text-cream"
          >
            {cta}
          </Link>
        )}
      </div>
      <div className="mt-1 whitespace-nowrap text-[11px] text-ink/55">
        {date}
      </div>
    </div>
  );
}

/* ----- Page ------------------------------------------------------------- */

export default function Dashboard() {
  // Demo toggle. When wiring this to real session data, replace this state
  // with a derivation from first-client-finder + first-quote-walkthrough
  // session storage and keep the pill row as a hidden dev-only override.
  const [segKey, setSegKey] = useState<string>("AT");
  const seg = SEGMENTS.find((s) => s.key === segKey) ?? SEGMENTS[3];
  // Tracks which segment's Sidekick reply is currently expanded. Reset
  // implicitly when the user switches segments by storing the segKey itself.
  const [sidekickShownFor, setSidekickShownFor] = useState<string | null>(null);
  const sidekickOpen = sidekickShownFor === segKey;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-8 sm:px-8 sm:pt-10 lg:px-12">
      {/* Greeting */}
      <div className="mb-6 flex items-center justify-between border-b border-ink/10 pb-5">
        <p className="eyebrow">Your first 60 days</p>
        <div className="text-xs text-ink/60">Hi, Sarah 👋</div>
      </div>

      {/* Demo segment switcher */}
      <p className="eyebrow mb-2">Demo: view as segment</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {SEGMENTS.map((s) => {
          const active = s.key === segKey;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSegKey(s.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] transition",
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/20 bg-cream text-ink/70 hover:border-ink/40"
              )}
            >
              {s.pillLabel}
            </button>
          );
        })}
      </div>
      <p className="mb-6 text-[11px] italic text-ink/55">{seg.hint}</p>
      <div className="mb-6 rule" />

      {/* Two-column on lg+: narrative on the left, progress + data on the right. */}
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          {/* Hero */}
          <p className="eyebrow">Your progress</p>
          <h1 className="mt-2 font-display text-[30px] font-normal leading-tight tracking-tightish text-ink sm:text-4xl lg:text-5xl">
            {seg.title}
          </h1>
          <p className="mt-3 mb-6 max-w-xl text-[13px] leading-relaxed text-ink/65 sm:text-sm">
            {seg.sub}
          </p>

          {/* Status banner */}
          <div
            className={cn(
              "mb-6 rounded-2xl border px-6 py-5",
              STATUS_BANNER[seg.status]
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div
                  className={cn(
                    "mb-1 text-[10px] font-medium uppercase tracking-[0.1em]",
                    STATUS_LABEL[seg.status]
                  )}
                >
                  {seg.statusLabel}
                </div>
                <div
                  className={cn(
                    "text-[13px] leading-relaxed",
                    STATUS_MSG[seg.status]
                  )}
                >
                  {seg.statusMsg}
                </div>
              </div>
              <div
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-xl px-2.5 py-0.5 text-[11px] font-medium",
                  DAY_BADGE[seg.status]
                )}
              >
                {seg.dayBadge}
              </div>
            </div>
          </div>

          {/* Recommended next step */}
          <div className="mb-6 rounded-2xl border border-sand/60 bg-creamDeep/60 px-6 py-5">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-taupeDark">
              ✨ Recommended next step
            </div>
            <div className="font-display text-[17px] text-ink">
              {seg.naTitle}
            </div>
            <p className="mt-1 mb-3 text-[13px] leading-relaxed text-ink/65">
              {seg.naSub}
            </p>
            {seg.naHref ? (
              <Link
                href={seg.naHref}
                className="inline-flex items-center gap-2 rounded-cta bg-taupeDark px-4 py-2 text-[13px] font-medium text-cream transition hover:bg-taupe"
              >
                {seg.naBtn}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setSidekickShownFor(sidekickOpen ? null : segKey)
                }
                aria-expanded={sidekickOpen}
                className="inline-flex items-center gap-2 rounded-cta bg-taupeDark px-4 py-2 text-[13px] font-medium text-cream transition hover:bg-taupe"
              >
                {sidekickOpen ? "Hide Sidekick reply" : seg.naBtn}
              </button>
            )}
            {seg.sidekickReply && sidekickOpen && (
              <div className="fade-up mt-4 rounded-2xl border border-ink/10 bg-cream px-4 py-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-taupeDark text-[11px] text-cream">
                    ✦
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-taupeDark">
                    Sidekick
                  </span>
                </div>
                <div className="space-y-2 text-[13px] leading-relaxed text-ink/80">
                  {seg.sidekickReply.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick links */}
          <p className="eyebrow mb-3">Your tools</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Link
              href="/first-client-finder"
              className="group flex items-center gap-3 rounded-cta border border-ink/15 bg-cream px-4 py-3 transition hover:border-taupeDark"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-creamDeep text-sm">
                👥
              </div>
              <div>
                <div className="text-[13px] font-medium text-ink">
                  First Client Finder
                </div>
                <div className="mt-px text-[11px] text-ink/60">
                  Find your first three clients
                </div>
              </div>
            </Link>
            <Link
              href="/first-quote-walkthrough"
              className="group flex items-center gap-3 rounded-cta border border-ink/15 bg-cream px-4 py-3 transition hover:border-taupeDark"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-creamDeep text-sm">
                📋
              </div>
              <div>
                <div className="text-[13px] font-medium text-ink">
                  Quote Walkthrough
                </div>
                <div className="mt-px text-[11px] text-ink/60">
                  Build and send a quote in 5 min
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          {/* Milestones */}
          <p className="eyebrow mb-3">Milestones</p>
          <div>
            {/* Static "Joined Fora" entry — always done */}
            <StepRow
              step={{
                icon: "done",
                title: "Joined Fora",
                detail: "Account created and onboarding completed.",
                date: "Mar 17",
              }}
            />
            <StepRow step={seg.fs} />
            <StepRow step={seg.q} />
            <StepRow step={seg.b} />
            <StepRow
              step={{
                icon: "locked",
                title: "Earn your first commission",
                detail: "Paid after trip completion. Track it in your Portal.",
                date: "Upcoming",
              }}
            />
          </div>

          {/* Activity */}
          <div className="mt-8">
            <p className="eyebrow mb-3">Your Fora activity</p>
            <div className="grid grid-cols-3 gap-2.5">
              {seg.metrics.map(([val, lbl, delta, tone], i) => (
                <div key={i} className="rounded-cta bg-creamDeep px-4 py-3">
                  <div className="font-display text-[22px] text-ink">{val}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-ink/60">
                    {lbl}
                  </div>
                  <div className={cn("mt-1 text-[11px]", DELTA_TONE[tone])}>
                    {delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resources — full-width band below the two columns */}
      <div className="mt-10 border-t border-ink/10 pt-6">
        <p className="eyebrow mb-3">Resources</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            { icon: "🎓", title: "Training", sub: seg.res[0] },
            { icon: "💬", title: "Forum", sub: seg.res[1] },
            { icon: "❓", title: "Help Center", sub: seg.res[2] },
          ].map((r) => (
            <div
              key={r.title}
              className="cursor-pointer rounded-cta border border-ink/10 bg-cream px-4 py-3 transition hover:border-taupeDark"
            >
              <div className="mb-1 text-base">{r.icon}</div>
              <div className="text-[13px] font-medium text-ink">{r.title}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-ink/60">
                {r.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
