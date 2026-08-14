"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import type { CategoryId } from "@/lib/gift-config";

// Near-real-time via short-interval polling rather than a persistent
// connection (plan.md/docs/environments.md — Convex was replaced with Neon).
const POLL_INTERVAL_MS = 15_000;

export type WallStats = {
  totalGifts: number;
  totalMessages: number;
  countries: number;
  supportersToday: number;
};

export function useWallStats() {
  return useSWR<WallStats>("/api/wall/stats", fetcher, {
    refreshInterval: POLL_INTERVAL_MS,
  });
}

export type PublicMessage = {
  id: string;
  displayName: string;
  location: string | null;
  body: string;
  category: string;
  isFeatured: boolean;
  createdAt: string;
};

export function useRecentMessages(limit: number) {
  return useSWR<{ messages: PublicMessage[] }>(
    `/api/wall/recent?limit=${limit}`,
    fetcher,
    { refreshInterval: POLL_INTERVAL_MS },
  );
}

export type WallPage = {
  items: PublicMessage[];
  nextCursor: string | null;
};

export function useWallPage(category: CategoryId | "all") {
  return useSWR<WallPage>(
    `/api/wall?category=${category}`,
    fetcher,
    { refreshInterval: POLL_INTERVAL_MS },
  );
}
