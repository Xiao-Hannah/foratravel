export type Hotel = {
  id: string;
  name: string;
  location: string;
  amenities: string[];
  rating: number;
  pricePerWeek: number;
  isReserve: boolean;
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
  },
  {
    id: "pearl-sanctuary",
    name: "The Pearl Sanctuary",
    location: "Maldives",
    amenities: ["Overwater Villa", "Private Chef", "Diving"],
    rating: 5.0,
    pricePerWeek: 7200,
    isReserve: true,
  },
  {
    id: "maison-de-luxe",
    name: "Maison de Luxe",
    location: "Paris, France",
    amenities: ["Rooftop Bar", "Boutique", "City View"],
    rating: 4.7,
    pricePerWeek: 3900,
    isReserve: true,
  },
  {
    id: "rosewood",
    name: "The Rosewood Resort",
    location: "Bali",
    amenities: ["Ocean View", "Spa", "Pool"],
    rating: 4.9,
    pricePerWeek: 4200,
    isReserve: false,
  },
  {
    id: "casa-tranquila",
    name: "Casa Tranquila",
    location: "Barcelona",
    amenities: ["Garden Terrace", "Wine Cellar", "Art Gallery"],
    rating: 4.6,
    pricePerWeek: 3200,
    isReserve: false,
  },
  {
    id: "azure-retreat",
    name: "The Azure Retreat",
    location: "Santorini",
    amenities: ["Infinity Pool", "Sunset Views", "Spa"],
    rating: 4.9,
    pricePerWeek: 4800,
    isReserve: false,
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
  "Choose a preferred partner",
  "Your selection",
  "Build your quote",
  "Review & send",
  "Complete",
];

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
