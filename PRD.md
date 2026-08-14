PRD — Buy Tife a Slice

Owner: Tife Olayinka Type: Public, single-event birthday web app Target launch: Tife's birthday (date TBD) Status: Draft v1

1. Summary

"Buy Tife a Slice" is a playful, mobile-first birthday microsite. Friends, followers, clients, and strangers can buy Tife a virtual "slice of cake" (a small paid gift, via Paystack) and leave a public birthday message on a shareable "Birthday Wall." The product should feel like a premium personal-brand experience and a shareable moment for social media — not a donation page or a SaaS dashboard.

Primary goal: maximize delightful, shareable engagement on one day, and generate small birthday "gift" revenue with minimal friction.

2. Goals & non-goals

Goals

Let anyone send Tife a paid "slice" + optional message in under 60 seconds, no login required.
Make the first screen strong enough to screenshot and post to X, LinkedIn, Instagram, WhatsApp.
Publicly display messages/gifts on a Birthday Wall to create social proof and a feedback loop (people see others giving, and give too).
Support real, working payments via Paystack (NGN).
Feel personal and playful, not like ecommerce or crowdfunding.

Non-goals (v1)

No user accounts / authentication.
No admin dashboard beyond a lightweight moderation view.
Not a recurring/evergreen tipping product — built for a single birthday window, though the codebase should tolerate reuse next year.
No multi-currency support beyond NGN at launch (custom amount field can stay NGN-only for v1).
3. Target users
Primary: People who know Tife personally or professionally (friends, clients, LinkedIn/X/Instagram followers) who see a shared link on his birthday.
Secondary: Strangers who discover the link virally and want to participate in the moment without knowing Tife well (drives the "roast/wish/advice/prayer" message categories).
4. Core user flow
Home → Select Slice → Write Message → Payment → Celebration (Success) → Birthday Wall → Share

Message-only path (no payment) should also exist, reachable via the secondary CTA "Leave a birthday message" — see open question in §9.

5. Screens & functional requirements
5.1 Home
Hero: "It's Tife's Birthday 🎂" + supporting copy "I survived another year. That deserves cake."
Illustrated animated cake as the signature visual (tap → playful micro-reaction).
Primary CTA: Buy me a slice →
Secondary CTA: Leave a birthday message
Live stats block, animated on mount: total supporters today, 🍰 slices bought, 💌 messages received, 🌍 countries represented.
Recent messages preview (2–3 cards) with See the Birthday Wall → link.
Minimal nav: Home · Birthday Wall.
5.2 Buy a Slice
Bottom sheet (mobile) / modal-panel (desktop) with 4 selectable options:
🍰 One Slice — ₦1,000
🎂 Big Slice — ₦2,500
🥂 Birthday Energy — ₦5,000
👑 You really love Tife — custom amount (numeric input, NGN, min ₦500 suggested)
Single-select animated selection state.
Continue → CTA, disabled until a valid option/amount is chosen.
5.3 Birthday Message
Prompt: "Say something to birthday boy 🎈"
Fields: Name (required unless anonymous), Country (optional, dropdown or free text), Message (required, textarea with character counter, max 280 chars).
Toggle: Post anonymously (hides name on the Wall, still stored internally for spam/abuse handling).
Optional: message category tag for Wall filtering — Wish / Advice / Prayer / Roast (can be auto-suggested or user-picked; see §9).
CTA: Send some love ❤️
5.4 Payment
Review card: selected gift, amount, name, message preview.
CTA: Buy Tife a Slice — ₦X
Paystack Inline/Checkout integration (NGN). Payment reference generated server-side before charge is initiated.
Trust copy: "Payment is secure and encrypted," payment logos.
Loading state while Paystack processes; on webhook/callback confirmation, message + gift are marked "paid" and become visible on the Wall.
5.5 Success (Celebration)
Confetti animation (tasteful, short, one-time).
"You just made Tife's day 🎉" / "Your slice has officially been added to the cake."
Submitted message rendered back in a styled card.
CTAs: Share this 🎂 (Web Share API, fallback to copy-link), See the Birthday Wall.
5.6 Birthday Wall
Header: "The Birthday Wall 💌" / "Messages from some pretty amazing humans."
Masonry/card grid of messages: avatar (initials-generated), name or "Anonymous," country (if provided), message, relative timestamp, like count (optional stretch).
Filter chips: All · Wishes · Advice · Prayers · Roasts.
Occasional larger "featured" cards (manually curated or auto-selected by highest gift tier / like count).
Only messages tied to a confirmed payment (or, if free messages are allowed — see §9 — approved via light moderation) appear publicly.
6. Data model (high level)
Visitor — id, display name, country (optional), anonymous flag, created_at.
Message — id, visitor_id, gift_id (nullable if free message), body, category, is_anonymous, is_featured, status (pending/approved/rejected), created_at.
Gift/Payment — id, visitor_id, message_id, amount, currency, tier (slice/big_slice/energy/custom), paystack_reference, status (initiated/success/failed), paid_at.
BirthdayStats — derived/aggregated (or computed on read): total gifts, total messages, distinct countries — should update in near-real-time as new gifts land.
7. Recommended stack

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Framer Motion + Lucide — as specified — plus:

Backend/data: Convex

Convex is the right call here over a traditional Postgres/Prisma or Supabase setup, for this specific product:

Real-time by default. The Birthday Wall and live stats ("42 people showed Tife love today") need to update live as gifts land — Convex's reactive queries give you this for free via useQuery, no polling, no websocket plumbing, no cache invalidation logic to hand-write.
Speed to ship. This is a single-event, short-runway build. Convex collapses schema, server functions, and data-fetching into one TypeScript codebase colocated with the Next.js app — less infra to stand up than Postgres + an ORM + a separate API layer.
Mutations map cleanly to the flow. "Submit message," "create pending gift," "confirm payment via webhook," "increment stats" are all simple Convex mutations/actions — no need for a separate queue or cron for the common cases.
Paystack webhook handling. Use a Convex HTTP action as the webhook endpoint (/paystack/webhook) that verifies the Paystack signature, then runs a mutation to flip the gift/message to "paid" and publish it to the Wall. This keeps payment confirmation server-authoritative (never trust the client redirect alone).
Good free tier for a low-infra, short-lived public app like this.

When Convex would not be the pick: if this were evolving into a long-lived multi-tenant SaaS product with complex relational reporting, or if it needed to plug into existing Postgres-based infra Tife already runs (e.g., alongside Piton Digital's other tools) — then Prisma + Postgres (Supabase or Neon) would be the safer long-term choice. For a single-purpose, real-time, ship-fast birthday app, Convex is the stronger fit.

Payments
Paystack (as specified) — use Paystack Inline JS or Checkout, initialize the transaction server-side (Convex action) to set the correct amount/metadata, verify via webhook + paystack.transaction.verify before marking a gift as paid. Never mark a gift paid purely on client-side redirect success.
Hosting
Vercel for the Next.js frontend (pairs natively with Convex's client SDK and preview deployments).
Other
Web Share API for native sharing, with navigator.clipboard copy-link fallback for unsupported browsers.
Lightweight profanity/abuse filter on message submission (client + server-side check) given the public, unauthenticated nature of the Wall.
8. Visual/UX direction (from spec)
Warm off-white/cream background, near-black type, one rich birthday accent color.
Large editorial display font for headlines + highly readable sans for UI/body.
Rounded cards, subtle shadows, generous spacing.
Avoid: generic SaaS styling, heavy gradients, glassmorphism, "AI-generated UI" look.
Micro-interactions throughout: cake tap reaction, animated stat counters, card lift on hover/tap, animated bottom sheets, animated slice-selection states, confetti on success.
Mobile-first (iPhone viewport as primary target), fully responsive to desktop.
9. Open questions
Are free messages (no payment) allowed on the Wall, or does every Wall entry require a paid gift? The mockup's secondary CTA "Leave a birthday message" implies a message-only path — needs a decision since it affects moderation and the data model (nullable gift_id).
Moderation: auto-publish on payment success, or a manual approve step before a message appears on the public Wall? Public + unauthenticated + no login raises spam/abuse risk.
Message categorization (Wishes/Advice/Prayers/Roasts): user-selected at submission, or inferred later? Affects the message form.
Featured messages: manually curated by Tife, or auto-selected (e.g., by gift tier or like count)?
Post-birthday lifecycle: does the app stay live indefinitely as an archive, get frozen/read-only, or get reset for reuse next year?
Custom amount minimum/maximum for the "You really love Tife" tier.
10. Success metrics
Total gifts / total revenue (₦) on launch day.
Total messages (paid + free, if applicable).
Unique countries represented.
Social shares triggered from the Success screen (track Share button clicks).
Return visits to the Birthday Wall post-launch-day.