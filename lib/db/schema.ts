import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Data design per plan.md §6. Money is stored as integer kobo (see lib/money.ts);
// only currency = "NGN" ships in v1.

export const eventStatusEnum = pgEnum("event_status", ["draft", "live", "archived"]);

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 64 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  birthdayAt: timestamp("birthday_at", { withTimezone: true }).notNull(),
  opensAt: timestamp("opens_at", { withTimezone: true }).notNull(),
  closesAt: timestamp("closes_at", { withTimezone: true }).notNull(),
  timezone: varchar("timezone", { length: 64 }).notNull(),
  status: eventStatusEnum("status").notNull().default("draft"),
  tierSliceKobo: integer("tier_slice_kobo").notNull(),
  tierBigSliceKobo: integer("tier_big_slice_kobo").notNull(),
  tierEnergyKobo: integer("tier_energy_kobo").notNull(),
  customMinKobo: integer("custom_min_kobo").notNull(),
  customMaxKobo: integer("custom_max_kobo").notNull(),
  shareCopy: text("share_copy"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("events_slug_idx").on(table.slug),
  index("events_status_idx").on(table.status),
]);

export const visitors = pgTable("visitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  displayName: varchar("display_name", { length: 80 }).notNull(),
  normalizedCountry: varchar("normalized_country", { length: 80 }),
  countryCode: varchar("country_code", { length: 2 }),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  // Private audit fields; never returned by public queries.
  ipHash: varchar("ip_hash", { length: 128 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("visitors_event_idx").on(table.eventId),
]);

export const messageCategoryEnum = pgEnum("message_category", [
  "wish",
  "advice",
  "prayer",
  "roast",
]);

export const messageStatusEnum = pgEnum("message_status", [
  "pending",
  "approved",
  "rejected",
]);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  visitorId: uuid("visitor_id").notNull().references(() => visitors.id),
  giftId: uuid("gift_id"), // set after the gift row exists; FK added via gifts.messageId is the owning side.
  body: varchar("body", { length: 280 }).notNull(),
  category: messageCategoryEnum("category").notNull().default("wish"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: messageStatusEnum("status").notNull().default("pending"),
  moderationReason: text("moderation_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  moderatedAt: timestamp("moderated_at", { withTimezone: true }),
}, (table) => [
  index("messages_event_status_created_idx").on(table.eventId, table.status, table.createdAt),
  index("messages_event_status_category_idx").on(table.eventId, table.status, table.category),
  index("messages_gift_idx").on(table.giftId),
]);

export const giftTierEnum = pgEnum("gift_tier", ["slice", "big_slice", "energy", "custom"]);

export const giftStatusEnum = pgEnum("gift_status", [
  "initiated",
  "pending",
  "success",
  "failed",
  "abandoned",
]);

export const gifts = pgTable("gifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  visitorId: uuid("visitor_id").notNull().references(() => visitors.id),
  messageId: uuid("message_id").notNull().references(() => messages.id),
  amountKobo: integer("amount_kobo").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
  tier: giftTierEnum("tier").notNull(),
  paystackReference: varchar("paystack_reference", { length: 100 }).notNull(),
  paystackTransactionId: varchar("paystack_transaction_id", { length: 100 }),
  status: giftStatusEnum("status").notNull().default("initiated"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("gifts_reference_idx").on(table.paystackReference),
  index("gifts_event_status_idx").on(table.eventId, table.status),
  index("gifts_message_idx").on(table.messageId),
]);

export const moderationActionEnum = pgEnum("moderation_action", [
  "approve",
  "reject",
  "feature",
  "unfeature",
]);

export const moderationAudit = pgTable("moderation_audit", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id").notNull().references(() => messages.id),
  action: moderationActionEnum("action").notNull(),
  reason: text("reason"),
  actorLabel: varchar("actor_label", { length: 80 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("moderation_audit_message_idx").on(table.messageId),
]);

// Used by the rate limiter (M4) to bound submissions per fingerprint/window
// without a separate Redis dependency at this scale.
export const submissionAttempts = pgTable("submission_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  fingerprint: varchar("fingerprint", { length: 128 }).notNull(),
  kind: varchar("kind", { length: 20 }).notNull(), // "message" | "gift"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("submission_attempts_fingerprint_created_idx").on(table.fingerprint, table.createdAt),
]);
