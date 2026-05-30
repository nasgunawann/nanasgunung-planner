"use client";

import React from "react";
import { AnimatePresence, m } from "motion/react";

interface Props {
  displayProgress: number;
  generationStep: number;
  platform: string;
  tone: string;
}

export default function AiProgressCard({
  displayProgress,
  generationStep,
  platform,
  tone,
}: Props) {
  return (
    <div className="group relative rounded-xl border border-primary/20 bg-primary/[0.01] backdrop-blur-sm p-5 shadow-sm overflow-hidden">
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-24 h-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
      <div className="relative space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xs font-bold text-foreground">
              AI Content Brainstormer
            </h4>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 text-[10px] font-bold text-white shrink-0 animate-pulse" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Merancang 3 sudut pandang kreatif untuk {platform} ({tone})
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono leading-none">
            <span className="font-semibold text-muted-foreground">
              Progress
            </span>
            <span className="font-bold text-foreground">
              {Math.round(displayProgress)}%
            </span>
          </div>

          <div className="relative h-1.5 overflow-hidden rounded-full bg-muted border border-border/40">
            <div
              className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {[
            "Menganalisis ide & keselarasan audiens",
            `Meriset opening hook untuk ${platform}`,
            `Menyusun 3 sudut pandang kreatif (${tone})`,
            "Membuat draf visual & outline storyboard",
            "Menyimpan draf ide kreatif...",
          ].map((task, index) => {
            const isTaskDone = index < generationStep - 1;
            const isTaskActive = index === generationStep - 1;

            return (
              <div
                key={index}
                className="flex items-center gap-2.5 transition-all duration-300"
                style={{
                  opacity: isTaskActive ? 1 : isTaskDone ? 0.65 : 0.35,
                  transform: isTaskActive ? "translateX(4px)" : "translateX(0)",
                }}
              >
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted border border-border/50">
                  {isTaskDone ? (
                    <span className="text-[10px] text-green-500 font-bold">
                      ✓
                    </span>
                  ) : isTaskActive ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  )}
                </div>
                <span
                  className={[
                    "text-xs leading-none transition-all",
                    isTaskActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground",
                    isTaskDone
                      ? "line-through decoration-muted-foreground/30"
                      : "",
                  ].join(" ")}
                >
                  {task}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
