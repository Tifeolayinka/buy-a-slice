import "server-only";

import { and, countDistinct, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { events, gifts, messages, visitors } from "@/lib/db/schema";
import type { CategoryId } from "@/lib/gift-config";

// Every function here returns only public-safe fields. Anonymous visitors'
// real names, IP hashes, and user agents never leave this module.

export async function getLiveEvent() {
  const eventSlug = process.env.EVENT_SLUG;
  if (!eventSlug) return null;

  const [event] = await getDb()
    .select()
    .from(events)
    .where(eq(events.slug, eventSlug))
    .limit(1);

  return event ?? null;
}

export type WallStats = {
  totalGifts: number;
  totalMessages: number;
  countries: number;
  supportersToday: number;
};

export async function getWallStats(eventId: string): Promise<WallStats> {
  const [giftRow] = await getDb()
    .select({ count: countDistinct(gifts.id) })
    .from(gifts)
    .where(and(eq(gifts.eventId, eventId), eq(gifts.status, "success")));

  const [messageRow] = await getDb()
    .select({ count: countDistinct(messages.id) })
    .from(messages)
    .where(and(eq(messages.eventId, eventId), eq(messages.status, "approved")));

  const [countryRow] = await getDb()
    .select({ count: countDistinct(visitors.normalizedCountry) })
    .from(visitors)
    .innerJoin(messages, eq(messages.visitorId, visitors.id))
    .where(
      and(
        eq(visitors.eventId, eventId),
        eq(messages.status, "approved"),
        sql`${visitors.normalizedCountry} is not null`,
      ),
    );

  // "Today" is approximated as the current UTC day; the app runs for one
  // event window so this is close enough without event-timezone bucketing.
  const [supportersRow] = await getDb()
    .select({ count: countDistinct(visitors.id) })
    .from(visitors)
    .innerJoin(messages, eq(messages.visitorId, visitors.id))
    .where(
      and(
        eq(visitors.eventId, eventId),
        eq(messages.status, "approved"),
        sql`${visitors.createdAt} >= date_trunc('day', now())`,
      ),
    );

  return {
    totalGifts: giftRow?.count ?? 0,
    totalMessages: messageRow?.count ?? 0,
    countries: countryRow?.count ?? 0,
    supportersToday: supportersRow?.count ?? 0,
  };
}

export type PublicMessage = {
  id: string;
  displayName: string;
  location: string | null;
  body: string;
  category: string;
  isFeatured: boolean;
  createdAt: Date;
};

function publicName(row: { displayName: string; isAnonymous: boolean }): string {
  return row.isAnonymous ? "Anonymous" : row.displayName;
}

const APPROVED_MESSAGE_FIELDS = {
  id: messages.id,
  body: messages.body,
  category: messages.category,
  isFeatured: messages.isFeatured,
  createdAt: messages.createdAt,
  displayName: visitors.displayName,
  isAnonymous: visitors.isAnonymous,
  location: visitors.normalizedCountry,
} as const;

function toPublicMessage(row: {
  id: string;
  body: string;
  category: string;
  isFeatured: boolean;
  createdAt: Date;
  displayName: string;
  isAnonymous: boolean;
  location: string | null;
}): PublicMessage {
  return {
    id: row.id,
    displayName: publicName(row),
    location: row.isAnonymous ? null : row.location,
    body: row.body,
    category: row.category,
    isFeatured: row.isFeatured,
    createdAt: row.createdAt,
  };
}

export async function getRecentMessages(
  eventId: string,
  limit: number,
): Promise<PublicMessage[]> {
  const rows = await getDb()
    .select(APPROVED_MESSAGE_FIELDS)
    .from(messages)
    .innerJoin(visitors, eq(messages.visitorId, visitors.id))
    .where(and(eq(messages.eventId, eventId), eq(messages.status, "approved")))
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  return rows.map(toPublicMessage);
}

export type WallPage = {
  items: PublicMessage[];
  nextCursor: string | null;
};

const WALL_PAGE_SIZE = 20;

export async function getWallPage(
  eventId: string,
  category: CategoryId | "all",
  cursor: string | null,
): Promise<WallPage> {
  const conditions = [eq(messages.eventId, eventId), eq(messages.status, "approved")];
  if (category !== "all") conditions.push(eq(messages.category, category));
  if (cursor) conditions.push(sql`${messages.createdAt} < ${new Date(cursor)}`);

  const rows = await getDb()
    .select(APPROVED_MESSAGE_FIELDS)
    .from(messages)
    .innerJoin(visitors, eq(messages.visitorId, visitors.id))
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(WALL_PAGE_SIZE + 1);

  const hasMore = rows.length > WALL_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, WALL_PAGE_SIZE) : rows;

  return {
    items: page.map(toPublicMessage),
    nextCursor: hasMore ? page[page.length - 1]!.createdAt.toISOString() : null,
  };
}

export type PaymentStatus = {
  status: "initiated" | "pending" | "success" | "failed" | "abandoned";
  message: PublicMessage | null;
};

export async function getPaymentStatusByReference(
  reference: string,
): Promise<PaymentStatus | null> {
  const [row] = await getDb()
    .select({
      status: gifts.status,
      message: APPROVED_MESSAGE_FIELDS,
    })
    .from(gifts)
    .innerJoin(messages, eq(gifts.messageId, messages.id))
    .innerJoin(visitors, eq(messages.visitorId, visitors.id))
    .where(eq(gifts.paystackReference, reference))
    .limit(1);

  if (!row) return null;

  return {
    status: row.status,
    message: row.status === "success" ? toPublicMessage(row.message) : null,
  };
}

// Privileged read: real names even for anonymous submissions, per the
// PRD's abuse-handling requirement. Only reachable through the
// MODERATION_SECRET-gated /moderate routes — never exposed publicly.
export type ModerationQueueItem = {
  id: string;
  realDisplayName: string;
  isAnonymous: boolean;
  location: string | null;
  body: string;
  category: string;
  status: string;
  isFeatured: boolean;
  createdAt: Date;
};

export async function getPendingMessages(eventId: string): Promise<ModerationQueueItem[]> {
  const rows = await getDb()
    .select({
      id: messages.id,
      realDisplayName: visitors.displayName,
      isAnonymous: visitors.isAnonymous,
      location: visitors.normalizedCountry,
      body: messages.body,
      category: messages.category,
      status: messages.status,
      isFeatured: messages.isFeatured,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(visitors, eq(messages.visitorId, visitors.id))
    .where(and(eq(messages.eventId, eventId), eq(messages.status, "pending")))
    .orderBy(desc(messages.createdAt));

  return rows;
}
