# Buy Tife a Slice — Design System

Status: Foundation v0.1  
Source: supplied mobile experience reference  
Last updated: 2026-08-13

## Brand idea

The product is a tiny internet celebration, not a checkout funnel wearing birthday copy. The interface should feel personal, premium, warm, and immediately shareable.

Three principles guide every component:

1. **Editorial first.** Expressive serif headlines create the personality; the interface itself stays quiet and readable.
2. **One celebratory moment at a time.** Coral, confetti, illustration, and motion are accents—not the default background treatment.
3. **Soft but decisive.** Rounded surfaces feel friendly, while espresso primary actions make the next step unmistakable.

## Color roles

| Role | Token | Approximate reference | Use |
| --- | --- | --- | --- |
| Canvas | `--background` | `#FFF8EE` | Page background and breathing room |
| Ink | `--foreground` | `#24120B` | Primary text |
| Espresso | `--primary` | `#2A1108` | Main CTA, selected chip, dark surface |
| Surface | `--card` | `#FFFCF7` | Cards, form controls, panels |
| Apricot | `--border` | `#E7C7A7` | Borders and separators |
| Soft cream | `--secondary` | `#F8EBDD` | Secondary/hover surfaces |
| Coral | `--celebration` | `#F0646D` | Hearts, celebration, featured card |
| Gold | `--gold` | `#EFB84A` | Confetti and illustration only |
| Mint | `--mint` | `#67BA8B` | Confetti and illustration only |
| Sky | `--sky` | `#64B7C6` | Confetti and illustration only |

All UI components consume semantic roles such as `primary`, `border`, and `muted`; product code should not introduce raw color values.

## Typography

- **Display:** Fraunces, weight 600. Use for page titles, emotional statements, and the brand mark.
- **Interface/body:** DM Sans, weights 400–700. Use for body, controls, stats, labels, and messages.
- **Code/token documentation:** Geist Mono.
- Display tracking is tight (`-0.035em` to `-0.045em`) with compact line height (`0.92`–`1.02`).
- Body text should generally remain 16px on mobile. Labels may use 12–14px but must retain sufficient contrast.

## Shape, spacing, and depth

- Base radius: 14px; large cards: 20–24px; buttons and chips: full pill.
- Minimum interactive target: 44×44px.
- Use a 4px spacing base. Common gaps are 8, 12, 16, 24, 32, 48, and 80px.
- Shadows are warm and broad. Use `shadow-card` for cards and `shadow-float` only for selected or elevated moments.
- Avoid glassmorphism. Slight transparency is allowed only where the underlying canvas remains calm.

## Component behavior

- One espresso primary CTA per step.
- Outline buttons use the card surface and apricot border.
- Gift tiers are whole-card selection targets; selected state uses the ring color plus a filled radio indicator.
- Inputs have a 48px minimum height, card background, apricot border, and visible focus ring.
- Wall filter chips use espresso only for the active value.
- Standard messages remain quiet cream cards. Featured messages may use the coral treatment.
- Avatar fallbacks use initials; public anonymous entries must say `Anonymous` and never receive hidden names as props.

## Motion guidance

- Motion should communicate selection, arrival, or celebration.
- Keep interaction feedback around 150–220ms and sheet/page transitions around 280–360ms.
- Confetti plays once after server-confirmed payment.
- Cake reactions should reset quickly and never block the CTA.
- Every animation must respect `prefers-reduced-motion`.

## Accessibility rules

- Maintain WCAG AA contrast for body text and interactive states.
- Never rely on color alone for selected, error, or payment status.
- Preserve visible focus and logical keyboard order.
- Provide text labels for emoji/illustrations when meaningful; mark decorative emoji as hidden.
- Announce payment and submission status through an appropriate live region.

## Implementation locations

- Semantic tokens and global rules: `app/globals.css`
- Optimized fonts and site metadata: `app/layout.tsx`
- shadcn primitives: `components/ui/`
- Birthday-specific patterns: `components/birthday/system.tsx`
- Living specimen page: `app/design/page.tsx` (route: `/design`, noindex)

## Still needed from the owner

- Final cake/celebration illustrations and usage rights.
- Confirmation that Fraunces and DM Sans match the intended brand personality.
- Final logo lockup preference and whether a portrait should appear anywhere.
- Approved canonical domain and social preview artwork.
