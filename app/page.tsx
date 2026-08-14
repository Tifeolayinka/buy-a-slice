import Link from "next/link";

import { BrandMark } from "@/components/birthday/system";
import { Cake } from "@/components/birthday/cake";
import { HomeCtas } from "@/components/birthday/home-ctas";
import { LiveStats } from "@/components/birthday/live-stats";
import { RecentLove } from "@/components/birthday/recent-love";
import { SiteNav } from "@/components/birthday/site-nav";

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
          <HomeCtas />
        </section>

        <section aria-label="Live stats">
          <LiveStats />
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
          <RecentLove />
        </section>
      </main>
      <SiteNav />
    </>
  );
}
