"use client";

type Props = {
  clientName: string;
  onClientNameChange: (v: string) => void;
};

const PREVIEW_STEPS = [
  "Choose a property",
  "Review your earnings",
  "Build your quote",
  "Send with confidence",
];

/**
 * Welcome / intro screen. Captures who the user is booking for so the rest
 * of the flow can feel personal, then hands off to Step 1.
 */
export function Step0Welcome({ clientName, onClientNameChange }: Props) {
  return (
    <div className="max-w-xl mx-auto fade-up">
      <h1 className="text-3xl font-bold mb-2 leading-tight">
        Let's send your first quote.
      </h1>
      <p className="text-sm text-wtMuted leading-relaxed mb-8">
        We'll walk you through every step — from choosing the right property
        to hitting send. Takes less than 5 minutes.
      </p>

      <ol className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70 space-y-3 mb-8">
        {PREVIEW_STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-wtMutedBg text-brown font-bold text-xs shrink-0">
              {i + 1}
            </span>
            <span className="text-ink">{label}</span>
          </li>
        ))}
      </ol>

      <div className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70">
        <label
          htmlFor="welcome-client-name"
          className="block text-sm font-semibold text-ink mb-2"
        >
          Who are you booking this for?
        </label>
        <input
          id="welcome-client-name"
          type="text"
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          placeholder="e.g. a friend, family member, or client"
          className="w-full px-3 py-2.5 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
        />
        <p className="text-xs text-wtMuted mt-2">
          Optional — helps us tailor the rest of the walkthrough.
        </p>
      </div>
    </div>
  );
}
