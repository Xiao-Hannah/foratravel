"use client";

export default function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-sm items-start gap-3 rounded-cta border border-ink/15 bg-ink px-4 py-3 text-sm leading-snug text-cream shadow-lg animate-fadeUp"
    >
      <span aria-hidden className="mt-0.5">📋</span>
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-cream/70 transition hover:text-cream"
      >
        ×
      </button>
    </div>
  );
}
