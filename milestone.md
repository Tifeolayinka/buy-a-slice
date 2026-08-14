# Buy Tife a Slice — Execution Milestones

Source documents: `PRD.md` (product definition) and `plan.md` (technical plan, §10). This file is the working tracker: milestones run in sequence, each ends in a reviewable increment, and each gate must pass before the next payment- or launch-critical milestone starts. Calendar dates get assigned by working backward from the confirmed birthday date (still TBD).

## Status at a glance

| # | Milestone | Increment delivered | Status |
| --- | --- | --- | --- |
| M0 | Product lock | Agreed v1 scope, decisions, and launch inputs | 🟡 In progress |
| M1 | Foundation | Deployable branded app shell (Next.js + Neon + CI + preview) | 🟡 Nearly done — needs Neon terms acceptance + GitHub remote |
| M2 | Clickable experience | Full visitor journey on fixture data | 🟡 Built — awaiting owner visual review |
| M3 | Live Wall | Neon-backed messages and stats with near-real-time polling | ⚪ Not started |
| M4 | Safe submissions | Free-message path + moderation queue | ⚪ Not started |
| M5 | Paid vertical slice | Verified end-to-end Paystack test payment — **core MVP** | ⚪ Not started |
| M6 | Release candidate | Celebration, sharing, analytics, a11y, resilience complete | ⚪ Not started |
| M7 | Production launch | Live smoke payment, runbook active, archive verified | ⚪ Not started |

If the launch window tightens, everything through **M5 is protected scope**. Animation polish, auto-featuring, and stretch items in M6 are cut before payment correctness, moderation, privacy, or accessibility.

---

## M0 — Product lock 🟡

**Goal:** remove ambiguity before implementation. Answers the PRD §9 open questions.

- [x] Decision log with provisional defaults created (`docs/m0-product-lock.md`).
- [x] Visual reference translated into design tokens, typography, primitives, and specimen (`docs/design-system.md`).
- [ ] Confirm birthday date, timezone, opening time, payment cutoff, and post-event archive behavior.
- [ ] Confirm free-message policy, moderation flow, category selection, featured-message rule, and custom-amount bounds (min ₦500 / max ₦1,000,000 proposed).
- [ ] Approve final copy, tier labels, palette, fonts, cake direction, portrait, social handles, and canonical domain.
- [ ] Assign moderation owner; confirm access to Paystack, Neon, Vercel, domain, and analytics.

**Gate:** no unresolved launch blocker in the decision table; every required asset has an owner.

## M1 — Foundation 🟡

**Goal:** deployable technical skeleton with environments separated.

- [x] Install shadcn/ui, Motion, Lucide, zod, obscenity, @vercel/analytics, and vitest tooling.
- [x] `.env.example` (names only) + `docs/environments.md` covering dev/preview/production separation.
- [x] **Backend switched from Convex to Neon Postgres + Drizzle** (owner decision, 2026-08-14): `@neondatabase/serverless` + `drizzle-orm` installed, lazy `getDb()` in `lib/db/index.ts`, placeholder schema in `lib/db/schema.ts`, `drizzle.config.ts`. Convex fully removed.
- [ ] Finish Neon Marketplace provisioning — **owner action:** accept Neon terms in the browser (link in chat), then rerun `vercel integration add neon --no-claim` and `vercel env pull .env.local --yes`.
- [ ] Add Paystack test keys once available (M0 input).
- [x] Route skeletons `/`, `/gift`, `/success`, `/wall`, `/moderate` (+ `/design` specimen) with per-route metadata, shared nav, loading/error/not-found boundaries. Home/gift/wall use on-brand fixture content from the approved mockups.
- [x] `lint`, `typecheck`, `test`, `build` scripts — all green locally; first unit tests (naira↔kobo money helpers) passing.
- [x] GitHub Actions CI workflow (`.github/workflows/ci.yml`) — runs once the repo has a GitHub remote (**owner action:** create repo + push).
- [x] Vercel project linked (`buy-a-slice`) and first deployment live (note: first CLI deploy landed in the Production environment; harmless for a skeleton, future deploys via `vercel deploy` are previews).

**Gate:** new contributor can start the app from docs; all routes render in preview; database reachable; CI green.
**Remaining for gate:** Neon terms acceptance + `vercel env pull`, and pushing to GitHub so CI runs.

## M2 — Clickable branded experience 🟡

**Goal:** the complete visitor journey on fixture data, ready for visual review.

- [x] Home: hero, interactive cake (tap → sprinkle burst), animated stat counters, recent messages, both CTAs.
- [x] Reusable primitives: buttons, fields, tier cards, message cards, category chips, skeletons, empty states.
- [x] `/gift`: selection (incl. custom amount with ₦500–₦1,000,000 validation) → message (280-char counter, anonymous toggle, category) → review → simulated payment-loading; `?mode=message` skips payment (`components/gift-flow/gift-flow.tsx`).
- [x] `/success`: confirming / success / failed / pending states, one-shot canvas confetti, Web Share with clipboard fallback. Test via `/success?state=failed` etc.
- [x] `/wall`: interactive category filters with animated reordering, featured coral card, empty state.
- [x] Keyboard access, visible focus rings, radiogroup semantics, aria-live status regions, ≥44 px targets, `prefers-reduced-motion` honored throughout.
- [x] Polish pass (impeccable skill, launch-ready bar): fixed a systemic a11y defect where link-as-button composition (`Button render={<Link/>}`) violated Base UI's own semantics guidance across 7 sites — replaced with a `ButtonLink` primitive; restored the mockup's default tier selection (was missing, blocking Continue unnecessarily); fixed the anonymous toggle destroying the entered name and hiding the field the PRD requires for internal abuse handling; fixed the success screen showing hardcoded fixture data instead of the actual submitted name/message (misleading state); removed native number-input spin buttons bleeding through the custom input styling; excluded `.agents/` skill files from ESLint.
- [ ] **Owner review** at 390 px mobile and desktop widths on the preview deployment.

**Gate:** both paid and message-only journeys clickable in preview at 390 px and desktop; visual direction approved.

## M3 — Live Birthday Wall

**Goal:** fixture data replaced by a correct, privacy-safe Postgres read path.

- [ ] Drizzle schema + indexes: events, visitors, messages, gifts, moderation_audit; `drizzle-kit push`/migrations.
- [ ] Seed current event and dev-only sample messages.
- [ ] Server queries return only approved messages; anonymous names never exposed.
- [ ] Paginated Wall by category, recent messages, live stats, reference-scoped payment status (route handlers / server components).
- [ ] Home + Wall wired to SWR polling (short interval) with loading/empty/error/retry states — near-real-time without websockets.
- [ ] Tests for filtering, aggregation, pagination, privacy boundaries.

**Gate:** approving a test message shows up in a second browser session within the polling interval without a manual refresh; private fields absent from public responses.

## M4 — Safe message submission and moderation

**Goal:** message-only path that cannot publish unreviewed content.

- [ ] Shared client/server validation, normalization, anonymity, category, 280-char limit.
- [ ] Server-side profanity/abuse checks, link rules, rate limiting.
- [ ] Free messages stored `pending`; accurate awaiting-approval confirmation shown.
- [ ] Protected `/moderate` queue: approve / reject / feature / unfeature, with audit records.
- [ ] Analytics never receive message bodies or hidden names.
- [ ] Abuse-path tests: rejected, flagged, duplicate, malformed, rate-limited.

**Gate:** submit → moderate → publish works live; unapproved messages never appear; unauthorized moderation calls fail.

## M5 — Verified paid vertical slice ⭐ core MVP

**Goal:** one production-shaped Paystack test payment completes the whole journey.

- [ ] Authoritative server-side tier/amount resolution, integer kobo, unique server-generated references.
- [ ] Pending visitor/message/gift persisted; Paystack initialized from a server-side route handler.
- [ ] Checkout handles cancel, init error, retry, back, refresh.
- [ ] Webhook HTTP action: raw-body HMAC verification + independent `transaction/verify` check (reference, amount, currency, recipient).
- [ ] One idempotent confirmation mutation marks the gift paid and publishes the unflagged message.
- [ ] `/success` states: confirming, confirmed, failed, timed-out; callback treated as UX signal only.
- [ ] Adversarial tests: duplicate/delayed webhooks, forged signatures, altered amounts, callback-before-webhook.

**Gate:** one test transaction → exactly one successful gift, one published message, live stats update; malicious/repeated webhooks cause no incorrect state.

## M6 — Release candidate

**Goal:** staging build that is content-complete, shareable, observable, and accessible.

- [ ] One-time reduced-motion-aware confetti, final cake interaction, counters, selection/card motion.
- [ ] Web Share API with clipboard fallback and accessible feedback.
- [ ] Canonical metadata, favicon, 1200×630 OG artwork, share copy finalized.
- [ ] Analytics events and safe operational logging (plan.md §9).
- [ ] Performance pass: fonts, images, client-component boundaries, route-scoped animation loading.
- [ ] Full test suites (unit, integration, e2e); device/browser matrix; a11y, zoom, slow-network, Core Web Vitals checks.
- [ ] Rehearse moderation, reconciliation, archive, rollback, and incident procedures on staging.

**Gate:** staging acceptance suite passes; no sev-1/sev-2 defects; copy and assets frozen; owner sign-off.

## M7 — Production launch and handoff

**Goal:** live experience verified, monitored, and shared.

- [ ] Production Neon branch, Vercel, analytics, domain, and Paystack live credentials configured; webhook URL registered and verified.
- [ ] Event config confirmed: tiers, custom bounds, open/cutoff times, timezone, moderation access, archive behavior.
- [ ] Low-value live payment from a clean mobile browser verified end to end (Paystack status, success page, Wall card, stats, analytics, settlement).
- [ ] Go/no-go checklist executed; share link published only after sign-off.
- [ ] Launch-day monitoring: failed inits, unconfirmed references, webhook errors, moderation backlog.
- [ ] Post-event: reconcile ambiguous payments via Paystack verification; switch event to `archived` at cutoff.

**Gate:** live smoke payment passes; monitoring has an active owner; archive mode verified.
