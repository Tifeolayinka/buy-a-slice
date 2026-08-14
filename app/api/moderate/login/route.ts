import { cookies } from "next/headers";

import { MODERATION_COOKIE_NAME, verifyModerationSecret } from "@/lib/moderation-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const secret = typeof body?.secret === "string" ? body.secret : "";

  if (!verifyModerationSecret(secret)) {
    return Response.json({ error: "invalid_secret" }, { status: 401 });
  }

  const store = await cookies();
  store.set(MODERATION_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return Response.json({ ok: true });
}
