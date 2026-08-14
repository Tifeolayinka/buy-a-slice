import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Uses the approved design-system tokens (docs/design-system.md) directly —
// no photography or illustration assets required. System serif/sans stacks
// stand in for Fraunces/DM Sans here since next/og needs font bytes fetched
// explicitly; swapping in the real webfonts is a easy follow-up once brand
// assets are finalized (M0).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#FFF8EE",
          backgroundImage:
            "radial-gradient(circle at 8% 8%, rgba(239,184,74,0.18) 0, transparent 45%), radial-gradient(circle at 95% 15%, rgba(240,100,109,0.14) 0, transparent 50%)",
        }}
      >
        <div style={{ fontSize: 160, lineHeight: 1 }}>🎂</div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            color: "#24120B",
            fontFamily: "serif",
            letterSpacing: "-0.02em",
          }}
        >
          It&rsquo;s Tife&rsquo;s Birthday
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#5A4636",
            fontFamily: "sans-serif",
          }}
        >
          Buy him a slice and leave some love 🍰
        </div>
      </div>
    ),
    size,
  );
}
