"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ModerationLogin() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(false);

    const res = await fetch("/api/moderate/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex max-w-sm flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={error || undefined}>
          <FieldLabel htmlFor="secret">Moderation secret</FieldLabel>
          <Input
            id="secret"
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            aria-invalid={error || undefined}
          />
        </Field>
      </FieldGroup>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          That secret didn&rsquo;t work.
        </p>
      ) : null}
      <Button type="submit" disabled={submitting || secret.length === 0}>
        {submitting ? "Checking…" : "Enter"}
      </Button>
    </form>
  );
}
