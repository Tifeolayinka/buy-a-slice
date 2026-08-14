import type { Metadata } from "next";

import { SiteNav } from "@/components/birthday/site-nav";
import { WallView } from "@/components/wall/wall-view";

export const metadata: Metadata = {
  title: "The Birthday Wall",
  description: "Messages from some pretty amazing humans.",
};

export default function WallPage() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 pt-8 pb-28">
        <header className="flex flex-col gap-2 text-center">
          <h1 className="font-heading text-4xl leading-tight font-semibold tracking-[-0.035em]">
            The Birthday Wall <span aria-hidden="true">💌</span>
          </h1>
          <p className="text-muted-foreground">
            Messages from some pretty amazing humans.
          </p>
        </header>
        <WallView />
      </main>
      <SiteNav />
    </>
  );
}
