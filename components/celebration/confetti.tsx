"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const COLORS = ["#F0646D", "#EFB84A", "#67BA8B", "#64B7C6", "#2A1108"];
const PIECES = 120;
const DURATION_MS = 2600;

// Small one-shot canvas confetti; no external dependency (plan.md §5).
export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const pieces = Array.from({ length: PIECES }, () => ({
      x: Math.random() * width,
      y: -20 - Math.random() * height * 0.4,
      size: 5 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: 2 + Math.random() * 3,
      drift: (Math.random() - 0.5) * 1.6,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.2,
    }));

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);
      const fade = elapsed > DURATION_MS - 600 ? Math.max(0, (DURATION_MS - elapsed) / 600) : 1;
      for (const piece of pieces) {
        piece.y += piece.speed;
        piece.x += piece.drift;
        piece.rotation += piece.spin;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
        ctx.restore();
      }
      if (elapsed < DURATION_MS) frame = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  if (reducedMotion) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
