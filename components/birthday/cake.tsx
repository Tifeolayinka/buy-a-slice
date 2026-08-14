"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const SPRINKLES = ["🎉", "✨", "🍓", "🎈"];

export function Cake() {
  const reducedMotion = useReducedMotion();
  const [burstId, setBurstId] = useState(0);

  return (
    <div className="relative py-4">
      <motion.button
        type="button"
        aria-label="Birthday cake — tap for a little celebration"
        onClick={() => setBurstId((id) => id + 1)}
        whileTap={reducedMotion ? undefined : { scale: 0.9, rotate: -3 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
        className="rounded-full text-8xl leading-none outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/35"
      >
        <span aria-hidden="true">🎂</span>
      </motion.button>

      <AnimatePresence>
        {burstId > 0 && !reducedMotion ? (
          <motion.div
            key={burstId}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {SPRINKLES.map((emoji, index) => {
              const angle = (index / SPRINKLES.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <motion.span
                  key={`${burstId}-${emoji}`}
                  className="absolute text-2xl"
                  variants={{
                    hidden: { opacity: 0, x: 0, y: 0, scale: 0.4 },
                    visible: {
                      opacity: [0, 1, 0],
                      x: Math.cos(angle) * 64,
                      y: Math.sin(angle) * 56 - 12,
                      scale: 1,
                      transition: { duration: 0.7, ease: "easeOut" },
                    },
                  }}
                >
                  {emoji}
                </motion.span>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
