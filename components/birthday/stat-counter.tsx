"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export function StatCounter({ value, duration = 900 }: { value: number; duration?: number }) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reducedMotion]);

  return <>{(reducedMotion ? value : display).toLocaleString()}</>;
}
