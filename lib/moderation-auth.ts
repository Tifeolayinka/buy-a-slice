import "server-only";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const MODERATION_COOKIE_NAME = "moderation_session";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyModerationSecret(candidate: string): boolean {
  const expected = process.env.MODERATION_SECRET;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

export async function hasModerationSession(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(MODERATION_COOKIE_NAME)?.value;
  if (!value) return false;
  return verifyModerationSecret(value);
}
