import { z } from "zod";

import { applyModerationAction } from "@/lib/db/mutations";
import { hasModerationSession } from "@/lib/moderation-auth";

const actionSchema = z.object({
  messageId: z.string().uuid(),
  action: z.enum(["approve", "reject", "feature", "unfeature"]),
  reason: z.string().trim().max(280).optional(),
});

export async function POST(request: Request) {
  if (!(await hasModerationSession())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  await applyModerationAction(
    parsed.data.messageId,
    parsed.data.action,
    "moderator",
    parsed.data.reason,
  );

  return Response.json({ ok: true });
}
