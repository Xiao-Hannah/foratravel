"use client";

import { useState } from "react";
import { Answers, buildPitch, buildStarterPost } from "./data";
import { copyToClipboard } from "./clipboard";
import { StepIndicator } from "./Quiz";

export default function ValueProp({
  answers,
  postDraft,
  onPostChange,
  onContinue,
  onBack,
  onToast,
}: {
  answers: Answers;
  /** Persisted draft. null = never edited; falls back to generated post. */
  postDraft: string | null;
  onPostChange: (next: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onToast: (msg: string) => void;
}) {
  const pitch = buildPitch(answers);
  const generatedPost = buildStarterPost(answers);
  const post = postDraft ?? generatedPost;

  const [pitchCopied, setPitchCopied] = useState(false);
  const [postCopied, setPostCopied] = useState(false);

  async function copyPitch() {
    await copyToClipboard(pitch);
    setPitchCopied(true);
    onToast("Pitch copied to clipboard");
    window.setTimeout(() => setPitchCopied(false), 2000);
  }

  async function copyPost() {
    await copyToClipboard(post);
    setPostCopied(true);
    onToast("Post copied to clipboard");
    window.setTimeout(() => setPostCopied(false), 2000);
  }

  function resetPost() {
    onPostChange(generatedPost);
  }

  return (
    <section className="animate-fadeUp">
      <StepIndicator step={2} />

      <div className="flex items-center justify-between">
        <p className="eyebrow">Your value prop</p>
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60 transition hover:text-ink"
        >
          ← Back
        </button>
      </div>

      <h1 className="mt-4 font-display text-4xl font-normal leading-[1.05] tracking-tighter2 text-ink sm:text-[52px]">
        Here&rsquo;s what makes
        <br />
        <span className="italic">you different.</span>
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink/75">
        Use the pitch when someone asks what you do. Then reach your wider
        network with the post below.
      </p>

      {/* The elevator pitch — read-only on purpose. The whole point is that
          it's a one-liner the advisor can rehearse aloud. */}
      <div className="mt-10 border border-ink/15 bg-creamDeep/50 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Your pitch</p>
          <button
            type="button"
            onClick={copyPitch}
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brown transition hover:text-brownHover"
          >
            {pitchCopied ? "Copied ✓" : "Copy →"}
          </button>
        </div>
        <p className="mt-3 font-display text-lg italic leading-relaxed text-ink sm:text-xl">
          &ldquo;{pitch}&rdquo;
        </p>
        <p className="mt-3 text-xs leading-relaxed text-ink/60">
          Say this when someone asks what you do.
        </p>
      </div>

      {/* Editable starter post — the secondary template. The advisor is
          expected to tweak before posting, so we render an actual textarea. */}
      <div className="mt-10">
        <p className="eyebrow">Or, reach your wider network</p>
        <h2 className="mt-2 font-display text-2xl font-normal leading-snug tracking-tightish text-ink sm:text-3xl">
          One public post.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          Edit it so it sounds like you. We&rsquo;ll save your changes for the
          next screen.
        </p>

        <textarea
          value={post}
          onChange={(e) => onPostChange(e.target.value)}
          rows={9}
          className="scroll-editorial mt-4 w-full resize-y border border-ink/25 bg-cream p-4 font-sans text-sm leading-relaxed text-ink focus:border-ink focus:outline-none sm:text-base"
          aria-label="Editable starter post"
        />

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
          <button
            type="button"
            onClick={copyPost}
            className="text-brown transition hover:text-brownHover"
          >
            {postCopied ? "Copied ✓" : "Copy post →"}
          </button>
          {postDraft !== null && postDraft !== generatedPost && (
            <button
              type="button"
              onClick={resetPost}
              className="text-ink/55 transition hover:text-ink"
            >
              Reset to template
            </button>
          )}
        </div>

        <p className="mt-4 text-xs italic leading-relaxed text-ink/60">
          Content builds long-term visibility. Direct outreach gets your first
          booking faster.
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="btn-primary mt-10 w-full"
      >
        Find my first three people <span aria-hidden>→</span>
      </button>
    </section>
  );
}
