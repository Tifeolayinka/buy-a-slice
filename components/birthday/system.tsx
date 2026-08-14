import { Heart } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type GiftTierCardProps = {
  emoji: string;
  name: string;
  amount: string;
  description: string;
  selected?: boolean;
};

type MessageCardProps = {
  initials: string;
  name: string;
  location?: string;
  message: string;
  time: string;
  likes?: number;
  featured?: boolean;
};

type StatCardProps = {
  emoji: string;
  value: React.ReactNode;
  label: string;
};

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2" aria-label="Buy Tife a Slice">
      <span className={cn("leading-none", compact ? "text-xl" : "text-3xl")} aria-hidden="true">
        🎂
      </span>
      <span
        className={cn(
          "font-heading leading-[0.86] font-semibold tracking-[-0.035em]",
          compact ? "text-sm" : "text-2xl",
        )}
      >
        Buy Tife
        <br />a Slice
      </span>
    </div>
  );
}

export function CategoryChip({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return <Badge variant={active ? "default" : "outline"}>{children}</Badge>;
}

export function GiftTierCard({
  emoji,
  name,
  amount,
  description,
  selected = false,
}: GiftTierCardProps) {
  return (
    <Card
      size="sm"
      className={cn(
        "relative min-h-32 justify-center transition-[border-color,box-shadow,transform]",
        selected && "border-ring shadow-float",
      )}
    >
      <CardHeader className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-4">
        <span className="text-4xl leading-none" aria-hidden="true">
          {emoji}
        </span>
        <div className="flex flex-col gap-0.5">
          <CardTitle>{name}</CardTitle>
          <p className="font-semibold">{amount}</p>
          <CardDescription>{description}</CardDescription>
        </div>
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full border-2 border-muted-foreground/60",
            selected && "border-primary",
          )}
          aria-hidden="true"
        >
          {selected ? <span className="size-2.5 rounded-full bg-primary" /> : null}
        </span>
      </CardHeader>
    </Card>
  );
}

export function StatCard({ emoji, value, label }: StatCardProps) {
  return (
    <Card size="sm" className="min-w-0 text-center">
      <CardContent className="flex flex-col items-center gap-1">
        <span className="text-xl" aria-hidden="true">
          {emoji}
        </span>
        <strong className="text-lg leading-none">{value}</strong>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

export function MessageCard({
  initials,
  name,
  location,
  message,
  time,
  likes,
  featured = false,
}: MessageCardProps) {
  if (featured) {
    return (
      <Card className="border-celebration/40 bg-linear-to-br from-celebration to-celebration-strong text-primary-foreground">
        <CardHeader>
          <span className="font-heading text-5xl leading-none opacity-55" aria-hidden="true">
            “
          </span>
          <CardTitle className="font-sans text-2xl leading-snug font-semibold">
            {message}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-right text-sm opacity-85">
            — {name}{location ? ` from ${location}` : ""}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate">{name}</CardTitle>
            {location ? <CardDescription>{location}</CardDescription> : null}
          </div>
        </div>
        <CardAction>
          <span className="text-xs text-muted-foreground">{time}</span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="leading-relaxed">{message}</p>
        {typeof likes === "number" ? (
          <span className="inline-flex items-center justify-end gap-1 text-xs text-celebration-strong">
            <Heart aria-hidden="true" />
            {likes}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
