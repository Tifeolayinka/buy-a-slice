import type { Metadata } from "next";

import { GiftFlow } from "@/components/gift-flow/gift-flow";

export const metadata: Metadata = {
  title: "Choose your slice",
  description: "Buy Tife a slice of birthday cake and make his day.",
};

export default async function GiftPage({ searchParams }: PageProps<"/gift">) {
  const { mode } = await searchParams;
  return <GiftFlow mode={mode === "message" ? "message" : "gift"} />;
}
