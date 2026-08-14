import { getLiveEvent, getWallStats } from "@/lib/db/queries";

export async function GET() {
  const event = await getLiveEvent();
  if (!event) {
    return Response.json({ error: "No live event configured" }, { status: 404 });
  }

  const stats = await getWallStats(event.id);
  return Response.json(stats);
}
