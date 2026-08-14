"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-5 py-16 text-center">
      <span className="text-6xl leading-none" aria-hidden="true">
        🫠
      </span>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em]">
        The cake wobbled
      </h1>
      <p className="text-muted-foreground">
        Something went wrong on our side. Nothing was charged — try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
