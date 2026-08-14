"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Share } from "lucide-react";

import { MessageCard } from "@/components/birthday/system";
import { Confetti } from "@/components/celebration/confetti";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Spinner } from "@/components/ui/spinner";

export type SuccessState = "confirming" | "success" | "failed" | "pending";

type SuccessViewProps = {
  initialState: SuccessState;
  simulated: boolean;
  submittedName?: string;
  submittedLocation?: string;
  submittedMessage?: string;
};

const SHARE_TEXT = "I just bought Tife a slice of birthday cake 🎂 Join in:";

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function SuccessView({
  initialState,
  simulated,
  submittedName,
  submittedLocation,
  submittedMessage,
}: SuccessViewProps) {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<SuccessState>(initialState);
  const [shared, setShared] = useState(false);

  const displayName = submittedName?.trim() || "Tosin";
  const displayMessage =
    submittedMessage?.trim() ||
    "Happy birthday Tife! Cheers to more wins, growth, peace and all the things your heart desires. ✨";

  // M5 replaces this with polling the server for the verified payment status.
  useEffect(() => {
    if (state === "confirming" && simulated) {
      const timer = setTimeout(() => setState("success"), 1600);
      return () => clearTimeout(timer);
    }
  }, [state, simulated]);

  async function share() {
    const url = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Buy Tife a Slice", text: SHARE_TEXT, url });
      } else {
        await navigator.clipboard.writeText(`${SHARE_TEXT} ${url}`);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch {
      // Share sheet dismissed — nothing to do.
    }
  }

  if (state === "confirming") {
    return (
      <main
        className="mx-auto flex min-h-[60svh] w-full max-w-xl flex-col items-center justify-center gap-4 px-5 text-center"
        aria-live="polite"
      >
        <Spinner className="size-8" />
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em]">
          Confirming your payment…
        </h1>
        <p className="text-muted-foreground">
          Hold on a second — we only celebrate once Paystack confirms.
        </p>
      </main>
    );
  }

  if (state === "failed") {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-5 py-16 text-center" aria-live="polite">
        <span className="text-6xl leading-none" aria-hidden="true">
          😔
        </span>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em]">
          The payment didn&rsquo;t go through
        </h1>
        <p className="text-muted-foreground">
          You weren&rsquo;t charged. Give it another try?
        </p>
        <div className="flex flex-col gap-3">
          <ButtonLink size="lg" href="/gift">
            Try again
          </ButtonLink>
          <ButtonLink variant="outline" href="/">
            Back to home
          </ButtonLink>
        </div>
      </main>
    );
  }

  if (state === "pending") {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-5 py-16 text-center" aria-live="polite">
        <span className="text-6xl leading-none" aria-hidden="true">
          💌
        </span>
        <h1 className="text-balance font-heading text-3xl font-semibold tracking-[-0.035em]">
          Message received!
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Thanks for the love. Free messages get a quick review before they
          appear on the Birthday Wall.
        </p>
        <ButtonLink size="lg" variant="outline" href="/wall">
          See the Birthday Wall
        </ButtonLink>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-5 py-12 text-center" aria-live="polite">
      <Confetti />
      <motion.span
        className="text-8xl leading-none"
        role="img"
        aria-label="Slice of cake"
        initial={reducedMotion ? false : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
      >
        🍰
      </motion.span>
      <header className="flex flex-col gap-2">
        <h1 className="text-balance font-heading text-4xl leading-tight font-semibold tracking-[-0.035em]">
          You just made Tife&rsquo;s day <span aria-hidden="true">🎉</span>
        </h1>
        <p className="text-muted-foreground">
          Your slice has officially been added to the cake.
        </p>
      </header>

      <div className="w-full text-left">
        <MessageCard
          initials={initialsFrom(displayName)}
          name={displayName}
          location={submittedLocation}
          message={displayMessage}
          time="just now"
        />
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button size="lg" onClick={share}>
          <AnimatePresence mode="wait" initial={false}>
            {shared ? (
              <motion.span
                key="copied"
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Check aria-hidden="true" /> Link copied!
              </motion.span>
            ) : (
              <motion.span
                key="share"
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Share aria-hidden="true" /> Share this <span aria-hidden="true">🎂</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        <ButtonLink size="lg" variant="outline" href="/wall">
          See the Birthday Wall
        </ButtonLink>
      </div>
      <span className="sr-only" aria-live="polite">
        {shared ? "Link copied to clipboard" : ""}
      </span>
    </main>
  );
}
