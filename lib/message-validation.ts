import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";
import { z } from "zod";

import { CATEGORIES, MESSAGE_MAX_LENGTH } from "@/lib/gift-config";

// Shared between the client form and the server action/route handler so
// both sides reject the same inputs (client validation is UX only).

const categoryValues = CATEGORIES.map((entry) => entry.id) as [string, ...string[]];

const URL_PATTERN = /(https?:\/\/|www\.)\S+/i;

export const messageSubmissionSchema = z
  .object({
    name: z.string().trim().max(80),
    isAnonymous: z.boolean(),
    country: z.string().trim().max(80).optional().or(z.literal("")),
    body: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(MESSAGE_MAX_LENGTH, `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer`),
    category: z.enum(categoryValues),
  })
  .refine((data) => data.isAnonymous || data.name.length > 0, {
    message: "Name is required unless posting anonymously",
    path: ["name"],
  });

export type MessageSubmissionInput = z.infer<typeof messageSubmissionSchema>;

const profanityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export type MessageContentIssue = "profanity" | "link";

// Separate from the shape/length schema above: these are content rules that
// warrant a specific server-facing reason (surfaced to moderators), not a
// per-field zod error.
export function checkMessageContent(body: string): MessageContentIssue | null {
  if (profanityMatcher.hasMatch(body)) return "profanity";
  if (URL_PATTERN.test(body)) return "link";
  return null;
}

export function normalizeCountry(country: string | undefined): string | null {
  const trimmed = country?.trim();
  return trimmed ? trimmed : null;
}
