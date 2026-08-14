# Buy Tife a Slice — Execution Plan

> **Stack change (2026-08-14, owner decision):** the backend is **Neon Postgres
> (Vercel Marketplace) + Drizzle ORM**, not Convex as originally recommended in
> PRD §7. Where this plan says "Convex query/mutation/action", read "server
> component / server action / route handler backed by Drizzle"; the Paystack
> webhook is a Next.js route handler (`app/api/paystack/webhook/route.ts`);
> "reactive queries" become short-interval SWR polling. Data design (§6),
> payment rules (§7), and milestones are otherwise unchanged. `milestone.md`
> and `docs/environments.md` reflect the current stack.

## 1. Outcome

Ship a polished, mobile-first birthday microsite where a visitor can buy a virtual slice through Paystack, leave a public message, celebrate, share the moment, and see the Birthday Wall and its statistics update in near real time.

The first launch target is Tife's birthday (date still to be supplied). The implementation will optimize for a reliable one-day event while keeping event-specific content and dates configurable enough to reuse the app next year.

## 2. Current repository baseline

- Next.js 16.3 App Router, React 19.2, TypeScript, and Tailwind CSS 4 are installed.
- The repository is still the default `create-next-app` starter.
- Convex, shadcn/ui, Motion, icons, validation, abuse filtering, analytics, and test tooling are not installed yet.
- Next.js pages and layouts will remain Server Components by default. Client Components will be limited to interactive islands such as the gift flow, real-time queries, animation, confetti, and sharing.

## 3. Decisions required before production

These do not need to block initial UI and backend scaffolding. The recommended defaults can be used until Tife confirms otherwise.

| Question | Recommended v1 decision | Reason |
| --- | --- | --- |
| Free messages | Allow them, but hold them for moderation | Preserves the secondary CTA without putting anonymous public content straight onto the Wall |
| Paid-message moderation | Auto-publish after verified payment unless the message is flagged | Keeps payment-to-celebration friction low while retaining an abuse safety valve |
| Category | User selects Wish, Advice, Prayer, or Roast; default to Wish | Predictable filtering without an inference service |
| Featured messages | Auto-feature eligible high-tier gifts, with a lightweight manual override | Creates visual variation on launch day without requiring continuous curation |
| Post-birthday lifecycle | Keep a public read-only archive after a configured cutoff | Preserves links and social posts while stopping new transactions |
| Custom amount | Minimum ₦500, maximum ₦1,000,000 | Prevents invalid/tiny payments and accidental extreme values; confirm before launch |
| Message likes | Exclude from v1 | Anonymous likes add abuse/rate-limit work without helping the core conversion flow |

Additional launch inputs needed:

- Birthday date, timezone, opening time, and payment cutoff time.
- Final portrait/avatar, cake illustration direction, favicon, and social share artwork.
- Final display name, social handles, canonical domain, and share copy.
- Paystack test and live credentials plus webhook configuration access.
- Confirmed moderation owner and a secret used to protect the moderation route.
- Seed messages, if the Wall should not launch empty.

## 4. Proposed v1 experience

### Public routes

| Route | Purpose |
| --- | --- |
| `/` | Hero, interactive cake, live stats, recent messages, and primary/secondary CTAs |
| `/gift` | A resilient multi-step flow: gift selection → message → review/payment |
| `/success?reference=…` | Wait for server confirmation, show celebration, submitted message, and share actions |
| `/wall` | Real-time public Birthday Wall with category filters |
| `/moderate` | Minimal protected moderation queue and featured-message controls |

The gift experience will appear as a bottom-sheet-style surface on small screens and a centered panel on desktop. It will use a real route rather than client-only modal state so refresh, browser back, Paystack return, and direct linking remain reliable.

### Main paid flow

1. Visitor selects a tier or enters a valid custom NGN amount.
2. Visitor supplies name/anonymous preference, optional country, category, and a message of at most 280 characters.
3. Client validates for immediate feedback; the server validates the same data again.
4. Convex creates a pending visitor, message, and gift with a unique payment reference.
5. A Convex action initializes the transaction with Paystack using the authoritative amount and metadata.
6. The browser opens Paystack Checkout using the returned authorization data.
7. Paystack redirects to the success route, which shows a verifying state rather than declaring success immediately.
8. The Paystack webhook signature is verified and the transaction is independently verified with Paystack.
9. One idempotent mutation marks the gift successful, records `paidAt`, and approves the unflagged message.
10. The success route reacts to the confirmed status, plays celebration once, and enables sharing.

### Free-message flow

1. The secondary CTA opens `/gift?mode=message` and skips gift selection/payment.
2. The visitor submits the same message form.
3. The server validates, filters, and rate-limits the submission.
4. The message is stored with no gift and a `pending` moderation status.
5. The visitor receives a clear “message received and awaiting approval” confirmation.
6. An approved message becomes visible through the same Wall query and stats pipeline.

## 5. Technical architecture

### Frontend

- Use Next.js App Router route files for page boundaries, metadata, loading, error, and not-found states.
- Keep static/editorial shells server-rendered and make only interactive areas Client Components.
- Use Tailwind CSS 4 theme variables for colors, spacing, radii, shadows, and typography.
- Add shadcn/ui primitives selectively: Dialog/Drawer, Button, Input, Textarea, Select, Switch, Badge, Card, and Toast/Sonner.
- Add Motion for sheet transitions, selection states, counters, cake reactions, and card entrance/lift.
- Use a lightweight confetti package or a small canvas implementation loaded only on the success route.
- Use Lucide for interface icons; keep the cake itself a custom illustrated asset or code-native SVG.
- Respect `prefers-reduced-motion`; all important state must remain understandable without animation.

### Convex backend

- Use reactive public queries for recent messages, filtered Wall pages, stats, and payment status.
- Use internal mutations for state transitions that must not be callable directly by the browser.
- Use actions for Paystack network calls and an HTTP action for the webhook.
- Validate every public function argument and every state transition server-side.
- Keep Paystack secrets and moderation secrets in Convex/Vercel environment configuration, never in client bundles.

### Suggested source layout

```text
app/
  layout.tsx
  page.tsx
  loading.tsx
  error.tsx
  opengraph-image.tsx
  gift/page.tsx
  success/page.tsx
  wall/page.tsx
  moderate/page.tsx
components/
  home/
  gift-flow/
  wall/
  celebration/
  shared/
  ui/
convex/
  schema.ts
  messages.ts
  gifts.ts
  stats.ts
  moderation.ts
  paystack.ts
  http.ts
  lib/
lib/
  constants.ts
  formatting.ts
  validation.ts
  profanity.ts
  analytics.ts
public/
  brand/
  cake/
```

The exact generated Convex files and shadcn paths will follow their CLIs rather than being created manually.

## 6. Data design

### `events`

Add an event record even though v1 has one birthday. This is the small piece that makes next-year reuse safe.

- `slug`, `title`, `birthdayAt`, `opensAt`, `closesAt`, `timezone`
- `status`: `draft | live | archived`
- configurable tier amounts, custom min/max, and share copy
- indexes: `by_slug`, `by_status`

### `visitors`

- `eventId`, `displayName`, `normalizedCountry`, `countryCode`
- `isAnonymous`, `createdAt`
- optional private abuse/audit fields; public queries never return hidden names
- index: `by_event`

### `messages`

- `eventId`, `visitorId`, optional `giftId`
- `body`, `category`: `wish | advice | prayer | roast`
- `isAnonymous`, `isFeatured`
- `status`: `pending | approved | rejected`
- moderation reason/flags and timestamps
- indexes: `by_event_status_createdAt`, `by_event_status_category`, `by_gift`

### `gifts`

- `eventId`, `visitorId`, `messageId`
- `amountKobo`, `currency: "NGN"`, `tier`
- `paystackReference`, optional provider transaction ID
- `status`: `initiated | pending | success | failed | abandoned`
- `createdAt`, `paidAt`, and last verification timestamp
- indexes: `by_reference`, `by_event_status`, `by_message`

### `moderationAudit`

- message ID, action, reason, actor label, and timestamp
- retained separately so message edits/status changes remain traceable

Stats should be derived from indexed successful gifts and approved messages for correctness. If launch traffic or query cost warrants it, introduce an event aggregate document updated within the same idempotent payment/moderation mutation. Do not maintain counters in the client.

## 7. Payment and security design

- Generate payment references server-side with enough entropy and enforce uniqueness.
- Store money as integer kobo and format only at the UI boundary.
- Never accept the final amount, tier price, currency, or payment status from the browser as authoritative.
- Initialize Paystack from a server-side Convex action and send the reference plus internal IDs as metadata.
- Verify the webhook HMAC signature against the raw request body using Paystack's documented algorithm.
- Verify successful transactions against Paystack's verify endpoint and compare reference, amount, currency, and expected recipient before publishing anything.
- Make webhook processing idempotent: repeated or out-of-order webhook deliveries must not duplicate gifts, approvals, stats, or analytics.
- Treat the callback as a UX signal only. The success page remains in “confirming payment” until the backend reports `success`.
- Log safe diagnostic fields only; never log secrets, full webhook bodies, or unnecessary personal information.
- Apply server-side length validation, normalized input, profanity/abuse checks, and URL/link limits.
- Rate-limit public submissions and payment initialization using a privacy-conscious fingerprint/IP hash at the HTTP boundary where available.
- Add basic security headers and a Content Security Policy compatible with the exact Paystack Checkout domains.
- Protect `/moderate` on both the page and every moderation mutation. A hidden URL alone is not authentication.

## 8. Visual system and interaction plan

- Establish a warm cream canvas, near-black type, and one rich accent color after a quick visual direction pass.
- Pair an expressive editorial display face with a readable sans face through `next/font`.
- Design for 390 px width first, then test 320 px, tablet, and desktop breakpoints.
- Make the cake the signature visual with a tap/squish/sprinkle reaction and a short reset.
- Keep animation purposeful: stagger hero elements, count stats on first view, lift message cards, and celebrate only once per confirmed reference.
- Use CSS columns only if keyboard and reading order remain logical; otherwise use a responsive grid with controlled featured spans instead of true masonry.
- Give every interactive element visible focus, touch targets of at least 44 px, semantic labels, helpful errors, and screen-reader status announcements.
- Make the hero screenshot-ready without depending on live data being non-zero.
- Generate route metadata and a deliberate 1200×630 Open Graph image for social sharing.

## 9. Analytics and observability

Track privacy-conscious product events without storing message content in analytics:

- `hero_primary_clicked`
- `message_only_clicked`
- `gift_tier_selected`
- `message_submitted`
- `payment_initialized`
- `payment_confirmed`
- `payment_failed`
- `share_clicked` with Web Share/copy fallback method
- `wall_viewed` and `wall_filter_changed`

Record Paystack/Convex errors with references and internal IDs, not secrets or full personal data. Add a simple launch-day health view or documented Convex dashboard queries for successful payments, initiated-but-unconfirmed payments, rejected webhooks, and moderation backlog.

## 10. Execution milestones

The milestones below are the delivery sequence, not parallel workstreams. Each milestone ends in a reviewable product increment and must meet its completion gate before the next payment- or launch-critical milestone begins. Calendar dates will be assigned by working backward from the confirmed birthday.

| Milestone | Product increment | Depends on | Completion evidence |
| --- | --- | --- | --- |
| M0 — Product lock | Agreed v1 scope and launch configuration | Birthday and owner decisions | Decision log and final content/assets checklist |
| M1 — Foundation | Deployable branded application shell | M0 | Local app, preview deploy, Convex dev connection |
| M2 — Clickable experience | Complete public UX using fixture data | M1 | Mobile/desktop walkthrough of every screen |
| M3 — Live Wall | Convex-backed real-time messages and statistics | M2 | Two sessions update without refresh |
| M4 — Safe submissions | Free-message and moderation workflow | M3 | Submit → moderate → publish demonstration |
| M5 — Paid vertical slice | End-to-end Paystack test transaction | M4 | One verified gift appears once on the Wall |
| M6 — Release candidate | Celebration, sharing, analytics, accessibility, and resilience complete | M5 | Staging acceptance suite passes |
| M7 — Production launch | Live payment verified and launch runbook activated | M6 | Low-value live smoke payment and go/no-go sign-off |

### M0 — Product lock

**Deliverable:** a signed-off v1 definition that removes ambiguity from implementation.

**Status:** In progress. The decision log and design-system foundation were created on 2026-08-13; owner confirmations and launch inputs remain outstanding. See `docs/m0-product-lock.md`.

- [x] Create the M0 decision log, provisional defaults, input checklist, and completion gate.
- [x] Translate the supplied visual reference into design tokens, typography, primitives, product patterns, and a living specimen.
- [ ] Confirm the birthday date, timezone, opening time, payment cutoff, and archive behavior.
- [ ] Confirm free-message, moderation, category, featured-message, and custom-amount decisions from section 3.
- [ ] Approve final copy, tier labels, brand palette, font direction, cake direction, portrait/avatar, social handles, and canonical domain.
- [ ] Identify the moderation owner and who can access Paystack, Convex, Vercel, domain, and analytics settings.
- [ ] Mark likes, multi-currency, accounts, and a full admin dashboard explicitly out of scope.

**Milestone complete when:** the decision table contains no unresolved launch blocker, required assets have an owner, and the v1 acceptance criteria are approved.

### M1 — Foundation running in development and preview

**Deliverable:** a deployable technical skeleton with environments separated correctly.

- [ ] Install and configure Convex, shadcn/ui, Motion, Lucide, validation, filtering, analytics, and test dependencies.
- [ ] Create `.env.example` with variable names only and document development, preview, and production configuration.
- [ ] Configure Convex development and preview deployments plus Paystack test mode.
- [ ] Define Tailwind theme tokens, font setup, application providers, route skeletons, metadata defaults, and error boundaries.
- [ ] Establish lint, type-check, test, and production-build commands in CI.
- [ ] Produce the first Vercel preview deployment.

**Milestone complete when:** a new contributor can start the app from the documented setup, `/`, `/gift`, `/wall`, and `/success` render in preview, Convex reports healthy, and CI is green.

### M2 — Clickable branded experience

**Deliverable:** the complete visitor journey using fixture data, ready for visual/product review before backend behavior is added.

- [ ] Build the navigation, hero, interactive cake, stats block, recent messages, and primary/secondary CTA states.
- [ ] Build reusable buttons, fields, gift-tier cards, message cards, category chips, notices, skeletons, and empty states.
- [ ] Build `/gift` selection, message, review, and payment-loading steps with local fixture state.
- [ ] Build `/success` celebration/message/share layouts with simulated confirming, success, and failure states.
- [ ] Build `/wall` with responsive card layout, category filters, and featured-card treatment.
- [ ] Implement keyboard interaction, visible focus, minimum touch targets, contrast, and reduced-motion behavior.
- [ ] Review and approve the experience at 390 px mobile and desktop widths.

**Milestone complete when:** stakeholders can click through both paid and message-only journeys in preview, every specified screen/state is represented, and the visual direction is approved without requiring backend data.

### M3 — Real-time Birthday Wall

**Deliverable:** fixture data is replaced by a correct, privacy-safe Convex read path.

- [ ] Add event, visitor, message, gift, and moderation-audit schemas with required indexes.
- [ ] Seed the current event and development-only sample messages.
- [ ] Implement public queries that return only approved messages and never expose hidden anonymous names.
- [ ] Add paginated Wall queries by category, recent-message queries, live stats, and reference-scoped payment status.
- [ ] Connect home stats/recent messages and the Wall to reactive Convex queries.
- [ ] Implement loading, empty, error, retry, and reconnecting states.
- [ ] Add automated tests for filtering, aggregation, pagination, and privacy boundaries.

**Milestone complete when:** approving/inserting a test message updates the home and Wall in two simultaneous browser sessions without refresh, filters return correct results, and private fields are absent from public responses.

### M4 — Safe message submission and moderation

**Deliverable:** a usable message-only path that cannot publish unreviewed public content.

- [ ] Implement shared client/server validation, input normalization, anonymous behavior, category selection, and the 280-character limit.
- [ ] Add server-side abuse/profanity checks, link rules, and rate limiting.
- [ ] Submit free messages with `pending` status and show an accurate awaiting-approval confirmation.
- [ ] Build the protected `/moderate` queue with approve, reject, feature, and unfeature actions.
- [ ] Write a moderation audit record for every status/featured change.
- [ ] Verify anonymous names and message content are not sent to analytics.
- [ ] Test rejected, flagged, duplicated, malformed, and rate-limited submissions.

**Milestone complete when:** a clean free message can be submitted, reviewed, approved, and observed live on the Wall; rejected or unreviewed messages never appear publicly; unauthorized moderation calls fail.

### M5 — Verified paid vertical slice

**Deliverable:** one production-shaped Paystack test payment completes the entire core journey.

- [ ] Implement authoritative tier lookup, custom amount bounds, integer-kobo conversion, and unique server-generated references.
- [ ] Persist pending visitor/message/gift records and initialize Paystack from a Convex action.
- [ ] Open Paystack Checkout and handle cancellation, initialization error, retry, browser back, and refresh.
- [ ] Add the Convex webhook endpoint with raw-body signature verification and independent Paystack transaction verification.
- [ ] Compare reference, expected amount, currency, and recipient before accepting success.
- [ ] Implement one idempotent confirmation mutation that marks the gift paid and publishes only an unflagged message.
- [ ] Implement callback reconciliation and `/success` confirming, confirmed, failed, and timed-out states.
- [ ] Test duplicate/delayed webhooks, forged signatures, altered amounts, failed payments, and callback-before-webhook order.

**Milestone complete when:** a Paystack test transaction creates exactly one successful gift, publishes exactly one correct message, updates stats in real time, and repeated or malicious webhook requests produce no incorrect state change.

This is the **core MVP milestone**. If the launch window becomes constrained, everything required through M5 is protected; optional animation refinements and auto-feature behavior can be reduced before payment correctness, moderation, privacy, or accessibility.

### M6 — Release candidate accepted

**Deliverable:** a staging build that is content-complete, shareable, observable, accessible, and ready for live credentials.

- [ ] Add one-time reduced-motion-aware confetti, final cake interaction, animated counters, selection motion, and card motion.
- [ ] Add Web Share with clipboard fallback and accessible success feedback.
- [ ] Finalize canonical metadata, favicon, 1200×630 social artwork, and share copy.
- [ ] Add the analytics events and safe operational logging listed in section 9.
- [ ] Optimize fonts, images, client-component boundaries, and route-specific animation loading.
- [ ] Complete unit, Convex integration, and end-to-end test suites.
- [ ] Test 320/390/430 px phones, tablet, desktop, iOS Safari, Android Chrome, and desktop Safari/Chrome/Firefox.
- [ ] Complete keyboard, screen-reader, contrast, zoom, reduced-motion, slow-network, and Core Web Vitals checks.
- [ ] Rehearse moderation, payment reconciliation, archive mode, rollback, and incident procedures against staging.

**Milestone complete when:** the staging acceptance suite passes, there are no severity-1 or severity-2 defects, final copy/assets are frozen, and the owner signs off on the release candidate.

### M7 — Production launch and handoff

**Deliverable:** the live birthday experience is verified, monitored, and ready to share publicly.

- [ ] Configure separate production Convex, Vercel, analytics, canonical domain, and Paystack live credentials.
- [ ] Register and verify the production webhook URL.
- [ ] Confirm the event configuration, tier prices, custom limits, opening/cutoff times, timezone, moderation access, and archive behavior.
- [ ] Run a low-value live payment from a clean mobile browser.
- [ ] Verify Paystack status, success page, published Wall card, stats, analytics, and settlement/reference data.
- [ ] Execute the documented go/no-go checklist and publish the share link only after sign-off.
- [ ] Monitor payment initialization failures, unconfirmed references, webhook failures, moderation backlog, and site health throughout launch day.
- [ ] Reconcile ambiguous payments through Paystack verification and switch the event to `archived` at the configured cutoff.

**Milestone complete when:** the live smoke payment passes end to end, the owner has approved launch, monitoring has an active owner, and post-event archive mode has been verified.

## 11. Test strategy

### Unit tests

- Tier/amount resolution and naira↔kobo formatting.
- Form schemas, normalization, anonymous display, and category mapping.
- Profanity/link rules and featured eligibility.
- Webhook signature helper and payment state transition rules.

### Convex function tests

- Public queries exclude pending/rejected messages and private names.
- Repeated confirmation is idempotent.
- Mismatched reference/amount/currency cannot succeed.
- Stats count successful gifts and approved messages correctly.
- Free and paid moderation paths behave as specified.

### End-to-end tests

- Home → paid gift → Paystack test completion → confirming → success → share → Wall.
- Home → free message → pending confirmation → moderator approval → Wall.
- Anonymous paid message displays “Anonymous” everywhere public.
- Custom amount validation and all cancellation/failure/retry states.
- Wall filters, pagination/loading, and responsive navigation.

## 12. Environment configuration

Expected names, to be finalized against the installed SDKs and hosting setup:

```text
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
MODERATION_SECRET=
EVENT_SLUG=
```

Public keys may be exposed only where the chosen Checkout integration requires them. Secret keys belong in Convex/Vercel server configuration and must never use a `NEXT_PUBLIC_` prefix. Development, preview, and production must use separate Convex deployments and Paystack test/live credentials.

## 13. Launch-day runbook

- Confirm event status is `live`, times use the intended timezone, and live tiers/custom bounds match the page.
- Confirm the production webhook is healthy and the moderation owner is available.
- Make one final low-value purchase from a clean mobile browser and verify Paystack, success, Wall, stats, and analytics.
- Monitor failed initializations, initiated payments not confirmed within the expected window, webhook errors, and moderation backlog.
- Reconcile ambiguous payments through Paystack verification before changing status; never approve based on a screenshot or callback alone.
- Switch to `archived` at the configured cutoff, leaving the Wall and share links readable while disabling new submissions and payment initialization.

## 14. Definition of done

- A first-time mobile visitor can complete a paid gift and optional message in under 60 seconds under normal network conditions.
- No account or login is required for public participation.
- Payment publication is server-authoritative, verified, idempotent, and correct for amount/currency/reference.
- Approved Wall messages and stats update near-real-time across sessions.
- Free messages, if enabled, cannot publish without moderation.
- Anonymous visitor names are not returned by any public query or analytics event.
- The key flow works with keyboard, reduced motion, screen readers, slow networks, and supported mobile/desktop browsers.
- The hero and social preview are intentional, branded, and screenshot/share ready.
- Lint, type checks, production build, automated tests, accessibility checks, and the live payment smoke test pass.
- Launch, moderation, reconciliation, rollback, and archive procedures are documented.
