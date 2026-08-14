import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderation",
  robots: { index: false, follow: false },
};

export default function ModeratePage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-5 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em]">
        Moderation
      </h1>
      <p className="text-muted-foreground">
        The protected moderation queue arrives in M4. Access will require the
        moderation secret on both this page and every moderation mutation.
      </p>
    </main>
  );
}
