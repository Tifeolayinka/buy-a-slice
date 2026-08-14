"use client";

import { MessageCard } from "@/components/birthday/system";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentMessages } from "@/lib/hooks/use-wall-data";
import { initialsFrom } from "@/lib/initials";
import { relativeTime } from "@/lib/relative-time";

export function RecentLove() {
  const { data, error, isLoading } = useRecentMessages(2);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-muted-foreground">
        Couldn&rsquo;t load recent messages — try again shortly.
      </p>
    );
  }

  if (!data || data.messages.length === 0) {
    return (
      <p className="text-muted-foreground">
        No messages yet — be the first to leave one!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.messages.map((entry) => (
        <MessageCard
          key={entry.id}
          initials={initialsFrom(entry.displayName)}
          name={entry.displayName}
          location={entry.location ?? undefined}
          message={entry.body}
          time={relativeTime(entry.createdAt)}
        />
      ))}
    </div>
  );
}
