/**
 * Tiny class-name combiner used by the First Quote Walkthrough components
 * (a no-dep stand-in for `clsx` / `tailwind-merge`).
 */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
