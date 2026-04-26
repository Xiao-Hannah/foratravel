// Domain types and rule-based recommendation logic for First Client Finder.
// All client-side, no external data, no ML.
//
// v5 quiz shape (April 2026):
//   - One-page pill questionnaire (no per-step navigation).
//   - Some questions are single-select (industry, specialty, region),
//     others are multi-select (descriptors, network).
//   - Drives a personalized pitch + editable public post + 3 archetype cards.

export type Industry =
  | "tech"
  | "finance"
  | "education"
  | "healthcare"
  | "creative"
  | "hospitality"
  | "other";

export type Specialty =
  | "honeymoon"
  | "family"
  | "luxury"
  | "adventure"
  | "city"
  | "food";

export type Region =
  | "europe"
  | "sea"
  | "japan"
  | "americas"
  | "middle_east"
  | "exploring";

export type Descriptor =
  | "always_travels"
  | "plans_everything"
  | "knows_restaurants"
  | "stays_on_budget"
  | "spontaneous";

export type Network =
  | "friends_family"
  | "colleagues"
  | "college"
  | "community"
  | "social"
  | "small";

export type Tone = "casual" | "professional";

export type Answers = {
  industry: Industry;
  specialty: Specialty;
  region: Region;
  /** Multi-select. May be empty. */
  descriptors: Descriptor[];
  /** Multi-select. At least one is required by the quiz UI. */
  network: Network[];
};

// ---------- Quiz options (single source of truth)

export const industryOptions: { value: Industry; label: string }[] = [
  { value: "tech", label: "Tech" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "creative", label: "Creative" },
  { value: "hospitality", label: "Hospitality" },
  { value: "other", label: "Other" },
];

export const specialtyOptions: { value: Specialty; label: string }[] = [
  { value: "honeymoon", label: "Honeymoon & Romance" },
  { value: "family", label: "Family Travel" },
  { value: "luxury", label: "Luxury & Resorts" },
  { value: "adventure", label: "Adventure & Outdoors" },
  { value: "city", label: "City Exploration" },
  { value: "food", label: "Food & Culture" },
];

export const regionOptions: { value: Region; label: string }[] = [
  { value: "europe", label: "Europe" },
  { value: "sea", label: "Southeast Asia" },
  { value: "japan", label: "Japan" },
  { value: "americas", label: "Americas" },
  { value: "middle_east", label: "Middle East" },
  { value: "exploring", label: "Still exploring" },
];

export const descriptorOptions: { value: Descriptor; label: string }[] = [
  { value: "always_travels", label: "The one who always travels" },
  { value: "plans_everything", label: "The one who plans everything" },
  { value: "knows_restaurants", label: "The one who knows good restaurants" },
  { value: "stays_on_budget", label: "The one who stays on budget" },
  { value: "spontaneous", label: "The spontaneous one" },
];

export const networkOptions: { value: Network; label: string }[] = [
  { value: "friends_family", label: "Family & close friends" },
  { value: "colleagues", label: "Colleagues & coworkers" },
  { value: "college", label: "College friends" },
  { value: "community", label: "Local community" },
  { value: "social", label: "Social media followers" },
  { value: "small", label: "I have a small network" },
];

// ---------- Voice / copy fragments
//
// Voice rules (so future edits stay on-brand):
//   - Warm but professional. The advisor is running a business.
//   - Proper capitalization and punctuation. Contractions are fine.
//   - No slang, no abbreviations (lmk, rn, obvs), no all-lowercase.
//   - No em dashes (commas, periods, or parentheses instead).
//   - No marketing phrases ("I'd love to help", "exclusive offers").
//   - Short and direct.

const SPECIALTY_AUDIENCE: Record<Specialty, string> = {
  honeymoon: "couples",
  family: "families",
  luxury: "discerning travelers",
  adventure: "adventurers",
  city: "city explorers",
  food: "food and culture lovers",
};

const SPECIALTY_TRIP: Record<Specialty, string> = {
  honeymoon: "honeymoons and romantic getaways",
  family: "family trips",
  luxury: "luxury hotel stays",
  adventure: "adventure trips",
  city: "city escapes",
  food: "food and culture trips",
};

const SPECIALTY_HOOK: Record<Specialty, string> = {
  honeymoon:
    "I have access to perks at most major hotels (room upgrades, spa credits, breakfast)",
  family:
    "I have access to perks at most major hotels (room upgrades, breakfast, resort credits)",
  luxury:
    "I have access to rates and perks at a wide range of luxury hotels you can't get booking direct",
  adventure:
    "I have access to perks at most of the hotels along the way (upgrades, breakfast, credits)",
  city:
    "I have access to perks at most major city hotels (room upgrades, breakfast, late checkout)",
  food:
    "I have access to perks at the kind of hotels that take their food seriously (upgrades, breakfast, credits)",
};

const SPECIALTY_FOLLOWUP: Record<Specialty, string> = {
  honeymoon:
    "Send me your dates and a sense of the trip you're picturing (relaxed beach, big adventure, mix of both) and I'll come back with a shortlist. No cost to you.",
  family:
    "Send me your rough dates and the kids' ages and I'll come back with a couple of options. There's no cost to you, the hotel pays my commission.",
  luxury:
    "If you can share roughly where and when, I'll put together a few options with the perks built in. There's no cost to you, the hotel pays my commission.",
  adventure:
    "Tell me what kind of trip you have in mind and I'll come back with a couple of routes. There's no cost to you, I'm paid by the hotels.",
  city:
    "Send me your dates and the city and I'll come back with two or three good options. No cost to you.",
  food:
    "Send me your dates and the destination and I'll line up hotels that put you in walking distance of the food. No cost to you.",
};

const REGION_LABEL: Record<Region, string> = {
  europe: "Europe",
  sea: "Southeast Asia",
  japan: "Japan",
  americas: "the Americas",
  middle_east: "the Middle East",
  exploring: "destinations all over the world",
};

const REGION_SHORT: Record<Region, string> = {
  europe: "Europe",
  sea: "Southeast Asia",
  japan: "Japan",
  americas: "the Americas",
  middle_east: "the Middle East",
  exploring: "anywhere",
};

// ---------- Pitch + post generators

/**
 * One-line elevator pitch the advisor uses when someone asks what they do.
 * Always returns the same shape so it reads naturally aloud.
 */
export function buildPitch(a: Answers): string {
  const audience = SPECIALTY_AUDIENCE[a.specialty];
  const trip = SPECIALTY_TRIP[a.specialty];
  const region = REGION_LABEL[a.region];
  return `I help ${audience} plan unforgettable ${trip} in ${region}, and through Fora I can get you hotel upgrades, free breakfast, and perks you simply can't get booking direct.`;
}

/**
 * Editable starter post the advisor can paste to social. Personalizes a few
 * sentences off the descriptors so it sounds like the advisor wrote it. The
 * advisor is expected to edit before posting.
 */
export function buildStarterPost(a: Answers): string {
  const region = REGION_SHORT[a.region];
  const trip = SPECIALTY_TRIP[a.specialty];

  // Pick the most "on-brand" descriptor line, in priority order. Most posts
  // only earn one personality line, more than that starts to feel listy.
  const descriptorLine = (() => {
    if (a.descriptors.includes("plans_everything")) {
      return `I'm the person my friends text when they're planning a trip to ${region}, the one with the spreadsheet for every itinerary.`;
    }
    if (a.descriptors.includes("always_travels")) {
      return `I'm the friend who's always on a flight somewhere, and the one people text the second they start planning a trip.`;
    }
    if (a.descriptors.includes("knows_restaurants")) {
      return `I'm the friend who has a restaurant rec for every neighborhood, and now I can hand you the hotels to match.`;
    }
    if (a.descriptors.includes("stays_on_budget")) {
      return `I'm the friend who knows how to make a trip feel bigger than the budget, without cutting the parts that matter.`;
    }
    if (a.descriptors.includes("spontaneous")) {
      return `I'm the friend who'll book a trip on a Tuesday and figure out the rest on the plane.`;
    }
    return `I'm the person friends ask first when they start planning a trip.`;
  })();

  return [
    `I just became a Fora travel advisor, and honestly it felt inevitable.`,
    descriptorLine,
    `Now I've made it official. If you're planning ${trip}, let me help. Through Fora I can get you perks at hotels that aren't available if you book on your own (think room upgrades, welcome amenities, and free breakfast).`,
    `Same price. Better experience. Just DM me.`,
  ].join("\n\n");
}

// ---------- Archetypes

export type TieStrength = "close" | "weak" | "broadcast";

export type Archetype = {
  id: string;
  /** "The Colleague Planning a Honeymoon" */
  name: string;
  /** Tie strength bucket */
  tie: TieStrength;
  /** One-sentence "why they need a travel advisor". */
  why: string;
  /** Authority line: "why this person?" micro-explainer. */
  rationale: string;
  /**
   * First outreach message in two tones. {{name}} is the recipient
   * placeholder (broadcast templates omit it).
   */
  messages: { casual: string; professional: string };
  /** Two-sentence follow-up if they say yes / show interest. */
  followUp: string;
};

type ArchetypeBuilder = (a: Answers) => Archetype;

const NETWORK_BUILDERS: Record<Network, ArchetypeBuilder | null> = {
  friends_family: buildClose,
  colleagues: buildColleague,
  college: buildCollegeFriend,
  community: buildCommunity,
  social: buildSocial,
  small: null, // small networks fall through to the broadcast post
};

function buildClose(a: Answers): Archetype {
  const hook = SPECIALTY_HOOK[a.specialty];
  const trip = SPECIALTY_TRIP[a.specialty];
  if (a.specialty === "honeymoon") {
    return {
      id: "close_engaged",
      name: "The Friend Who Just Got Engaged",
      tie: "close",
      why: "Newly engaged friends are already deep in honeymoon research, but most have no idea a travel advisor is free to use.",
      rationale:
        "Close ties have the highest reply rate, and a wedding is a real reason to reach out without it feeling like a pitch.",
      messages: {
        casual: `Hey {{name}}! Congrats again on the engagement. Quick life update on my end, I just became a Fora travel advisor. ${hook}. If you haven't booked your honeymoon yet, I can put together a couple of options. No pressure either way.`,
        professional: `Hi {{name}}, congratulations again on the engagement. I wanted to share a quick update: I recently joined Fora as a travel advisor. ${hook}. If you have not booked your honeymoon yet, I would be happy to put a few options together for you. There is no cost to use me as your advisor.`,
      },
      followUp: SPECIALTY_FOLLOWUP.honeymoon,
    };
  }
  if (a.specialty === "family") {
    return {
      id: "close_family",
      name: "The Family Member Planning Summer",
      tie: "close",
      why: "Family trips are stressful to plan and family will say yes to help, especially from someone they already trust.",
      rationale:
        "Family is the most forgiving audience for your first outreach. Get your reps in here.",
      messages: {
        casual: `Hey {{name}}! Quick update, I just became a Fora travel advisor. ${hook}. If you have a family trip on the calendar this year, even a long weekend, send it my way and I'll handle the planning.`,
        professional: `Hi {{name}}, sharing a quick update. I recently joined Fora as a travel advisor. ${hook}. If you have a family trip on the calendar this year, even a long weekend, I would be glad to help you plan it. There is no cost to you.`,
      },
      followUp: SPECIALTY_FOLLOWUP.family,
    };
  }
  return {
    id: "close_friend",
    name: "The Friend Who Travels Constantly",
    tie: "close",
    why: "They book trips all the time anyway. They just don't realize booking through you is free for them.",
    rationale:
      "Close ties who already travel are the fastest path to a first booking.",
    messages: {
      casual: `Hey {{name}}! Quick update, I just became a Fora travel advisor. ${hook}. Next time you're booking ${trip}, send it my way and I'll handle it. There's no cost to you, the hotel pays my commission.`,
      professional: `Hi {{name}}, sharing a quick update on my end. I recently joined Fora as a travel advisor. ${hook}. Next time you are planning ${trip}, please send it my way. There is no additional cost to use me as your advisor, the hotel pays my commission.`,
    },
    followUp: SPECIALTY_FOLLOWUP[a.specialty],
  };
}

function buildColleague(a: Answers): Archetype {
  const hook = SPECIALTY_HOOK[a.specialty];
  const trip = SPECIALTY_TRIP[a.specialty];
  return {
    id: "colleague",
    name: "The Colleague Planning a Big Trip",
    tie: "weak",
    why: "Colleagues see you every day but have no idea what you do outside of work. One message changes how they think of you.",
    rationale:
      "Work networks are a top source of first bookings, especially for advisors with a corporate or professional background.",
    messages: {
      casual: `Hey {{name}}! Random but, are you planning anything coming up? I just became a Fora travel advisor and I help people plan ${trip}. ${hook}. If you have a trip in mind, I'd love to help.`,
      professional: `Hi {{name}}, I hope you are well. I recently joined Fora as a travel advisor, focused on ${trip}. ${hook}. If you have any upcoming travel, I would be happy to help. Feel free to reach out.`,
    },
    followUp: SPECIALTY_FOLLOWUP[a.specialty],
  };
}

function buildCollegeFriend(a: Answers): Archetype {
  const hook = SPECIALTY_HOOK[a.specialty];
  const trip = SPECIALTY_TRIP[a.specialty];
  return {
    id: "college",
    name: "The College Friend You Haven't Caught Up With",
    tie: "weak",
    why: "A life update is the perfect reason to reconnect, and your news might land at exactly the right moment.",
    rationale:
      "College friends are at the age of big celebrations (engagements, milestone birthdays, first big trips). Reconnecting now is timely.",
    messages: {
      casual: `Hey {{name}}, it's been way too long. Quick life update, I just became a travel advisor with Fora, which feels very on brand for me. I focus on ${trip}. ${hook}. If you or anyone you know is planning a trip, I can actually help. Would love to catch up either way.`,
      professional: `Hi {{name}}, hope you have been well. I wanted to share a quick update: I recently joined Fora as a travel advisor, focused on ${trip}. ${hook}. If you are ever planning a trip, I would love to help. Let's also catch up soon.`,
    },
    followUp: SPECIALTY_FOLLOWUP[a.specialty],
  };
}

function buildCommunity(a: Answers): Archetype {
  const hook = SPECIALTY_HOOK[a.specialty];
  return {
    id: "community",
    name: "The Parent in Your Community Network",
    tie: "weak",
    why: "Community ties trust referrals from each other and travel a lot, but most have never used a travel advisor.",
    rationale:
      "Local community networks have a low bar for outreach because there's already shared context to lean on.",
    messages: {
      casual: `Hey {{name}}! Quick update, I just became a Fora travel advisor. ${hook}. If a trip ever comes up for you or someone in our group, send them my way.`,
      professional: `Hi {{name}}, I wanted to share a quick update. I recently joined Fora as a travel advisor. ${hook}. If a trip ever comes up for you or someone you know in our community, please send them my way.`,
    },
    followUp: SPECIALTY_FOLLOWUP[a.specialty],
  };
}

function buildSocial(a: Answers): Archetype {
  const hook = SPECIALTY_HOOK[a.specialty];
  const trip = SPECIALTY_TRIP[a.specialty];
  return {
    id: "social",
    name: "The Follower Who Loves Your Travel Content",
    tie: "broadcast",
    why: "They've already self-selected as someone who likes how you travel, which makes them the warmest cold audience you'll ever have.",
    rationale:
      "Social followers convert because they already trust your taste. They aren't strangers, they're pre-sold.",
    messages: {
      casual: `You've seen my travel posts, so I wanted to make it official: I'm now a Fora travel advisor. I focus on ${trip}. ${hook}. DM me if you have a trip coming up and I'll take it from there.`,
      professional: `A quick update for those who follow my travel content: I have officially joined Fora as a travel advisor, focused on ${trip}. ${hook}. If you have a trip coming up, please reach out and I will take it from there.`,
    },
    followUp: SPECIALTY_FOLLOWUP[a.specialty],
  };
}

function buildBroadcastPost(a: Answers): Archetype {
  // The broadcast card surfaces the editable post the advisor wrote on the
  // value-prop screen. We render that text directly as the message body.
  const post = buildStarterPost(a);
  return {
    id: "broadcast_post",
    name: "Your Wider Network (One Public Post)",
    tie: "broadcast",
    why: "One post reaches 10x the people of a single DM, and surfaces clients you didn't know were planning trips.",
    rationale:
      "Broadcast posts are the lowest-effort, highest-reach action you can take in your first week.",
    messages: { casual: post, professional: post },
    followUp:
      "If anyone replies with a real trip, ask: 'Where are you thinking, and roughly when?' That's enough to start a real conversation.",
  };
}

/**
 * Build the 3 cards from the multi-select network answer.
 *
 * Rules:
 *   - Take the first 2 networks the advisor selected (in option-list order)
 *     that have a builder; turn them into archetype cards.
 *   - Always end with the broadcast post (so there are exactly 3 cards).
 *   - If the advisor only selected one usable network (or zero, e.g.
 *     "small network" only), fill the second card with the close-tie
 *     archetype as a sensible default.
 */
export function recommend(a: Answers): Archetype[] {
  // Preserve option-list ordering, not the order the user clicked.
  const ordered = networkOptions
    .map((o) => o.value)
    .filter((v) => a.network.includes(v));

  const directBuilders: ArchetypeBuilder[] = [];
  for (const v of ordered) {
    const fn = NETWORK_BUILDERS[v];
    if (fn) directBuilders.push(fn);
    if (directBuilders.length === 2) break;
  }

  // Pad to two direct cards.
  while (directBuilders.length < 2) {
    const fallback = directBuilders.includes(buildClose)
      ? buildColleague
      : buildClose;
    directBuilders.push(fallback);
  }

  return [
    directBuilders[0](a),
    directBuilders[1](a),
    buildBroadcastPost(a),
  ];
}

/** Replace {{name}} with the recipient's name (or a friendly fallback). */
export function fillMessage(template: string, name: string): string {
  const trimmed = name.trim();
  return template.replace(
    /\{\{name\}\}/g,
    trimmed.length > 0 ? trimmed : "there",
  );
}
