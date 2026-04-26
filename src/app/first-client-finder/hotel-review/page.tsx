import Link from "next/link";
import CopyBlock from "../CopyBlock";

export const metadata = {
  title: "Post a Hotel Review · First Client Finder · Fora Tools",
  description:
    "A simple format for posting honest hotel reviews that build your credibility as a Fora travel advisor.",
};

const TEMPLATE = `{{HOTEL NAME}} · {{City, Country}}
{{stay length}}, {{month and year}}

Best for: {{traveler type}} (e.g. honeymooners, design-led couples,
families with older kids).

The room
{{Category booked}}. {{One sentence on what worked and what didn't —
view, layout, bathroom, soundproofing.}}

Service
{{One concrete moment of service that stood out, good or bad.
Specifics beat adjectives.}}

Food and drink
{{Breakfast included? Best restaurant on property? A drink worth
ordering at the bar?}}

Location
{{Walkable to what? How long to the nearest worthwhile neighborhood,
beach, or town?}}

Worth knowing before you book
- {{Heads-up #1, e.g. resort fee, no AC in shoulder season}}
- {{Heads-up #2, e.g. quiet vs party crowd, no kids' club}}
- {{Heads-up #3, e.g. best room category to actually request}}

My take
{{Two sentences. Who you'd send here, and who you wouldn't.}}

If you book through me as your Fora advisor, you'll get
{{breakfast / room upgrade / property credit}} on top of the same
public rate.

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
        <span>Tool 01 · Review</span>
      </nav>

      <section className="animate-fadeUp">
        <p className="eyebrow">Build your presence</p>
        <h1 className="mt-4 font-display text-4xl font-normal leading-[1.02] tracking-tighter2 text-ink sm:text-[56px]">
          Post a hotel
          <br />
          <span className="italic">review.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink/75">
          One honest, specific review changes how your network sees you. It
          tells them you actually stay in the places you talk about, and it
          gives them a reason to ask the next time they book a trip.
        </p>

        <div className="mt-10 rule" />

        {/* Step 1 */}
        <article className="mt-10">
          <p className="eyebrow">Rule 1</p>
          <h2 className="mt-3 font-display text-2xl font-normal leading-snug tracking-tightish text-ink sm:text-3xl">
            Be specific. Be honest. Be brief.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink/75">
            Five-star puff pieces don&rsquo;t convert. The reviews people
            forward to their friends share three things:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink/80">
            <li>
              At least one concrete detail no marketing site would ever
              print (the breakfast eggs, the drive from the airport, the
              room category to actually request).
            </li>
            <li>
              At least one honest caveat. If everything is perfect, no
              one believes you.
            </li>
            <li>
              A clear who-it&rsquo;s-for. People share reviews when they
              recognize themselves in the reader you&rsquo;re describing.
            </li>
          </ul>
        </article>

        {/* Step 2 */}
        <article className="mt-10">
          <p className="eyebrow">Rule 2</p>
          <h2 className="mt-3 font-display text-2xl font-normal leading-snug tracking-tightish text-ink sm:text-3xl">
            Use the format that works.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink/75">
            Whether you publish on Fora, on Instagram, or in a newsletter,
            the same skeleton holds up. Copy this and fill in the gaps.
          </p>

          <CopyBlock label="Starter template" text={TEMPLATE} />
        </article>

        {/* Step 3 */}
        <article className="mt-10">
          <p className="eyebrow">Rule 3</p>
          <h2 className="mt-3 font-display text-2xl font-normal leading-snug tracking-tightish text-ink sm:text-3xl">
            End with the offer, not a pitch.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink/75">
            The last line of the template is the only piece of selling in
            the whole post. Keep it that way:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink/80">
            <li>
              Mention one specific perk a client gets by booking through
              you (breakfast, credit, upgrade).
            </li>
            <li>
              Make it clear there&rsquo;s no cost to them, you&rsquo;re paid
              by the hotel.
            </li>
            <li>
              Don&rsquo;t ask them to do anything. The DM will come.
            </li>
          </ul>
        </article>

        <div className="mt-12 rule" />

        <h2 className="mt-10 font-display text-2xl font-normal leading-snug tracking-tightish text-ink sm:text-3xl">
          A few prompts if you&rsquo;re stuck
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink/75">
          Pick one and you&rsquo;ll have a draft in 15 minutes:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink/80">
          <li>The last hotel you stayed at, even if it wasn&rsquo;t a Fora booking.</li>
          <li>The hotel you&rsquo;d send a friend to in your home city.</li>
          <li>A hotel you&rsquo;ve been to twice. The second stay tells you what&rsquo;s real and what was just first-impression honeymoon haze.</li>
          <li>A hotel you almost recommended but didn&rsquo;t. Tell that story.</li>
        </ul>

        <p className="mt-10 text-sm leading-relaxed text-ink/65">
          Pair this with a destination guide that mentions the same
          property and you&rsquo;ll have a credible content footprint
          before the end of the week.{" "}
          <Link
            href="/first-client-finder/destination-guide"
            className="underline decoration-ink/30 underline-offset-2 transition hover:text-ink hover:decoration-ink"
          >
            See the destination guide walkthrough →
          </Link>
        </p>
      </section>
    </main>
  );
}
