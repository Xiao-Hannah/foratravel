"use client";

export default function Intro({
  onStart,
  hasSavedSession,
}: {
  onStart: () => void;
  hasSavedSession: boolean;
}) {
  return (
    <section className="animate-fadeUp">
      <p className="eyebrow">A field guide</p>
      <h1 className="mt-5 font-display text-5xl font-normal leading-[0.95] tracking-tighter2 text-ink sm:text-6xl">
        Find your first
        <br />
        <span className="italic">three clients.</span>
      </h1>

      <p className="mt-6 max-w-md text-base leading-relaxed text-ink/75 sm:text-lg">
        Most new advisors don't lack potential clients. They just don't
        recognize them. Answer three quick questions and we'll show you
        exactly who to message first, in words that sound like you.
      </p>

      {/* Sample card preview so the value is visible BEFORE the quiz. */}
      <figure className="relative mt-10 border-l-2 border-ink/80 pl-6">
        <p className="eyebrow">Example outreach</p>
        <p className="mt-3 font-display text-xl leading-snug tracking-tightish text-ink sm:text-2xl">
          The friend who just got engaged.
        </p>
        <blockquote className="mt-3 font-display text-base italic leading-relaxed text-ink/80 sm:text-lg">
          &ldquo;Hi Sam, congrats again on the engagement! Quick update on my
          end: I recently joined Fora as a travel advisor. If you haven&rsquo;t
          booked your honeymoon yet, I&rsquo;d be happy to put a couple of
          options together.&rdquo;
        </blockquote>
      </figure>

      <div className="mt-12">
        <button type="button" onClick={onStart} className="btn-primary w-full sm:w-auto">
          {hasSavedSession ? "Start over" : "Begin (60 seconds)"}
        </button>
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-ink/55">
          No login · Nothing leaves your device
        </p>
      </div>
    </section>
  );
}
