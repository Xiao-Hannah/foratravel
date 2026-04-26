import { Answers, Tone } from "./data";

export type Stage = "intro" | "quiz" | "valueProp" | "results";

export type CardState = {
  /** recipient name input, drives the live template fill */
  name: string;
  /** tone toggle for the message preview (casual / professional) */
  tone: Tone;
  /** advisor's edits to the template, keyed by tone. Empty string is a real
   * edit (the advisor cleared the field) so we use `null` to mean "no edit
   * yet, fall back to the generated template". */
  edited: { casual: string | null; professional: string | null };
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
  /** Editable starter post (value-prop screen). null until the advisor first
   * lands on the value-prop page (it then seeds from `buildStarterPost`). */
  postDraft: string | null;
};

// v2: CardState.copied → CardState.interacted (persists once true).
// v3: Answers gained `tenure` and `workStyle` fields.
// v4: Quiz reshaped (background/network/specialty/outreachStyle).
// v5: Quiz reshaped again to one-page pill format. Multi-select on
//     descriptors + network. CardState gained tone + per-tone edited bodies.
//     Session gained postDraft for the value-prop page.
export const STORAGE_KEY = "fora.first-client-finder.v5";

export const emptySession: SavedSession = {
  answers: null,
  cards: {},
  postDraft: null,
};

export const EMPTY_CARD: CardState = {
  name: "",
  tone: "casual",
  edited: { casual: null, professional: null },
  interacted: false,
  sent: false,
  followUpOpen: false,
};
