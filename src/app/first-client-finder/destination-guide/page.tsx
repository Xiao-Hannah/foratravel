import Link from "next/link";
import CopyBlock from "../CopyBlock";

export const metadata = {
  title: "Write a Destination Guide · First Client Finder · Fora Tools",
  description:
    "A step-by-step structure for publishing your first destination guide on Fora — what to include, how to find your angle, and a template you can copy.",
};

const TEMPLATE = `{{DESTINATION}} FOR {{TRAVELER TYPE}}
A {{N}}-day itinerary by {{Your name}}, Fora Advisor

— WHY THIS TRIP —
One short paragraph on the kind of traveler this is for and why
{{Destination}} delivers on that promise (mood, pace, season).

— WHERE TO STAY —
{{Hotel 1}} — best for {{audience}}. Fora perks: {{breakfast / credit / upgrade}}.
{{Hotel 2}} — alternative if {{trade-off}}.
{{Hotel 3}} — splurge / special occasion pick.

— WHAT TO DO, DAY BY DAY —
Day 1 · {{theme of the day}}
  Morning: {{activity}}
  Lunch: {{restaurant}}
  Afternoon: {{activity}}
  Dinner: {{restaurant}}

Day 2 · {{theme of the day}}
  ...

— WHERE TO EAT —
Breakfast / coffee: {{spot}}
Casual lunch: {{spot}}
Date-night dinner: {{spot}}
Local-only pick: {{spot}}

— WHEN TO GO —
{{Best months}}, plus a sentence on what to avoid (rainy season,
festival crowds, peak prices).

— HOW I'D BOOK IT —
A short note on what most people get wrong booking this trip and
how I'd handle it differently as your advisor.

—
{{Your name}} · Fora Advisor · {{your contact}}
`;

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:pt-14">
      <nav className="mb-10 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-ink/55">
        <Link
          href="/first-client-finder"
          className="inline-flex items-center gap-2 transition hover:text-ink"
        >
          <span aria-hidden>←</span> Finder
        </Link>
        <span>Tool 01 · Guide</span>
      </nav>

      <section className="animate-fadeUp">
        <p className="eyebrow">Build your presence</p>
        <h1 className="mt-4 font-display text-4xl font-normal leading-[1.02] tracking-tighter2 text-ink sm:text-[56px]">
          Write a destination
          <br />
          <span className="italic">guide.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink/75">
          One published guide can be discovered for years. Pick a place you
          already know well and turn what&rsquo;s in your head into something
          a client can actually use.
        </p>

        <div className="mt-10 rule" />

        {/* Step 1 */}
        <article className="mt-10">
          <p className="eyebrow">Step 1</p>
          <h2 className="mt-3 font-display text-2xl font-normal leading-snug tracking-tightish text-ink sm:text-3xl">
            Pick a destination you have a real opinion about.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink/75">
            The best guides are not the most thorough. They are the ones with
            a clear point of view. Ask yourself:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink/80">
            <li>
              Where have I been three or more times? Repeat trips give you the
              kind of detail Google can&rsquo;t.
            </li>
            <li>
              Where do friends always ask me for recommendations? That&rsquo;s
              your unfair advantage.
            </li>
            <li>
              What kind of traveler is this guide for? Honeymooners and
              families need different things in the same city.
            </li>
          </ul>
        </article>

        {/* Step 2 */}
        <article className="mt-10">
          <p className="eyebrow">Step 2</p>
          <h2 className="mt-3 font-display text-2xl font-normal leading-snug tracking-tightish text-ink sm:text-3xl">
            Use the structure that converts.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink/75">
            Fora&rsquo;s top-performing guides almost all share the same
            shape. Borrow it. You can rearrange the order, but keep all six
            sections.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-ink/80">
            <li>
              <strong>Why this trip.</strong> One paragraph. Who it&rsquo;s
              for and the mood you&rsquo;re promising.
            </li>
            <li>
              <strong>Where to stay.</strong> Two or three properties with a
              one-line case for each.
            </li>
            <li>
              <strong>What to do, day by day.</strong> A real itinerary, not
              a list of attractions.
            </li>
            <li>
              <strong>Where to eat.</strong> Breakfast, lunch, dinner picks,
              plus one local-only spot.
            </li>
            <li>
              <strong>When to go.</strong> Best months and what to avoid.
            </li>
            <li>
              <strong>How I&rsquo;d book it.</strong> The advisor pitch
              hidden inside expert advice.
            </li>
          </ol>

          <CopyBlock label="Starter template" text={TEMPLATE} />
        </article>

        {/* Step 3 */}
        <article className="mt-10">
          <p className="eyebrow">Step 3</p>
          <h2 className="mt-3 font-display text-2xl font-normal leading-snug tracking-tightish text-ink sm:text-3xl">
            Publish, then share once.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink/75">
            Publishing is the win. You don&rsquo;t need it to go viral, you
            need it to exist. Once it&rsquo;s up:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink/80">
            <li>
              Send the link to one person who has actually been asking about
              the destination.
            </li>
            <li>
              Post it once where your network already follows you (one
              channel, not five).
            </li>
            <li>
              Then leave it alone. Guides earn their keep over months and
              years through search, not the launch day.
            </li>
          </ul>
        </article>

        <div className="mt-12 rule" />

        <p className="mt-6 text-sm leading-relaxed text-ink/65">
          Tip: a destination guide pairs well with a hotel review for one of
          the properties you mention. Reviews show you have on-the-ground
          experience.{" "}
          <Link
            href="/first-client-finder/hotel-review"
            className="underline decoration-ink/30 underline-offset-2 transition hover:text-ink hover:decoration-ink"
          >
            See the review walkthrough →
          </Link>
        </p>
      </section>
    </main>
  );
}
