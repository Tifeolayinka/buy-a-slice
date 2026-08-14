import { ArrowRight, Check, Heart, Sparkles } from "lucide-react";

import {
  BrandMark,
  CategoryChip,
  GiftTierCard,
  MessageCard,
  StatCard,
} from "@/components/birthday/system";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const colors = [
  { name: "Ivory", token: "background", value: "#FFF8EE", className: "bg-background" },
  { name: "Espresso", token: "primary", value: "#2A1108", className: "bg-primary" },
  { name: "Apricot", token: "border", value: "#E7C7A7", className: "bg-border" },
  { name: "Coral", token: "celebration", value: "#F0646D", className: "bg-celebration" },
  { name: "Butter", token: "gold", value: "#EFB84A", className: "bg-gold" },
  { name: "Mint", token: "mint", value: "#67BA8B", className: "bg-mint" },
];

export const metadata = {
  title: "Design System",
  robots: { index: false },
};

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-5 py-8 sm:px-8 lg:px-12 lg:py-14">
      <header className="flex flex-col gap-10 rounded-3xl border border-border/70 bg-card/72 p-6 shadow-float backdrop-blur-sm sm:p-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-3xl flex-col gap-7">
          <BrandMark />
          <div className="flex flex-col gap-4">
            <Badge variant="outline">Foundation · M0</Badge>
            <h1 className="text-balance font-heading text-5xl leading-[0.92] font-semibold tracking-[-0.045em] sm:text-7xl">
              Warm, editorial,
              <br />and worth sharing.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              A playful birthday system built from ivory, espresso, soft apricot,
              and celebratory coral—with expressive serif headlines and calm,
              frictionless controls.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="lg">
            Buy me a slice
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button size="lg" variant="outline">
            Leave a message
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-8" aria-labelledby="foundation-title">
        <SectionIntro
          eyebrow="01 · Foundation"
          title="A small palette with a lot of warmth"
          description="Ivory leads, espresso grounds the interface, and coral appears only when the moment deserves celebration. Supporting confetti colors stay decorative."
          id="foundation-title"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((color) => (
            <Card key={color.token} size="sm">
              <CardContent className="flex items-center gap-4">
                <span
                  className={`size-14 shrink-0 rounded-xl border border-foreground/10 ${color.className}`}
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-col">
                  <strong>{color.name}</strong>
                  <span className="font-mono text-xs text-muted-foreground">
                    --{color.token} · {color.value}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="type-title">
        <SectionIntro
          eyebrow="02 · Typography"
          title="Personality up top. Clarity everywhere else."
          description="Fraunces carries the human, celebratory voice. DM Sans handles every action, form, amount, and message."
          id="type-title"
        />
        <Card>
          <CardContent className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Display · Fraunces 600
              </span>
              <p className="text-balance font-heading text-5xl leading-[0.95] font-semibold tracking-[-0.04em] sm:text-6xl">
                It’s Tife’s Birthday 🎉
              </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Interface · DM Sans
              </span>
              <p className="text-xl leading-relaxed">
                I survived another year. That deserves cake.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Body copy stays compact, direct, and easy to scan on a 390px screen.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-8" aria-labelledby="controls-title">
        <SectionIntro
          eyebrow="03 · Controls"
          title="Soft edges, decisive actions"
          description="Primary actions are espresso pills. Secondary actions keep the ivory surface and apricot border. Every target is at least 44px tall."
          id="controls-title"
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Actions & filters</CardTitle>
              <CardDescription>Use one dominant action per step.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-3">
                <Button>
                  Continue
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button variant="outline">Secondary action</Button>
                <Button variant="ghost">Quiet action</Button>
                <Button disabled>Unavailable</Button>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <CategoryChip active>All</CategoryChip>
                <CategoryChip>Wishes</CategoryChip>
                <CategoryChip>Advice</CategoryChip>
                <CategoryChip>Prayers</CategoryChip>
                <CategoryChip>Roasts</CategoryChip>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message form</CardTitle>
              <CardDescription>Warm, familiar, and deliberately uncomplicated.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="specimen-name">Your name</FieldLabel>
                  <Input id="specimen-name" defaultValue="Tosin" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="specimen-message">Your message</FieldLabel>
                  <Textarea
                    id="specimen-message"
                    defaultValue="Happy birthday Tife! Cheers to more wins, growth, peace and all the things your heart desires. ✨"
                  />
                  <FieldDescription>92/280 characters</FieldDescription>
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="specimen-anonymous">Post anonymously</FieldLabel>
                  <Switch id="specimen-anonymous" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-8" aria-labelledby="patterns-title">
        <SectionIntro
          eyebrow="04 · Product patterns"
          title="Cards that feel collected, not templated"
          description="Gift tiers are generous selection surfaces. Wall entries are quieter, while featured messages earn the only saturated treatment."
          id="patterns-title"
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <GiftTierCard
              emoji="🍰"
              name="One Slice"
              amount="₦1,000"
              description="Just enough to say happy birthday."
              selected
            />
            <GiftTierCard
              emoji="🥂"
              name="Birthday Energy"
              amount="₦5,000"
              description="Now we’re celebrating properly."
            />
          </div>
          <div className="grid grid-cols-3 gap-3 self-start">
            <StatCard emoji="🍰" value="31" label="Slices bought" />
            <StatCard emoji="💌" value="47" label="Messages" />
            <StatCard emoji="🌍" value="6" label="Countries" />
          </div>
          <MessageCard
            initials="KM"
            name="Kemi"
            location="Lagos, NG"
            message="Happy birthday Tife! May this new year be your best one yet. Big things loading for you! 🚀"
            time="2h ago"
            likes={12}
          />
          <MessageCard
            initials="TT"
            name="Tomi"
            location="Toronto, CA"
            message="Your ideas inspire. Your energy is unmatched. Your future is huge. Keep going, Tife. The best is yet to come."
            time="Featured"
            featured
          />
        </div>
      </section>

      <footer className="flex flex-col gap-6 rounded-3xl bg-primary p-7 text-primary-foreground sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-xl flex-col gap-3">
          <Sparkles aria-hidden="true" />
          <h2 className="font-heading text-4xl leading-none font-semibold tracking-[-0.035em]">
            Celebrate. Share. Make his day.
          </h2>
          <p className="text-primary-foreground/70">
            The system is expressive in the moment and restrained everywhere else.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check aria-hidden="true" />
          Foundation ready
          <Heart className="text-celebration" aria-hidden="true" />
        </div>
      </footer>
    </main>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow: string;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <span className="text-xs font-semibold tracking-[0.16em] text-celebration-strong uppercase">
        {eyebrow}
      </span>
      <h2
        id={id}
        className="text-balance font-heading text-4xl leading-[1.02] font-semibold tracking-[-0.035em] sm:text-5xl"
      >
        {title}
      </h2>
      <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}
