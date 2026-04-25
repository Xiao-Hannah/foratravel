// Domain types and rule-based recommendation logic for First Client Finder.
// All client-side, no external data, no ML.

export type Background =
  | "creative"
  | "corporate"
  | "education"
  | "wellness"
  | "other";

export type Network =
  | "friends_family"
  | "colleagues"
  | "social"
  | "community"
  | "mix";

export type Specialty =
  | "luxury"
  | "family"
  | "honeymoon"
  | "adventure"
  | "beach";

export type Answers = {
  background: Background;
  network: Network;
  specialty: Specialty;
};

export type TieStrength = "close" | "weak" | "broadcast";

export type Archetype = {
  id: string;
  /** "The Colleague Planning a Honeymoon" */
  name: string;
  /** Tie strength bucket so the 3 returned cards always feel different. */
  tie: TieStrength;
  /** One-sentence "why they need a travel advisor". */
  why: string;
  /** Authority line: "why this person?" micro-explainer. */
  rationale: string;
  /** First outreach message. {{name}} is the recipient placeholder. */
  message: string;
  /** Two-sentence follow-up if they say yes / show interest. */
  followUp: string;
};

// ---------- Quiz options (label data lives with logic for one source of truth)

export const backgroundOptions: { value: Background; label: string }[] = [
  { value: "creative", label: "Creative & Lifestyle" },
  { value: "corporate", label: "Corporate & Finance" },
  { value: "education", label: "Education & Community" },
  { value: "wellness", label: "Health & Wellness" },
  { value: "other", label: "Other" },
];

export const networkOptions: { value: Network; label: string }[] = [
  { value: "friends_family", label: "Friends & Family" },
  { value: "colleagues", label: "Work Colleagues" },
  { value: "social", label: "Social Media Followers" },
  { value: "community", label: "Local Community" },
  { value: "mix", label: "Mix of all" },
];

export const specialtyOptions: { value: Specialty; label: string }[] = [
  { value: "luxury", label: "Luxury Hotels" },
  { value: "family", label: "Family Trips" },
  { value: "honeymoon", label: "Honeymoons & Romance" },
  { value: "adventure", label: "Adventure Travel" },
  { value: "beach", label: "Beach & Resorts" },
];

// ---------- Message fragments
//
// Voice rules (so future edits stay on-brand):
//   - Warm but professional. The advisor is running a business, not texting.
//   - Proper capitalization and punctuation. Contractions are fine.
//   - No slang, no abbreviations (lmk, rn, obvs), no all-lowercase.
//   - No em dashes (commas, periods, or parentheses instead).
//   - No marketing phrases ("I'd love to help", "reach out", "exclusive offers").
//   - Short and direct. If a sentence sounds like a brochure, cut it.

const specialtyHook: Record<Specialty, string> = {
  luxury:
    "I have access to rates and perks at a wide range of luxury hotels that you can't get booking direct",
  family:
    "I have access to perks at most major hotels (room upgrades, breakfast, resort credits)",
  honeymoon:
    "I'm focused on honeymoons, with access to perks at most hotels (room upgrades, spa credits, breakfast)",
  adventure:
    "I'm focused on adventure travel, and I have access to perks at most of the hotels along the way",
  beach:
    "I have access to perks at most beach resorts (room upgrades, resort credits, breakfast)",
};

const specialtyFollowUp: Record<Specialty, string> = {
  luxury:
    "If you can share roughly where and when, I'll put together a few options with the perks built in. There's no cost to you, the hotel pays my commission.",
  family:
    "Send me your rough dates and the kids' ages and I'll come back with a couple of options. There's no cost to you, the hotel pays my commission.",
  honeymoon:
    "Send me your dates and a sense of the trip you're picturing (relaxed beach, big adventure, mix of both) and I'll come back with a shortlist. No cost to you.",
  adventure:
    "Tell me what kind of trip you have in mind and I'll come back with a couple of routes. There's no cost to you, I'm paid by the hotels.",
  beach:
    "Send me rough dates and a budget and I'll come back with two or three good options. No cost to you.",
};

// ---------- Archetype builder
// Returns a deterministic set of 3 archetypes for a given Answers payload,
// guaranteeing one CLOSE tie, one WEAK tie, and one BROADCAST tie so the
// advisor sees the breadth of their network.

function buildClose(a: Answers): Archetype {
  const { specialty, background } = a;

  // Close-tie archetype keys on specialty most strongly.
  if (specialty === "honeymoon") {
    return {
      id: "close_honeymoon",
      name: "The Friend Who Just Got Engaged",
      tie: "close",
      why: "Newly engaged friends are already deep in honeymoon research, but most have no idea a travel advisor is free to use.",
      rationale:
        "Close ties have the highest reply rate, and a wedding gives you a real reason to reach out without it feeling like a pitch.",
      message: `Hi {{name}}, congrats again on the engagement! Quick update on my end: I recently joined Fora as a travel advisor. ${specialtyHook.honeymoon}. If you haven't booked your honeymoon yet, I'd be happy to put a couple of options together. No pressure either way.`,
      followUp: specialtyFollowUp.honeymoon,
    };
  }
  if (specialty === "family") {
    return {
      id: "close_family",
      name: "The Family Member Planning Summer",
      tie: "close",
      why: "Family trips are stressful to plan and family will say yes to help, especially from someone they already trust.",
      rationale:
        "Family is the most forgiving audience for your first outreach. Get your reps in here.",
      message: `Hi {{name}}, wanted to share a quick update. I recently joined Fora as a travel advisor. ${specialtyHook.family}. If you have a family trip on the calendar this year, even just a long weekend, I'd be glad to help you plan it. There's no cost to you.`,
      followUp: specialtyFollowUp.family,
    };
  }
  // Default close-tie message, works for any specialty
  return {
    id: "close_friend",
    name: "The Friend Who Travels Constantly",
    tie: "close",
    why: "They book trips all the time anyway. They just don't realize booking through you is free for them.",
    rationale: `Close ties who already travel are the fastest path to a first booking. ${capitalize(
      background,
    )} backgrounds tend to convert these first.`,
    message: `Hi {{name}}, sharing a quick update. I recently joined Fora as a travel advisor. ${specialtyHook[specialty]}. Next time you're booking a trip, send it my way and I'll handle it. There's no cost to you, the hotel pays my commission.`,
    followUp: specialtyFollowUp[specialty],
  };
}

function buildWeak(a: Answers): Archetype {
  const { network, specialty } = a;

  if (network === "colleagues" || network === "mix") {
    return {
      id: "weak_colleague",
      name: "The Colleague Planning Something Big",
      tie: "weak",
      why: "Colleagues see you every day but have no idea what you do outside of work. One message changes how they think of you.",
      rationale:
        "Work networks are a top source of first bookings for advisors with corporate or professional backgrounds.",
      message: `Hi {{name}}, wanted to share something I've started outside of work. I recently joined Fora as a travel advisor. ${specialtyHook[specialty]}. If you have a trip on the horizon, or know someone who does, I'd be glad to help.`,
      followUp: specialtyFollowUp[specialty],
    };
  }
  if (network === "community") {
    return {
      id: "weak_community",
      name: "The Parent in Your School / Community Network",
      tie: "weak",
      why: "Community ties trust referrals from each other and travel a lot, but most have never used an advisor.",
      rationale:
        "Local community networks have a lower bar to outreach because there's already shared context to lean on.",
      message: `Hi {{name}}, wanted to share a quick update. I recently joined Fora as a travel advisor. ${specialtyHook[specialty]}. If a trip ever comes up for you or anyone you know, please send them my way.`,
      followUp: specialtyFollowUp[specialty],
    };
  }
  return {
    id: "weak_acquaintance",
    name: "The Person You Haven't Talked To In A While",
    tie: "weak",
    why: "A 'just because' message gives you a real reason to reconnect and plant the seed at the same time.",
    rationale:
      "Weak ties surface more new opportunities than close ones do. That's the 'strength of weak ties' effect at work.",
    message: `Hi {{name}}, it's been a while! Wanted to share a quick update on my end. I recently joined Fora as a travel advisor. ${specialtyHook[specialty]}. No pitch here, just wanted you to know in case you're ever planning a trip.`,
    followUp: specialtyFollowUp[specialty],
  };
}

function buildBroadcast(a: Answers): Archetype {
  const { network, specialty, background } = a;

  if (network === "social" || background === "creative") {
    return {
      id: "broadcast_social",
      name: "The Follower Who Loves Your Travel Content",
      tie: "broadcast",
      why: "They've already self-selected as someone who likes how you travel. That makes them the warmest cold audience you'll ever have.",
      rationale:
        "Social followers convert because they already trust your taste. They're not strangers, they're pre-sold.",
      message: `You've seen my travel posts, so I wanted to make it official: I'm now a Fora travel advisor. ${specialtyHook[specialty]}. DM me if you have a trip coming up and I'll take it from there.`,
      followUp: specialtyFollowUp[specialty],
    };
  }
  return {
    id: "broadcast_announcement",
    name: "Your Wider Network (One Public Post)",
    tie: "broadcast",
    why: "One public post reaches 10x the people of a single DM and surfaces clients you didn't know were planning trips.",
    rationale:
      "Broadcast posts are the lowest-effort, highest-reach action you can take in your first week.",
    message: `A quick update: I recently joined Fora as a travel advisor. ${capitalize(
      specialtyHook[specialty],
    )}. If you have a trip coming up, anything from a long weekend to a once-in-a-lifetime, I'd be glad to help. There's no cost to you, the hotels pay my commission.`,
    followUp:
      "If anyone replies with a real trip, ask: 'Where are you thinking, and roughly when?' That's enough to start a real conversation.",
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function recommend(answers: Answers): Archetype[] {
  return [buildClose(answers), buildWeak(answers), buildBroadcast(answers)];
}

/** Replace {{name}} with the recipient's name (or a friendly fallback). */
export function fillMessage(template: string, name: string): string {
  const trimmed = name.trim();
  return template.replace(
    /\{\{name\}\}/g,
    trimmed.length > 0 ? trimmed : "there",
  );
}
