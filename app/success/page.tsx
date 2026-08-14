import type { Metadata } from "next";

import { SuccessView, type SuccessState } from "@/components/celebration/success-view";

export const metadata: Metadata = {
  title: "You just made Tife's day",
  robots: { index: false },
};

const STATES: SuccessState[] = ["confirming", "success", "failed", "pending"];

export default async function SuccessPage({ searchParams }: PageProps<"/success">) {
  const { state, simulated, name, location, message } = await searchParams;
  const initialState = STATES.includes(state as SuccessState)
    ? (state as SuccessState)
    : "success";

  return (
    <SuccessView
      initialState={initialState}
      simulated={simulated === "1"}
      submittedName={typeof name === "string" ? name : undefined}
      submittedLocation={typeof location === "string" ? location : undefined}
      submittedMessage={typeof message === "string" ? message : undefined}
    />
  );
}
