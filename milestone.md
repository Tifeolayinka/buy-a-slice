# Buy Tife a Slice — Execution Milestones

Source documents: `PRD.md` (product definition) and `plan.md` (technical plan, §10). This file is the working tracker: milestones run in sequence, each ends in a reviewable increment, and each gate must pass before the next payment- or launch-critical milestone starts. Calendar dates get assigned by working backward from the confirmed birthday date (still TBD).

## Status at a glance

| # | Milestone | Increment delivered | Status |
| --- | --- | --- | --- |
| M0 | Product lock | Agreed v1 scope, decisions, and launch inputs | 🟡 In progress |
| M1 | Foundation | Deployable branded app shell (Next.js + Neon + CI + preview) | ✅ Done |
| M2 | Clickable experience | Full visitor journey on fixture data | 🟡 Built — awaiting owner visual review |
| M3 | Live Wall | Neon-backed messages and stats with near-real-time polling | ✅ Done |
| M4 | Safe submissions | Free-message path + moderation queue | ✅ Done |
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

## M1 — Foundation ✅

**Goal:** deployable technical skeleton with environments separated.

- [x] Install shadcn/ui, Motion, Lucide, zod, obscenity, @vercel/analytics, and vitest tooling.
- [x] `.env.example` (names only) + `docs/environments.md` covering dev/preview/production separation, including the pooled-vs-unpooled Neon connection-string split.
- [x] **Backend switched from Convex to Neon Postgres + Drizzle** (owner decision, 2026-08-14): `@neondatabase/serverless` + `drizzle-orm` installed, lazy `getDb()` in `lib/db/index.ts`. Convex fully removed.
- [x] Neon provisioned via Vercel Marketplace (owner accepted terms 2026-08-14), connected to the project, schema pushed.
- [ ] Add Paystack test keys once available (M0 input; blocks M5, not M1).
- [x] Route skeletons `/`, `/gift`, `/success`, `/wall`, `/moderate` (+ `/design` specimen) with per-route metadata, shared nav, loading/error/not-found boundaries.
- [x] `lint`, `typecheck`, `test`, `build` scripts — all green locally and in CI.
- [x] GitHub Actions CI workflow (`.github/workflows/ci.yml`) — repo pushed to `github.com/Tifeolayinka/buy-a-slice`, CI green.
- [x] Vercel project linked (`buy-a-slice`); preview deployments working correctly.

**Gate:** new contributor can start the app from docs; all routes render in preview; database reachable; CI green. **All met.**

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

## M3 — Live Birthday Wall ✅

**Goal:** fixture data replaced by a correct, privacy-safe Postgres read path.

- [x] Drizzle schema + indexes: `events`, `visitors`, `messages`, `gifts`, `moderation_audit`, `submission_attempts` (`lib/db/schema.ts`). Pushed to Neon via `drizzle-kit push` against the **unpooled** connection string (pooled connections run PgBouncer transaction mode, which doesn't support the session-level operations DDL needs — documented in `docs/environments.md`).
- [x] Event seeded (`tife-2026`) with provisional dates/tiers — placeholder pending the real M0 birthday-date decision.
- [x] Server queries (`lib/db/queries.ts`) return only approved messages; `toPublicMessage()` masks anonymous visitors' real names and location everywhere public. Verified live: a pending message is invisible to `/api/wall`, `/api/wall/recent`, and stats until approved.
- [x] Paginated Wall by category (cursor-based, `getWallPage`), recent messages (`getRecentMessages`), live stats incl. "supporters today" (`getWallStats`), reference-scoped payment status (`getPaymentStatusByReference`, ready for M5) — exposed via `app/api/wall/*` route handlers.
- [x] Home (`LiveStats`, `RecentLove`) and Wall (`WallView`) wired to SWR polling (15s interval) with loading skeletons, empty states, and error fallbacks. Fixture arrays fully removed.
- [x] `neon-http` driver has no interactive-transaction support (confirmed against the actual driver source, not assumed) — the visitor+message insert uses a single atomic data-modifying CTE instead of `db.transaction()`; moderation's two independent writes use `db.batch()`, which is genuinely atomic over Neon's HTTP transport.
- [~] Automated tests for filtering/pagination/privacy: pure-function tests only (`lib/*.test.ts`, 27 passing). DB-dependent behaviors (privacy boundary, category filtering, live approve→publish) were verified live against the real Neon database via curl and a full browser session — see evidence in-session — rather than an automated integration suite, since CI has no test-database secret configured and this app has no Neon branch isolation yet. **Deferred:** wire a CI-scoped Neon branch + integration test config (`resolve.conditions: ["react-server"]` needed for `server-only` to resolve outside Next's bundler).

**Gate:** approving a test message shows up in a second browser session within the polling interval without a manual refresh; private fields absent from public responses. **Verified live**, both via direct API calls and the real `/moderate` → `/wall` UI flow.

## M4 — Safe message submission and moderation ✅

**Goal:** message-only path that cannot publish unreviewed content.

- [x] Shared client/server validation (`lib/message-validation.ts`, zod): name required unless anonymous, 280-char body, known category. Used by both the gift-flow form and the `/api/messages` route.
- [x] Server-side profanity check (`obscenity`) and link rule (regex), enforced in `submitFreeMessage` before any write.
- [x] Free messages stored `pending` via `POST /api/messages`; the gift-flow's message-only path now actually calls this (fixed a gap where the client only simulated success without ever posting — see below), with a real spinner and specific error copy for rate-limit/profanity/link rejections.
- [x] Rate limiting: `submission_attempts` table, 5 submissions per fingerprint (SHA-256 of IP, never stored raw) per 10-minute window.
- [x] Protected `/moderate`: httpOnly-cookie session gated by `MODERATION_SECRET` (timing-safe comparison), login form with wrong-secret error state, queue UI showing real names/locations (moderator-only privileged read, distinct from public queries), Approve/Reject wired to `POST /api/moderate/actions`. Every action writes a `moderation_audit` row. Feature/unfeature mutation exists (`applyModerationAction`) but has no queue UI button yet — deferred to M6 polish since there's no featured-message curation UI need pre-launch.
- [x] Analytics: none wired yet (M6), so no risk of message bodies/names leaking there yet.
- [x] Authz verified live: unauthenticated `GET /api/moderate/queue` and `POST /api/moderate/actions` both return 401; the `/moderate` page shows a login form (not the queue) without a valid session cookie; a wrong secret shows an inline error and does not set a cookie.

**Gate:** submit → moderate → publish works live; unapproved messages never appear; unauthorized moderation calls fail. **Verified live end-to-end**, including through the real browser UI (submitted an anonymous message via `/gift?mode=message` → confirmed absent from `/wall` and `/api/wall/stats` → approved via the `/moderate` UI → confirmed it appeared on `/wall` with correct stats).

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
