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
export const STORAGE_KEY = "fora.first-client-finder.v2";

export const emptySession: SavedSession = { answers: null, cards: {} };

export const EMPTY_CARD: CardState = {
  name: "",
  interacted: false,
  sent: false,
  followUpOpen: false,
};
