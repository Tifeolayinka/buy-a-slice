import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 py-10">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-10 w-2/3 rounded-2xl" />
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="h-24 rounded-3xl" />
      <Skeleton className="h-24 rounded-3xl" />
    </main>
  );
}
