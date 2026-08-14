import type { Metadata } from "next";

import { ModerationLogin } from "@/components/moderate/moderation-login";
import { ModerationQueue } from "@/components/moderate/moderation-queue";
import { hasModerationSession } from "@/lib/moderation-auth";

export const metadata: Metadata = {
  title: "Moderation",
  robots: { index: false, follow: false },
};

export default async function ModeratePage() {
  const authorized = await hasModerationSession();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em]">
        Moderation
      </h1>
      {authorized ? (
        <ModerationQueue />
      ) : (
        <>
          <p className="text-muted-foreground">
            Enter the moderation secret to review pending messages.
          </p>
          <ModerationLogin />
        </>
      )}
    </main>
  );
}
