import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-5 py-16 text-center">
      <span className="text-6xl leading-none" aria-hidden="true">
        🍽️
      </span>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em]">
        No cake here
      </h1>
      <p className="text-muted-foreground">
        This page doesn&rsquo;t exist — but the party is still on.
      </p>
      <ButtonLink href="/">Back to the birthday</ButtonLink>
    </main>
  );
}
