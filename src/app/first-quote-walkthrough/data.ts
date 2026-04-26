export type Hotel = {
  id: string;
  name: string;
  location: string;
  amenities: string[];
  rating: number;
  pricePerWeek: number;
  isReserve: boolean;
  /** Destination-themed demo photo. Plain Unsplash CDN URL so it works
   *  with `output: "export"` and `images.unoptimized = true`. */
  imageUrl: string;
  /** Reserve perks shown on the property card. Non-Reserve hotels leave empty. */
  perks?: string[];
};

export const HOTELS: Hotel[] = [
  {
    id: "villa-serena",
    name: "Villa Serena",
    location: "Amalfi Coast, Italy",
    amenities: ["Private Beach", "Michelin Dining", "Concierge"],
    rating: 4.8,
    pricePerWeek: 5800,
    isReserve: true,
    imageUrl:
      "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1200&q=70",
    perks: ["Room upgrade", "Welcome amenity", "Daily breakfast"],
  },
  {
    id: "pearl-sanctuary",
    name: "The Pearl Sanctuary",
    location: "Maldives",
    amenities: ["Overwater Villa", "Private Chef", "Diving"],
    rating: 5.0,
    pricePerWeek: 7200,
    isReserve: true,
    imageUrl:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=70",
    perks: ["Room upgrade", "Welcome amenity", "Spa credit"],
  },
  {
    id: "maison-de-luxe",
    name: "Maison de Luxe",
    location: "Paris, France",
    amenities: ["Rooftop Bar", "Boutique", "City View"],
    rating: 4.7,
    pricePerWeek: 3900,
    isReserve: true,
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=70",
    perks: ["Room upgrade", "Welcome amenity"],
  },
  {
    id: "rosewood",
    name: "The Rosewood Resort",
    location: "Bali",
    amenities: ["Ocean View", "Spa", "Pool"],
    rating: 4.9,
    pricePerWeek: 4200,
    isReserve: false,
    imageUrl:
      "https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "casa-tranquila",
    name: "Casa Tranquila",
    location: "Barcelona",
    amenities: ["Garden Terrace", "Wine Cellar", "Art Gallery"],
    rating: 4.6,
    pricePerWeek: 3200,
    isReserve: false,
    imageUrl:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "azure-retreat",
    name: "The Azure Retreat",
    location: "Santorini",
    amenities: ["Infinity Pool", "Sunset Views", "Spa"],
    rating: 4.9,
    pricePerWeek: 4800,
    isReserve: false,
    imageUrl:
      "https://images.unsplash.com/photo-1570213489059-0aac6626cade?auto=format&fit=crop&w=1200&q=70",
  },
];

export const RESERVE_COMMISSION_RATE = 0.15;
export const STANDARD_COMMISSION_RATE = 0.1;
/** @deprecated Prefer commissionRateFor(hotel). Kept for any legacy import. */
export const COMMISSION_RATE = RESERVE_COMMISSION_RATE;
export const ADVISOR_SHARE = 0.7;

export const commissionRateFor = (hotel: Pick<Hotel, "isReserve">) =>
  hotel.isReserve ? RESERVE_COMMISSION_RATE : STANDARD_COMMISSION_RATE;

export const STEP_NAMES = [
  "Client brief",
  "Choose a preferred partner",
  "Your selection",
  "Build your quote",
  "Review & send",
  "Complete",
];

// ---- Client brief ---------------------------------------------------------

export type BudgetTier =
  | "under_300"
  | "300_600"
  | "600_1000"
  | "1000_plus"
  | "unsure";

export type ClientBrief = {
  destination: string;
  startDate: string;
  endDate: string;
  guests: number;
  budget: BudgetTier;
  preferences: string;
  /** When true, the brief is intentionally empty — no filters applied. */
  undecided: boolean;
};

export const EMPTY_BRIEF: ClientBrief = {
  destination: "",
  startDate: "",
  endDate: "",
  guests: 2,
  budget: "unsure",
  preferences: "",
  undecided: false,
};

export const budgetOptions: { value: BudgetTier; label: string }[] = [
  { value: "under_300", label: "Under $300" },
  { value: "300_600", label: "$300\u2013600" },
  { value: "600_1000", label: "$600\u20131,000" },
  { value: "1000_plus", label: "$1,000+" },
  { value: "unsure", label: "Not sure yet" },
];

export const budgetLabel = (b: BudgetTier): string =>
  budgetOptions.find((o) => o.value === b)?.label ?? "Not sure yet";

/** Per-night price ranges for each budget tier. `unsure` means “no filter”. */
export const budgetRange = (
  b: BudgetTier,
): { min: number; max: number } | null => {
  switch (b) {
    case "under_300":
      return { min: 0, max: 300 };
    case "300_600":
      return { min: 300, max: 600 };
    case "600_1000":
      return { min: 600, max: 1000 };
    case "1000_plus":
      return { min: 1000, max: Infinity };
    default:
      return null;
  }
};

/** Hotels store a weekly price; convert to per-night for budget comparisons. */
export const pricePerNight = (h: Pick<Hotel, "pricePerWeek">) =>
  h.pricePerWeek / 7;

/** True when this hotel's per-night rate falls inside the brief budget tier. */
export const matchesBudget = (h: Hotel, b: BudgetTier): boolean => {
  const range = budgetRange(b);
  if (!range) return false; // "unsure" is not a positive match
  const ppn = pricePerNight(h);
  return ppn >= range.min && ppn < range.max;
};

/** Quick check: is the brief in a luxury bracket the advisor may be new to? */
export const isHighEndBrief = (b: ClientBrief): boolean =>
  b.budget === "600_1000" || b.budget === "1000_plus";

export const fmtMoney = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const fmtDate = (s: string) =>
  s
    ? new Date(s).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

/** Whole nights between two ISO yyyy-mm-dd dates. 0 if invalid or out of order. */
export const nightsBetween = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return 0;
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
};

/** Base price scales with nights against the hotel's per-week rate. */
export const calcBasePrice = (
  hotel: Pick<Hotel, "pricePerWeek">,
  nights: number,
) => (hotel.pricePerWeek / 7) * Math.max(0, nights);

export const calcCommission = (
  basePrice: number,
  hotel: Pick<Hotel, "isReserve">,
) => basePrice * commissionRateFor(hotel);

export const calcEarnings = (
  basePrice: number,
  hotel: Pick<Hotel, "isReserve">,
) => Math.round(basePrice * commissionRateFor(hotel) * ADVISOR_SHARE);

/**
 * Estimated weekly earnings shown on the property card. Per the spec:
 *   price × commission rate × advisor share
 * where `price` is the hotel's weekly rate.
 */
export const cardEarnings = (h: Hotel): number =>
  Math.round(h.pricePerWeek * commissionRateFor(h) * ADVISOR_SHARE);
