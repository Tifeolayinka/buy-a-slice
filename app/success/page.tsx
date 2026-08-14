import type { Metadata } from "next";

import { SuccessView, type SuccessState } from "@/components/celebration/success-view";

export const metadata: Metadata = {
  title: "You just made Tife's day",
  robots: { index: false },
};

const STATES: SuccessState[] = ["confirming", "success", "failed", "pending"];

export default async function SuccessPage({ searchParams }: PageProps<"/success">) {
  const { state, simulated, reference, name, location, message } = await searchParams;
  const referenceValue = typeof reference === "string" ? reference : undefined;

  // With a real payment reference and no explicit state, the payment has
  // not been verified yet — start in "confirming" and poll. Without a
  // reference (e.g. the design/QA `simulated=1` path), default to "success"
  // so visiting /success alone still shows something sensible.
  const initialState = STATES.includes(state as SuccessState)
    ? (state as SuccessState)
    : referenceValue
      ? "confirming"
      : "success";

  return (
    <SuccessView
      initialState={initialState}
      simulated={simulated === "1"}
      reference={referenceValue}
      submittedName={typeof name === "string" ? name : undefined}
      submittedLocation={typeof location === "string" ? location : undefined}
      submittedMessage={typeof message === "string" ? message : undefined}
    />
  );
}
