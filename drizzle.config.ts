import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // drizzle-kit does not auto-load .env.local — run via:
    // npx dotenv -e .env.local -- npx drizzle-kit push
    url: process.env.DATABASE_URL!,
  },
});
