// Client-side gift configuration for display and optimistic UI. The
// authoritative amounts live in the `events` table and are re-resolved
// server-side in lib/gift-validation.ts — the client's numbers are never
// trusted for payment (plan.md §7).

export const MESSAGE_MAX_LENGTH = 280;

// Provisional bounds from milestone.md M0 (min ₦500 / max ₦1,000,000).
export const CUSTOM_MIN_KOBO = 500_00;
export const CUSTOM_MAX_KOBO = 1_000_000_00;

export const CATEGORIES = [
  { id: "wish", label: "Wish" },
  { id: "advice", label: "Advice" },
  { id: "prayer", label: "Prayer" },
  { id: "roast", label: "Roast" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type GiftTier = {
  id: "slice" | "big_slice" | "energy" | "custom";
  emoji: string;
  name: string;
  amountKobo: number | null; // null = custom amount
  description: string;
};

export const GIFT_TIERS: GiftTier[] = [
  {
    id: "slice",
    emoji: "🍰",
    name: "One Slice",
    amountKobo: 1_000_00,
    description: "Just enough to say happy birthday.",
  },
  {
    id: "big_slice",
    emoji: "🎂",
    name: "Big Slice",
    amountKobo: 2_500_00,
    description: "Okay, you actually like me.",
  },
  {
    id: "energy",
    emoji: "🥂",
    name: "Birthday Energy",
    amountKobo: 5_000_00,
    description: "Now we're celebrating properly.",
  },
  {
    id: "custom",
    emoji: "👑",
    name: "You really love Tife",
    amountKobo: null,
    description: "Show me love in your own way.",
  },
];
