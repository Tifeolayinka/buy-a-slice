"use client";

import { useState } from "react";
import useSWR from "swr";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";
import { relativeTime } from "@/lib/relative-time";

type QueueItem = {
  id: string;
  realDisplayName: string;
  isAnonymous: boolean;
  location: string | null;
  body: string;
  category: string;
  status: string;
  isFeatured: boolean;
  createdAt: string;
};

export function ModerationQueue() {
  const { data, error, isLoading, mutate } = useSWR<{ items: QueueItem[] }>(
    "/api/moderate/queue",
    fetcher,
  );
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function act(messageId: string, action: "approve" | "reject") {
    setPendingAction(messageId);
    await fetch("/api/moderate/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, action }),
    });
    setPendingAction(null);
    mutate();
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return <p className="text-muted-foreground">Couldn&rsquo;t load the queue.</p>;
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return <p className="text-muted-foreground">Nothing pending review right now.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <Card key={item.id} size="sm">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{item.realDisplayName}</CardTitle>
              {item.isAnonymous ? <Badge variant="outline">Posts anonymously</Badge> : null}
              <Badge variant="outline">{item.category}</Badge>
            </div>
            <CardDescription>
              {item.location ? `${item.location} · ` : ""}
              {relativeTime(item.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="leading-relaxed">{item.body}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={pendingAction === item.id}
                onClick={() => act(item.id, "approve")}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pendingAction === item.id}
                onClick={() => act(item.id, "reject")}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
