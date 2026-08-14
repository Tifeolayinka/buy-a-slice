import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// Lazy initialization: `neon()` throws without DATABASE_URL, and Next.js
// evaluates module scope at build time, so the client is created on first use.
// Plain function, not a Proxy — Proxies break libraries that inspect the client.
function createDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}
