import { submitFreeMessage } from "@/lib/db/mutations";
import { getLiveEvent } from "@/lib/db/queries";
import { fingerprintFromRequest } from "@/lib/fingerprint";
import { messageSubmissionSchema } from "@/lib/message-validation";

export async function POST(request: Request) {
  const event = await getLiveEvent();
  if (!event) {
    return Response.json({ error: "No live event configured" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = messageSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid_input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const fingerprint = fingerprintFromRequest(request);
  const result = await submitFreeMessage(event.id, fingerprint, parsed.data);

  if (!result.ok) {
    const status = result.reason === "rate_limited" ? 429 : 422;
    return Response.json({ error: result.reason }, { status });
  }

  return Response.json({ messageId: result.messageId }, { status: 201 });
}
