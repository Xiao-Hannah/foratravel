/**
 * The persisted state for the walkthrough. Kept intentionally small — the
 * Step 3 form fields live in component state so typing stays snappy and
 * doesn't write to localStorage on every keystroke.
 */
export type Session = {
  step: number;            // 1 — 5
  hotelId: string | null;
};

export const EMPTY_SESSION: Session = {
  step: 0,
  hotelId: null,
};

export const STORAGE_KEY = "fora.first-quote-walkthrough.v1";
