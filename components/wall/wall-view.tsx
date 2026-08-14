"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { MessageCard } from "@/components/birthday/system";
import { Badge } from "@/components/ui/badge";
import { type CategoryId } from "@/lib/gift-config";

type WallMessage = {
  id: string;
  initials: string;
  name: string;
  location?: string;
  message: string;
  time: string;
  likes?: number;
  featured?: boolean;
  category: CategoryId;
};

const FILTERS: { id: "all" | CategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wish", label: "Wishes" },
  { id: "advice", label: "Advice" },
  { id: "prayer", label: "Prayers" },
  { id: "roast", label: "Roasts" },
];

// Fixture messages until the live wall query lands in M3.
const MESSAGES: WallMessage[] = [
  {
    id: "m1",
    initials: "TO",
    name: "Tomi",
    location: "Toronto, CA",
    message:
      "Your ideas inspire. Your energy is unmatched. Your future is huge. Keep going, Tife. The best is yet to come.",
    time: "1h ago",
    featured: true,
    category: "wish",
  },
  {
    id: "m2",
    initials: "KM",
    name: "Kemi",
    location: "Lagos, NG",
    message:
      "Happy birthday Tife! May this new year be your best one yet. Big things loading for you! 🚀",
    time: "2h ago",
    likes: 12,
    category: "wish",
  },
  {
    id: "m3",
    initials: "A",
    name: "Anonymous",
    message:
      "Wishing you wisdom, joy, and unlimited grace this year and always. Happy birthday! 🙏",
    time: "3h ago",
    likes: 8,
    category: "prayer",
  },
  {
    id: "m4",
    initials: "DA",
    name: "Dami",
    location: "London, UK",
    message:
      "Advice for the new year: keep shipping, rest more, and stop replying to emails at 2am. 😄",
    time: "4h ago",
    likes: 7,
    category: "advice",
  },
  {
    id: "m5",
    initials: "SO",
    name: "Sophie",
    location: "Accra, GH",
    message: "Another year, another level. God's got you always! Enjoy your day! 🥳",
    time: "5h ago",
    likes: 5,
    category: "prayer",
  },
  {
    id: "m6",
    initials: "JB",
    name: "JB",
    location: "Lagos, NG",
    message:
      "You're a whole year older and still can't parallel park. Happy birthday anyway, legend. 🔥",
    time: "6h ago",
    likes: 9,
    category: "roast",
  },
];

export function WallView() {
  const reducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<"all" | CategoryId>("all");

  const visible = MESSAGES.filter(
    (entry) => filter === "all" || entry.category === filter,
  );

  return (
    <div className="flex flex-col gap-6">
      <div
        role="radiogroup"
        aria-label="Filter messages by category"
        className="flex flex-wrap justify-center gap-2"
      >
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="radio"
            aria-checked={filter === entry.id}
            onClick={() => setFilter(entry.id)}
            className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
          >
            <Badge variant={filter === entry.id ? "default" : "outline"} className="px-4 py-2">
              {entry.label}
            </Badge>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3" aria-live="polite">
        <AnimatePresence initial={false}>
          {visible.map((entry) => (
            <motion.div
              key={entry.id}
              layout={!reducedMotion}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <MessageCard {...entry} />
            </motion.div>
          ))}
        </AnimatePresence>
        {visible.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">
            No messages in this category yet — be the first!
          </p>
        ) : null}
      </div>
    </div>
  );
}
