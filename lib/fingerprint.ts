import { createHash } from "node:crypto";

// Privacy-conscious rate-limit key: hash the client IP rather than storing
// it raw (plan.md §7). Not used for identity — only to bound submission
// bursts from the same source.
export function fingerprintFromRequest(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}
