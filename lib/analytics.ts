"use client";

import { track } from "@vercel/analytics";

// Typed wrapper around the event list in plan.md §9. Every event payload
// is deliberately narrow — message bodies, real names, and location
// strings never appear here, only enum-like categorical values.

type AnalyticsEvent =
  | { name: "hero_primary_clicked" }
  | { name: "message_only_clicked" }
  | { name: "gift_tier_selected"; tier: string }
  | { name: "message_submitted"; kind: "free" | "paid" }
  | { name: "payment_initialized"; tier: string }
  | { name: "payment_confirmed" }
  | { name: "payment_failed" }
  | { name: "share_clicked"; method: "web_share" | "clipboard" }
  | { name: "wall_viewed" }
  | { name: "wall_filter_changed"; category: string };

export function trackEvent(event: AnalyticsEvent): void {
  const { name, ...properties } = event;
  track(name, properties);
}
