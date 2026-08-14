import { getLiveEvent, getWallPage } from "@/lib/db/queries";
import { CATEGORIES } from "@/lib/gift-config";

const CATEGORY_VALUES: ReadonlySet<string> = new Set(CATEGORIES.map((entry) => entry.id));

export async function GET(request: Request) {
  const event = await getLiveEvent();
  if (!event) {
    return Response.json({ error: "No live event configured" }, { status: 404 });
  }

  const params = new URL(request.url).searchParams;
  const categoryParam = params.get("category") ?? "all";
  const category =
    categoryParam === "all" || CATEGORY_VALUES.has(categoryParam)
      ? (categoryParam as "all" | (typeof CATEGORIES)[number]["id"])
      : "all";
  const cursor = params.get("cursor");

  const page = await getWallPage(event.id, category, cursor);
  return Response.json(page);
}
