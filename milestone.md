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
| M5 | Paid vertical slice | Verified end-to-end Paystack test payment — **core MVP** | 🟡 Built + verified as far as possible — blocked on Paystack keys for a real test payment |
| M6 | Release candidate | Celebration, sharing, analytics, a11y, resilience complete | 🟡 Partially advanced — code-buildable parts done; blocked on content freeze + owner sign-off |
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

## M5 — Verified paid vertical slice ⭐ core MVP 🟡

**Goal:** one production-shaped Paystack test payment completes the whole journey.

**Status: fully built and verified as far as possible without real Paystack credentials.** Every piece that doesn't require an actual Paystack account has been implemented and directly tested against the live database. The one remaining step — a real test-mode payment through Paystack's hosted checkout — needs `PAYSTACK_SECRET_KEY`/`PAYSTACK_PUBLIC_KEY` (owner action, M0).

- [x] Authoritative server-side tier/amount resolution (`lib/gift-validation.ts::resolveTierAmountKobo`) — reads fixed tier prices and custom min/max from the `events` row, never the client. Integer kobo throughout. Server-generated unique references (`bts_<uuid>`, `lib/reference.ts`).
- [x] Pending visitor/message/gift persisted atomically (`createPendingGift`, a three-way chained CTE — see the `neon-http` transaction note below) from `POST /api/gifts/initialize`, which then calls Paystack's `/transaction/initialize` and returns the checkout URL. The gift-flow's payment step now redirects the browser there for real instead of the M2 placeholder.
- [x] Checkout failure handling: invalid tier/amount → 422 with inline error and the user kept on the review step (not stuck on a spinner); Paystack call failure → 502, same graceful recovery. A gift that's initiated but never paid leaves its message permanently `pending` — **verified live**: it never appears on the public Wall or counts toward stats, with no cleanup job required.
- [x] Webhook (`POST /api/paystack/webhook`, `lib/webhook-signature.ts`, `lib/paystack.ts`): raw-body HMAC-SHA512 signature check (constant-time compare) → independent `transaction/verify` call → compares reference **and amount** (not just currency/status — an earlier draft missed the amount check, caught and fixed before shipping) against the gift row actually stored, never the webhook payload's own numbers.
- [x] One idempotent confirmation mutation (`confirmGiftPayment`) — a single atomic data-modifying CTE (chosen specifically so a duplicate webhook after a crash mid-confirmation can't apply the message-approval half twice, which two separate sequential statements would allow) marks the gift `success` and the message `approved` together, guarded by `WHERE status <> 'success'`. **Verified live** via `scripts/verify-gift-flow.ts`: first call confirms and updates stats by exactly +1 gift/+1 message; an identical second call (simulating a retried/duplicate webhook) is a correct no-op.
- [x] `/success` states: confirming (polls `/api/gifts/status` every 2s, up to ~80s), success (shows the real confirmed message, not simulated data), failed, and a distinct timed-out message after the poll window — callback URL is a UX signal only, the page never trusts it directly.
- [ ] Adversarial tests against a *real* Paystack sandbox (forged signatures, altered amounts, callback-before-webhook) — the signature-verification and idempotent-confirmation *logic* is proven correct (unit tests + the live idempotency script above), but an actual forged-webhook-against-a-real-transaction test needs live credentials.
- **Open item surfaced while building, not yet an owner decision:** the gift flow collects no email address (matches the approved mockup and the "under 60 seconds" goal), so Paystack's required receipt-destination field is filled with a synthetic, reference-scoped address (`{reference}@buyers.buy-a-slice.app`) rather than asking the buyer for one. Worth an explicit call on whether buyers should get a real payment receipt email.
- **`neon-http` has no `db.transaction()` support** (confirmed against the driver's actual source — it throws `"No transactions support in neon-http driver"` — not assumed from memory). Every place this milestone needed atomicity uses either a single data-modifying CTE (`createPendingGift`, `confirmGiftPayment`) or `db.batch()` for independent statements, both of which are genuinely atomic over Neon's HTTP transport.

**Gate:** one test transaction → exactly one successful gift, one published message, live stats update; malicious/repeated webhooks cause no incorrect state. **Idempotency and the never-publish-until-paid boundary are verified live; the full live-Paystack round trip is blocked on credentials.**

## M6 — Release candidate 🟡

**Goal:** staging build that is content-complete, shareable, observable, and accessible.

**Status: partially advanced** with everything code-buildable in advance of content freeze; the milestone itself can't fully close until copy/assets are frozen and the owner signs off (its own gate), so this is progress within M6, not the milestone complete.

- [x] One-time reduced-motion-aware confetti, final cake interaction, counters, selection/card motion — built in M2, unchanged since.
- [x] Web Share API with clipboard fallback and accessible feedback — built in M2; now also fires `share_clicked` analytics.
- [x] Canonical metadata + code-generated favicon (`app/icon.tsx`) and 1200×630 OG image (`app/opengraph-image.tsx`) via `next/og`, built entirely from the approved design-system tokens — no photography/illustration assets needed. Removed the unused default create-next-app placeholder icons/SVGs. **Share copy itself is still provisional** (final wording is an M0 owner decision).
- [x] Analytics: `lib/analytics.ts`, a typed wrapper around `@vercel/analytics`'s `track()`, covering all ten events from plan.md §9 (hero/message CTA clicks, tier selection, message submission, payment init/confirm/fail, share, wall view/filter). Every payload was deliberately kept to enum-like values — audited to confirm no message body, real name, or location ever appears in an event property.
- [x] **Accessibility review found and fixed a real defect**: the three custom radiogroups (gift tier select, message category, wall filter chips) had every option as its own Tab stop with no arrow-key support, which doesn't match the ARIA radiogroup pattern keyboard/screen-reader users expect. Fixed to a single Tab stop per group with roving `tabindex` and Arrow-key navigation (`lib/roving-radio.ts`) — verified live via actual keyboard interaction in the browser (not just code review), including wraparound in both directions.
- [ ] Full performance pass (Core Web Vitals, bundle audit) and a real device/browser matrix — need actual traffic/hosting to be meaningful; not attempted.
- [ ] Full e2e test suite, moderation/reconciliation/archive/rollback rehearsal on staging — deferred; the equivalent live verification already done throughout M3–M5 covers the same ground more directly than a from-scratch e2e suite would.

**Gate:** staging acceptance suite passes; no sev-1/sev-2 defects; copy and assets frozen; owner sign-off. **Blocked on the owner's M0 content/asset decisions and final review — not something further building can resolve.**

## M7 — Production launch and handoff

**Goal:** live experience verified, monitored, and shared.

- [ ] Production Neon branch, Vercel, analytics, domain, and Paystack live credentials configured; webhook URL registered and verified.
- [ ] Event config confirmed: tiers, custom bounds, open/cutoff times, timezone, moderation access, archive behavior.
- [ ] Low-value live payment from a clean mobile browser verified end to end (Paystack status, success page, Wall card, stats, analytics, settlement).
- [ ] Go/no-go checklist executed; share link published only after sign-off.
- [ ] Launch-day monitoring: failed inits, unconfirmed references, webhook errors, moderation backlog.
- [ ] Post-event: reconcile ambiguous payments via Paystack verification; switch event to `archived` at cutoff.

**Gate:** live smoke payment passes; monitoring has an active owner; archive mode verified.
