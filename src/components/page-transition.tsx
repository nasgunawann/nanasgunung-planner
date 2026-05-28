"use client";

import React from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  // If the user has "Reduce Motion" enabled in system settings, render statically
  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "tween",
          ease: [0.16, 1, 0.3, 1], // Sleek, ultra-snappy easeOut cubic curve
          duration: 0.18, // Snappy 180ms duration
        }}
        className="w-full flex-1 flex flex-col min-h-0"
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
