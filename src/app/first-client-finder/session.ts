import { Answers } from "./data";

export type Stage = "intro" | "quiz" | "results";

export type CardState = {
  /** recipient name input, drives the live template fill */
  name: string;
  /** advisor has triggered at least one send action (text/instagram/copy) */
  interacted: boolean;
  /** has the advisor marked this contact as sent */
  sent: boolean;
  /** is the follow-up section expanded */
  followUpOpen: boolean;
};

export type SavedSession = {
  answers: Answers | null;
  cards: Record<string, CardState>;
};

// v2: CardState.copied → CardState.interacted (persists once true).
// v3: Answers gained `tenure` and `workStyle` fields — old v2 sessions are
//     not compatible (would fail the recommendation logic), so we change the
//     key rather than try to migrate.
// v4: Quiz reshaped — `tenure` and `workStyle` removed, `outreachStyle` added,
//     `background` expanded. v3 saves would crash the recommender, so bump.
export const STORAGE_KEY = "fora.first-client-finder.v4";

export const emptySession: SavedSession = { answers: null, cards: {} };

export const EMPTY_CARD: CardState = {
  name: "",
  interacted: false,
  sent: false,
  followUpOpen: false,
};
