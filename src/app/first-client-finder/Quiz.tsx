"use client";

import { useState } from "react";
import {
  Answers,
  Descriptor,
  Industry,
  Network,
  Region,
  Specialty,
  descriptorOptions,
  industryOptions,
  networkOptions,
  regionOptions,
  specialtyOptions,
} from "./data";

type Draft = {
  industry: Industry | null;
  specialty: Specialty | null;
  region: Region | null;
  descriptors: Descriptor[];
  network: Network[];
};

const EMPTY_DRAFT: Draft = {
  industry: null,
  specialty: null,
  region: null,
  descriptors: [],
  network: [],
};

export default function Quiz({
  initial,
  onComplete,
  onBack,
}: {
  initial?: Partial<Answers>;
  onComplete: (answers: Answers) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => ({
    industry: initial?.industry ?? null,
    specialty: initial?.specialty ?? null,
    region: initial?.region ?? null,
    descriptors: initial?.descriptors ?? [],
    network: initial?.network ?? [],
  }));
  const [showError, setShowError] = useState(false);

  const ready =
    draft.industry !== null &&
    draft.specialty !== null &&
    draft.region !== null &&
    draft.network.length > 0;

  function setSingle<K extends "industry" | "specialty" | "region">(
    key: K,
    value: Draft[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
    setShowError(false);
  }

  function toggleMulti<K extends "descriptors" | "network">(
    key: K,
    value: Draft[K] extends Array<infer V> ? V : never,
  ) {
    setDraft((d) => {
      const arr = d[key] as Array<typeof value>;
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...d, [key]: next as Draft[K] };
    });
    setShowError(false);
  }

  function submit() {
    if (!ready) {
      setShowError(true);
      return;
    }
    onComplete({
      industry: draft.industry as Industry,
      specialty: draft.specialty as Specialty,
      region: draft.region as Region,
      descriptors: draft.descriptors,
      network: draft.network,
    });
  }

  return (
    <section className="animate-fadeUp">
      {/* Step indicator: 1 of 3 */}
      <StepIndicator step={1} />

      <div className="flex items-center justify-between">
        <p className="eyebrow">A field guide</p>
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60 transition hover:text-ink"
        >
          ← Back
        </button>
      </div>

      <h1 className="mt-4 font-display text-4xl font-normal leading-[1.05] tracking-tighter2 text-ink sm:text-[52px]">
        Find your first
        <br />
        <span className="italic">three clients.</span>
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink/75">
        Answer five quick questions and we&rsquo;ll build your personal pitch
        and a starter list of three people to message today.
      </p>

      <div className="mt-10 space-y-8">
        <Question
          label="What's your current industry or day job?"
          help="Pick one"
        >
          <Pills
            options={industryOptions}
            isSelected={(v) => draft.industry === v}
            onPick={(v) => setSingle("industry", v)}
          />
        </Question>

        <Question
          label="What type of travel do you know best or love most?"
          help="Pick one"
        >
          <Pills
            options={specialtyOptions}
            isSelected={(v) => draft.specialty === v}
            onPick={(v) => setSingle("specialty", v)}
          />
        </Question>

        <Question label="Which region do you know best?" help="Pick one">
          <Pills
            options={regionOptions}
            isSelected={(v) => draft.region === v}
            onPick={(v) => setSingle("region", v)}
          />
        </Question>

        <Question
          label="How do people usually describe you?"
          help="Pick all that apply"
        >
          <Pills
            options={descriptorOptions}
            isSelected={(v) => draft.descriptors.includes(v)}
            onPick={(v) => toggleMulti("descriptors", v)}
          />
        </Question>

        <Question
          label="Who makes up most of your network?"
          help="Pick all that apply"
        >
          <Pills
            options={networkOptions}
            isSelected={(v) => draft.network.includes(v)}
            onPick={(v) => toggleMulti("network", v)}
          />
        </Question>
      </div>

      {showError && !ready && (
        <p className="mt-6 text-sm leading-relaxed text-coral">
          Pick an industry, a travel specialty, a region, and at least one
          part of your network so we can tailor your pitch.
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        className="btn-primary mt-8 w-full"
        aria-disabled={!ready}
      >
        Build my pitch <span aria-hidden>→</span>
      </button>
    </section>
  );
}

function Question({
  label,
  help,
  children,
}: {
  label: string;
  help: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-lg leading-snug tracking-tightish text-ink sm:text-xl">
          {label}
        </p>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/55">
          {help}
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Pills<T extends string>({
  options,
  isSelected,
  onPick,
}: {
  options: { value: T; label: string }[];
  isSelected: (value: T) => boolean;
  onPick: (value: T) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = isSelected(opt.value);
        return (
          <li key={opt.value}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onPick(opt.value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition active:scale-[0.97] ${
                selected
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/25 bg-cream text-ink/80 hover:border-ink hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-6 flex items-center gap-1.5" aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={
            n < step
              ? "h-1.5 w-1.5 rounded-full bg-ink"
              : n === step
              ? "h-1.5 w-5 rounded-full bg-ink"
              : "h-1.5 w-1.5 rounded-full bg-ink/20"
          }
        />
      ))}
    </div>
  );
}
