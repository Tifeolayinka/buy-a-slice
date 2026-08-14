import { getLiveEvent, getRecentMessages } from "@/lib/db/queries";

export async function GET(request: Request) {
  const event = await getLiveEvent();
  if (!event) {
    return Response.json({ error: "No live event configured" }, { status: 404 });
  }

  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam) || 3, 1), 10);

  const messages = await getRecentMessages(event.id, limit);
  return Response.json({ messages });
}
