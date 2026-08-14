"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  CATEGORIES,
  CUSTOM_MAX_KOBO,
  CUSTOM_MIN_KOBO,
  GIFT_TIERS,
  MESSAGE_MAX_LENGTH,
  type CategoryId,
  type GiftTier,
} from "@/lib/gift-config";
import { formatKoboAsNaira, nairaToKobo } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Step = "select" | "message" | "review" | "processing";

type GiftFlowProps = {
  mode: "gift" | "message";
};

const stepMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export function GiftFlow({ mode }: GiftFlowProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const [step, setStep] = useState<Step>(mode === "message" ? "message" : "select");
  const [tierId, setTierId] = useState<GiftTier["id"] | null>(GIFT_TIERS[0].id);
  const [customNaira, setCustomNaira] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [category, setCategory] = useState<CategoryId>("wish");

  const selectedTier = GIFT_TIERS.find((tier) => tier.id === tierId) ?? null;

  const amountKobo = useMemo(() => {
    if (!selectedTier) return null;
    if (selectedTier.amountKobo !== null) return selectedTier.amountKobo;
    const parsed = Number(customNaira);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return nairaToKobo(parsed);
  }, [selectedTier, customNaira]);

  const customAmountInvalid =
    selectedTier?.id === "custom" &&
    customNaira !== "" &&
    (amountKobo === null || amountKobo < CUSTOM_MIN_KOBO || amountKobo > CUSTOM_MAX_KOBO);

  const selectionValid =
    selectedTier !== null &&
    (selectedTier.amountKobo !== null ||
      (amountKobo !== null &&
        amountKobo >= CUSTOM_MIN_KOBO &&
        amountKobo <= CUSTOM_MAX_KOBO));

  const messageValid =
    message.trim().length > 0 &&
    message.length <= MESSAGE_MAX_LENGTH &&
    (anonymous || name.trim().length > 0);

  const isGiftMode = mode === "gift";

  function goBack() {
    if (step === "message" && isGiftMode) setStep("select");
    else if (step === "review") setStep("message");
    else router.push("/");
  }

  function submitMessageStep() {
    if (!messageValid) return;
    if (isGiftMode) {
      setStep("review");
    } else {
      // M4 wires this to the real pending-moderation submission.
      router.push("/success?state=pending");
    }
  }

  function submitPayment() {
    setStep("processing");
    // M5 replaces this with a real server-side Paystack initialization; the
    // submitted content is passed through the URL only for this simulation
    // so the celebration screen reflects what was actually written.
    const params = new URLSearchParams({
      state: "confirming",
      simulated: "1",
      name: anonymous ? "Anonymous" : name,
      message,
    });
    if (country) params.set("location", country);
    setTimeout(() => router.push(`/success?${params.toString()}`), 1400);
  }

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.32, 0.72, 0.3, 1] as const };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 py-8">
      {step !== "processing" ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          aria-label={step === "select" || (step === "message" && !isGiftMode) ? "Back to home" : "Previous step"}
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        {step === "select" ? (
          <motion.section key="select" {...stepMotion} transition={transition} className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
              <h1 className="font-heading text-4xl leading-tight font-semibold tracking-[-0.035em]">
                Choose your slice
              </h1>
              <p className="text-muted-foreground">
                Every slice makes my birthday sweeter <span aria-hidden="true">🧁</span>
              </p>
            </header>

            <div role="radiogroup" aria-label="Gift options" className="flex flex-col gap-3">
              {GIFT_TIERS.map((tier) => {
                const selected = tierId === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setTierId(tier.id)}
                    className="rounded-3xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
                  >
                    <Card
                      size="sm"
                      className={cn(
                        "relative min-h-28 justify-center transition-[border-color,box-shadow,transform]",
                        selected && "border-ring shadow-float",
                      )}
                    >
                      <CardHeader className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-4">
                        <span className="text-4xl leading-none" aria-hidden="true">
                          {tier.emoji}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <CardTitle>{tier.name}</CardTitle>
                          <p className="font-semibold">
                            {tier.amountKobo !== null
                              ? formatKoboAsNaira(tier.amountKobo)
                              : "Custom amount"}
                          </p>
                          <CardDescription>{tier.description}</CardDescription>
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
                  </button>
                );
              })}
            </div>

            {selectedTier?.id === "custom" ? (
              <Field data-invalid={customAmountInvalid || undefined}>
                <FieldLabel htmlFor="custom-amount">Your amount (₦)</FieldLabel>
                <Input
                  id="custom-amount"
                  type="number"
                  inputMode="numeric"
                  min={CUSTOM_MIN_KOBO / 100}
                  max={CUSTOM_MAX_KOBO / 100}
                  placeholder="e.g. 10,000"
                  value={customNaira}
                  onChange={(event) => setCustomNaira(event.target.value)}
                  aria-invalid={customAmountInvalid || undefined}
                />
                <FieldDescription>
                  Between {formatKoboAsNaira(CUSTOM_MIN_KOBO)} and{" "}
                  {formatKoboAsNaira(CUSTOM_MAX_KOBO)}.
                </FieldDescription>
              </Field>
            ) : null}

            <Button size="lg" disabled={!selectionValid} onClick={() => setStep("message")}>
              Continue
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </motion.section>
        ) : null}

        {step === "message" ? (
          <motion.section key="message" {...stepMotion} transition={transition} className="flex flex-col gap-6">
            <header className="flex flex-col items-center gap-2 text-center">
              <span className="text-5xl leading-none" aria-hidden="true">
                💌
              </span>
              <h1 className="text-balance font-heading text-4xl leading-tight font-semibold tracking-[-0.035em]">
                Say something to birthday boy <span aria-hidden="true">🎈</span>
              </h1>
              <p className="text-muted-foreground">
                A wish, prayer, advice, memory, roast — anything goes.
              </p>
            </header>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">
                  Your name{anonymous ? " (kept private)" : ""}
                </FieldLabel>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Tosin"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                {anonymous ? (
                  <FieldDescription>
                    Shown as &ldquo;Anonymous&rdquo; on the Wall — we keep this
                    for spam and abuse handling only.
                  </FieldDescription>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="country">Country (optional)</FieldLabel>
                <Input
                  id="country"
                  autoComplete="country-name"
                  placeholder="Nigeria"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="message">Your message</FieldLabel>
                <Textarea
                  id="message"
                  rows={5}
                  maxLength={MESSAGE_MAX_LENGTH}
                  placeholder="Happy birthday Tife! Cheers to more wins…"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <FieldDescription aria-live="polite">
                  {message.length}/{MESSAGE_MAX_LENGTH}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Category</FieldLabel>
                <div role="radiogroup" aria-label="Message category" className="flex flex-wrap gap-2">
                  {CATEGORIES.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      role="radio"
                      aria-checked={category === entry.id}
                      onClick={() => setCategory(entry.id)}
                      className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
                    >
                      <Badge variant={category === entry.id ? "default" : "outline"} className="px-4 py-2">
                        {entry.label}
                      </Badge>
                    </button>
                  ))}
                </div>
              </Field>

              <Field orientation="horizontal">
                <FieldLabel htmlFor="anonymous">Post anonymously</FieldLabel>
                <Switch
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={(checked) => setAnonymous(Boolean(checked))}
                />
              </Field>
            </FieldGroup>

            <Button size="lg" disabled={!messageValid} onClick={submitMessageStep}>
              {isGiftMode ? "Continue" : "Send some love"}{" "}
              <span aria-hidden="true">{isGiftMode ? "" : "❤️"}</span>
              {isGiftMode ? <ArrowRight data-icon="inline-end" aria-hidden="true" /> : null}
            </Button>
          </motion.section>
        ) : null}

        {step === "review" && selectedTier && amountKobo !== null ? (
          <motion.section key="review" {...stepMotion} transition={transition} className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
              <h1 className="font-heading text-4xl leading-tight font-semibold tracking-[-0.035em]">
                Almost there <span aria-hidden="true">🎂</span>
              </h1>
              <p className="text-muted-foreground">Review and complete your gift.</p>
            </header>

            <Card>
              <CardContent className="flex flex-col gap-4">
                <ReviewRow label="Your slice" value={`${selectedTier.emoji} ${selectedTier.name}`} />
                <ReviewRow label="Amount" value={formatKoboAsNaira(amountKobo)} />
                <ReviewRow label="Name" value={anonymous ? "Anonymous" : name} />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">Message</span>
                  <p className="leading-relaxed">{message}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button size="lg" onClick={submitPayment}>
                Buy Tife a Slice — {formatKoboAsNaira(amountKobo)}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                <span aria-hidden="true">🔒 </span>Payment is secure and encrypted. Paystack
                checkout arrives in M5 — this build simulates it.
              </p>
            </div>
          </motion.section>
        ) : null}

        {step === "processing" ? (
          <motion.section
            key="processing"
            {...stepMotion}
            transition={transition}
            className="flex min-h-64 flex-col items-center justify-center gap-4 text-center"
            aria-live="polite"
          >
            <Spinner className="size-8" />
            <p className="font-semibold">Opening secure checkout…</p>
            <p className="text-sm text-muted-foreground">Don&rsquo;t close this tab.</p>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {step === "select" ? (
        <p className="text-center text-sm text-muted-foreground">
          Not able to gift today?{" "}
          <Link href="/gift?mode=message" className="font-semibold underline-offset-4 hover:underline">
            Leave a free birthday message
          </Link>
        </p>
      ) : null}
    </main>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}
