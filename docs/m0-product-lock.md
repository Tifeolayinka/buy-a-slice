# M0 — Product Lock

Status: In progress  
Started: 2026-08-13  
Milestone gate: Not yet met

## Locked from the PRD and supplied reference

- Product: a public, single-event birthday microsite for Tife Olayinka.
- Primary outcome: a visitor buys a Paystack-powered NGN gift and optionally leaves a public message in under 60 seconds.
- Secondary outcome: message-only participation is supported without requiring an account.
- Core routes: Home, Gift flow, Success, Birthday Wall, and lightweight Moderation.
- Stack: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Motion, Lucide, Convex, Paystack, and Vercel.
- Visual direction: warm ivory canvas, espresso type/actions, apricot borders, coral celebration accent, editorial serif headlines, sans-serif UI, rounded cards, subtle warm shadows, and playful illustration.
- Non-goals: accounts, recurring tipping, multi-currency, a full admin dashboard, and likes in core v1.

## Provisional v1 decisions

These defaults unblock implementation but require owner confirmation before M0 can close.

| ID | Decision | Proposed value | Status |
| --- | --- | --- | --- |
| D-01 | Free messages | Allowed; held for moderation | Awaiting confirmation |
| D-02 | Paid message publishing | Auto-publish after verified payment unless flagged | Awaiting confirmation |
| D-03 | Categories | User-selected; Wish is the default | Awaiting confirmation |
| D-04 | Featured messages | High-tier eligibility plus manual override | Awaiting confirmation |
| D-05 | Post-birthday lifecycle | Public read-only archive after cutoff | Awaiting confirmation |
| D-06 | Custom amount | ₦500 minimum; ₦1,000,000 maximum | Awaiting confirmation |
| D-07 | Likes | Excluded from v1 | Proposed locked |
| D-08 | Visual foundation | Design system v0.1 derived from reference | Implemented; awaiting visual sign-off |

## Inputs still required

- [ ] Birthday date and year.
- [ ] Event timezone, opening time, payment cutoff, and archive time.
- [ ] Canonical domain and final share URL.
- [ ] Final display copy, social handles, and birthday share copy.
- [ ] Final logo/cake/portrait/social-preview assets and usage rights.
- [ ] Paystack test/live account owner and webhook configuration access.
- [ ] Convex and Vercel project ownership.
- [ ] Moderation owner and access method.
- [ ] Analytics provider decision.
- [ ] Seed messages, if the Wall should launch with content.

## M0 completion gate

M0 closes only when:

1. D-01 through D-08 are confirmed or replaced.
2. Birthday timing, domain, final copy, and visual assets are supplied.
3. Each external account has an owner and access path.
4. The design-system specimen receives visual sign-off.
5. The final v1 acceptance criteria and explicit non-goals are approved.
