import { getLiveEvent, getPendingMessages } from "@/lib/db/queries";
import { hasModerationSession } from "@/lib/moderation-auth";

export async function GET() {
  if (!(await hasModerationSession())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const event = await getLiveEvent();
  if (!event) {
    return Response.json({ error: "No live event configured" }, { status: 404 });
  }

  const items = await getPendingMessages(event.id);
  return Response.json({ items });
}
