import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandMark, MessageCard, StatCard } from "@/components/birthday/system";
import { Cake } from "@/components/birthday/cake";
import { SiteNav } from "@/components/birthday/site-nav";
import { StatCounter } from "@/components/birthday/stat-counter";
import { ButtonLink } from "@/components/ui/button-link";

// Fixture data until the live stats/messages queries land in M3.
const stats = [
  { emoji: "🍰", value: 31, label: "Slices bought" },
  { emoji: "💌", value: 47, label: "Messages" },
  { emoji: "🌍", value: 6, label: "Countries" },
];

const recentMessages = [
  {
    initials: "KM",
    name: "Kemi",
    location: "Lagos, NG",
    message:
      "Happy birthday Tife! May this new year be your best one yet. Big things loading for you! 🚀",
    time: "2h ago",
  },
  {
    initials: "DA",
    name: "Dami",
    location: "London, UK",
    message: "Keep being amazing. The world is better with you in it. Happy birthday bro! 🥳",
    time: "4h ago",
  },
];

export default function HomePage() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-5 pt-8 pb-28">
        <header className="flex items-center justify-between">
          <BrandMark compact />
        </header>

        <section className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-balance font-heading text-5xl leading-[0.95] font-semibold tracking-[-0.04em]">
            It&rsquo;s Tife&rsquo;s Birthday{" "}
            <span aria-hidden="true">🎉</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            I survived another year. That deserves cake.
          </p>
          <Cake />
          <div className="flex w-full flex-col gap-3">
            <ButtonLink size="lg" href="/gift">
              Buy me a slice
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink size="lg" variant="outline" href="/gift?mode=message">
              Leave a birthday message
            </ButtonLink>
          </div>
        </section>

        <section aria-label="Live stats" className="flex flex-col gap-3">
          <p className="text-center text-sm font-semibold">
            <span aria-hidden="true">❤️ </span>42 people showed Tife love today
            <span aria-hidden="true"> ❤️</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                emoji={stat.emoji}
                label={stat.label}
                value={<StatCounter value={stat.value} />}
              />
            ))}
          </div>
        </section>

        <section aria-label="Recent love" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Recent love</h2>
            <Link
              href="/wall"
              className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
            >
              See the Birthday Wall →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentMessages.map((entry) => (
              <MessageCard key={entry.initials} {...entry} />
            ))}
          </div>
        </section>
      </main>
      <SiteNav />
    </>
  );
}
