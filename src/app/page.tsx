import Link from "next/link";
import { StartWalkthroughLink } from "./tools/first-quote-walkthrough/StartWalkthroughLink";

type Tool = {
  slug: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  status: "live" | "soon";
};

const tools: Tool[] = [
  {
    slug: "first-client-finder",
    number: "01",
    name: "First Client Finder",
    tagline: "Three names. Three messages. Today.",
    description:
      "Identify your first three potential clients and send a personalized outreach message in minutes.",
    status: "live",
  },
  {
    slug: "first-quote-walkthrough",
    number: "02",
    name: "First Quote Walkthrough",
    tagline: "From partner to send, in five steps.",
    description:
      "Walk through your very first quote — pick a preferred partner, build the numbers, and see what you'll earn before you hit send.",
    status: "live",
  },
  {
    slug: "supplier-cheatsheet",
    number: "03",
    name: "Supplier Cheatsheet",
    tagline: "Preferred partners, in your pocket.",
    description:
      "A searchable reference of preferred partners and the perks that matter most.",
    status: "soon",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 sm:pt-20">
      {/* Editorial hero */}
      <section className="grid gap-10 sm:grid-cols-12 sm:gap-12">
        <div className="sm:col-span-7">
          <p className="eyebrow">Issue 01 / Getting started</p>
          <h1 className="mt-6 font-display text-5xl font-normal leading-[0.95] tracking-tighter2 text-ink sm:text-7xl">
            Small tools.
            <br />
            <span className="italic">Big first bookings.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/75 sm:text-lg">
            Lightweight, no-login utilities built for new Fora advisors. Pick
            one and go. Most of them take less than five minutes.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link href="/tools/first-client-finder" className="btn-primary">
              Start with tool 01
            </Link>
            <a
              href="https://www.foratravel.com/join/advisor-onboarding"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/70 underline-offset-4 hover:underline"
            >
              Not an advisor yet?
            </a>
          </div>
        </div>

        <aside className="sm:col-span-5">
          <div className="relative h-full min-h-[260px] overflow-hidden rounded-2xl bg-creamDeep p-6 sm:p-8">
            <div className="absolute right-6 top-6 font-display text-7xl italic leading-none text-ink/15 sm:text-8xl">
              ✻
            </div>
            <p className="eyebrow">A note from the editors</p>
            <p className="mt-4 font-display text-2xl leading-snug tracking-tightish text-ink sm:text-[28px]">
              "You don't need a brand, a website, or a logo to get your first
              client. You need three text messages."
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.16em] text-ink/60">
              Fora Tools
            </p>
          </div>
        </aside>
      </section>

      <div className="mt-20 flex items-baseline justify-between">
        <h2 className="font-display text-3xl font-normal tracking-tightish text-ink sm:text-4xl">
          The toolkit
        </h2>
        <p className="hidden text-xs uppercase tracking-[0.16em] text-ink/55 sm:block">
          {tools.length} tools · 2 live
        </p>
      </div>
      <div className="mt-6 rule" />

      <ul className="divide-y divide-ink/10">
        {tools.map((tool) => {
          const inner = (
            <article
              className={`group grid gap-6 py-8 sm:grid-cols-12 sm:items-baseline sm:gap-10 ${
                tool.status === "live" ? "" : "opacity-60"
              }`}
            >
              <div className="font-display text-3xl tracking-tightish text-ink/40 sm:col-span-1 sm:text-4xl">
                {tool.number}
              </div>
              <div className="sm:col-span-7">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-2xl font-normal tracking-tightish text-ink sm:text-3xl">
                    {tool.name}
                  </h3>
                  {tool.status === "soon" && (
                    <span className="rounded-full border border-ink/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-2 font-display text-lg italic leading-snug text-ink/80">
                  {tool.tagline}
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
                  {tool.description}
                </p>
              </div>
              <div className="sm:col-span-4 sm:text-right">
                {tool.status === "live" ? (
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink transition group-hover:gap-3">
                    Open tool <span aria-hidden>→</span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">
                    In development
                  </span>
                )}
              </div>
            </article>
          );
          return (
            <li key={tool.slug}>
              {tool.status === "live" ? (
                tool.slug === "first-quote-walkthrough" ? (
                  <StartWalkthroughLink className="block">
                    {inner}
                  </StartWalkthroughLink>
                ) : (
                  <Link href={`/tools/${tool.slug}`} className="block">
                    {inner}
                  </Link>
                )
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
