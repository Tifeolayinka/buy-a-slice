import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // drizzle-kit does not auto-load .env.local — run via:
    // npx dotenv -e .env.local -- npx drizzle-kit push
    //
    // Schema changes use the direct/unpooled connection, not DATABASE_URL
    // (pooled): PgBouncer's transaction-mode pooling doesn't support the
    // session-level operations DDL can need. lib/db/index.ts uses the
    // pooled DATABASE_URL for normal app queries, which is correct there.
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
