"use client";

import React from "react";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";
import { PlatformSelect, ToneSelect } from "@/components/planner-selects";
import { Button } from "@/components/ui/button";

interface Props {
  topic: string;
  setTopic: (v: string) => void;
  platform: string;
  setPlatform: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  isGenerating: boolean;
  onGenerate: (e: React.FormEvent) => void;
}

export default function PromptStudioForm({
  topic,
  setTopic,
  platform,
  setPlatform,
  tone,
  setTone,
  isGenerating,
  onGenerate,
}: Props) {
  return (
    <div className="bg-card border border-border/60 p-3 sm:p-5 rounded-xl shadow-sm space-y-2 sm:space-y-4">
      <h3 className="font-heading text-sm sm:text-base font-bold flex items-center gap-2">
        <IconSparkles className="size-4 text-primary" />
        AI Brainstormer
      </h3>

      <form onSubmit={onGenerate} className="grid gap-2.5 sm:gap-4">
        <div className="grid gap-1">
          <label
            htmlFor="topic-input"
            className="text-[10px] sm:text-xs font-semibold text-muted-foreground"
          >
            Masukkan ide atau topik kasar di sini
          </label>
          <textarea
            id="topic-input"
            rows={2}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ketemu cafe murah buat nugas... "
            className="rounded-md border border-border bg-background p-2 sm:p-3 text-xs sm:text-sm outline-none focus:border-primary/50 resize-none min-h-[60px] sm:min-h-[100px]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="grid gap-1">
            <label
              htmlFor="platform-select"
              className="text-[10px] sm:text-xs font-semibold text-muted-foreground"
            >
              Platform Sosial
            </label>
            <PlatformSelect
              value={platform}
              onValueChange={setPlatform}
              id="platform-select"
              className="h-8 sm:h-10 text-[11px] sm:text-xs md:text-sm bg-background cursor-pointer"
            />
          </div>

          <div className="grid gap-1">
            <label
              htmlFor="tone-select"
              className="text-[10px] sm:text-xs font-semibold text-muted-foreground"
            >
              Gaya Bicara
            </label>
            <ToneSelect
              value={tone}
              onValueChange={setTone}
              id="tone-select"
              className="h-8 sm:h-10 text-[11px] sm:text-xs md:text-sm bg-background cursor-pointer"
            />
          </div>
        </div>

        <Button
          variant="default"
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="ai-accent w-full h-9 sm:h-10 gap-2 text-xs sm:text-sm font-semibold disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              Prosesing AI...
            </>
          ) : (
            <>
              <IconSparkles className="size-4" />
              Proses Ide AI
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
