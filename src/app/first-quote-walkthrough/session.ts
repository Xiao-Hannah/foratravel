import { ClientBrief, EMPTY_BRIEF } from "./data";

/**
 * The persisted state for the walkthrough. Kept intentionally small — the
 * Step "Build your quote" form fields live in component state so typing
 * stays snappy and doesn't write to localStorage on every keystroke.
 *
 * Step indexing (after the v2 brief addition):
 *   0  → Welcome (landing screen, not in STEP_NAMES progress)
 *   1  → Client brief
 *   2  → Choose a preferred partner
 *   3  → Your selection
 *   4  → Build your quote
 *   5  → Review & send
 *   6  → Complete
 */
export type Session = {
  step: number;
  hotelId: string | null;
  brief: ClientBrief;
};

export const EMPTY_SESSION: Session = {
  step: 0,
  hotelId: null,
  brief: EMPTY_BRIEF,
};

// v2: added the Client Brief step + shifted step numbering. Old v1 sessions
// don't have `brief` and the step numbers would land in the wrong screen,
// so we use a fresh key.
export const STORAGE_KEY = "fora.first-quote-walkthrough.v2";
