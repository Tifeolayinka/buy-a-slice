"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { MessageCard } from "@/components/birthday/system";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trackEvent } from "@/lib/analytics";
import { useWallPage } from "@/lib/hooks/use-wall-data";
import { initialsFrom } from "@/lib/initials";
import { relativeTime } from "@/lib/relative-time";
import { handleRadioGroupKeyDown } from "@/lib/roving-radio";
import { type CategoryId } from "@/lib/gift-config";

const FILTERS: { id: "all" | CategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wish", label: "Wishes" },
  { id: "advice", label: "Advice" },
  { id: "prayer", label: "Prayers" },
  { id: "roast", label: "Roasts" },
];

export function WallView() {
  const reducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<"all" | CategoryId>("all");
  const { data, error, isLoading } = useWallPage(filter);

  useEffect(() => {
    trackEvent({ name: "wall_viewed" });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div
        role="radiogroup"
        aria-label="Filter messages by category"
        className="flex flex-wrap justify-center gap-2"
        onKeyDown={(event) =>
          handleRadioGroupKeyDown(
            event,
            FILTERS.findIndex((entry) => entry.id === filter),
            FILTERS.length,
            (index) => {
              const entry = FILTERS[index]!;
              setFilter(entry.id);
              trackEvent({ name: "wall_filter_changed", category: entry.id });
            },
          )
        }
      >
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="radio"
            aria-checked={filter === entry.id}
            tabIndex={filter === entry.id ? 0 : -1}
            onClick={() => {
              setFilter(entry.id);
              trackEvent({ name: "wall_filter_changed", category: entry.id });
            }}
            className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
          >
            <Badge variant={filter === entry.id ? "default" : "outline"} className="px-4 py-2">
              {entry.label}
            </Badge>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
      ) : error ? (
        <p className="py-10 text-center text-muted-foreground">
          Couldn&rsquo;t load the Wall — try again shortly.
        </p>
      ) : (
        <div className="flex flex-col gap-3" aria-live="polite">
          <AnimatePresence initial={false}>
            {(data?.items ?? []).map((entry) => (
              <motion.div
                key={entry.id}
                layout={!reducedMotion}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <MessageCard
                  initials={initialsFrom(entry.displayName)}
                  name={entry.displayName}
                  location={entry.location ?? undefined}
                  message={entry.body}
                  time={relativeTime(entry.createdAt)}
                  featured={entry.isFeatured}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {data && data.items.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              No messages in this category yet — be the first!
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
