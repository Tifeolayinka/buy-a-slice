"use client";

import { StatCard } from "@/components/birthday/system";
import { StatCounter } from "@/components/birthday/stat-counter";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallStats } from "@/lib/hooks/use-wall-data";

export function LiveStats() {
  const { data, error, isLoading } = useWallStats();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="mx-auto h-5 w-64" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Couldn&rsquo;t load today&rsquo;s stats — they&rsquo;ll appear once the connection is back.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm font-semibold" aria-live="polite">
        <span aria-hidden="true">❤️ </span>
        {data.supportersToday} people showed Tife love today
        <span aria-hidden="true"> ❤️</span>
      </p>
      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="🍰" label="Slices bought" value={<StatCounter value={data.totalGifts} />} />
        <StatCard emoji="💌" label="Messages" value={<StatCounter value={data.totalMessages} />} />
        <StatCard emoji="🌍" label="Countries" value={<StatCounter value={data.countries} />} />
      </div>
    </div>
  );
}
