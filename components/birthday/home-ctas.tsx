"use client";

import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { trackEvent } from "@/lib/analytics";

export function HomeCtas() {
  return (
    <div className="flex w-full flex-col gap-3">
      <ButtonLink
        size="lg"
        href="/gift"
        onClick={() => trackEvent({ name: "hero_primary_clicked" })}
      >
        Buy me a slice
        <ArrowRight data-icon="inline-end" aria-hidden="true" />
      </ButtonLink>
      <ButtonLink
        size="lg"
        variant="outline"
        href="/gift?mode=message"
        onClick={() => trackEvent({ name: "message_only_clicked" })}
      >
        Leave a birthday message
      </ButtonLink>
    </div>
  );
}
