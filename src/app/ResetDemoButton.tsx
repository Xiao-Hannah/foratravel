"use client";

export function ResetDemoButton() {
  function handleReset() {
    if (
      !window.confirm(
        "Clear all locally saved demo data? This will reload the page.",
      )
    ) {
      return;
    }
    try {
      // Remove anything namespaced under "fora." (covers all tool storage keys).
      const toRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("fora.")) {
          toRemove.push(key);
        }
      }
      toRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // Ignore — private mode, etc.
    }
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55 underline-offset-4 transition hover:text-ink hover:underline"
    >
      Reset demo data
    </button>
  );
}
