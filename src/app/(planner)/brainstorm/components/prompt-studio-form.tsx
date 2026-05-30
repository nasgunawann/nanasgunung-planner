"use client";

import React from "react";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";
import { useDrafts } from "@/lib/drafts";

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
  const { platforms, tones, addCustomPlatform, addCustomTone } = useDrafts();

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "_custom_") {
      const name = prompt("Masukkan nama platform baru:");
      if (name && name.trim()) {
        const formatted = name.trim();
        addCustomPlatform(formatted);
        setPlatform(formatted);
      }
    } else {
      setPlatform(val);
    }
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "_custom_") {
      const name = prompt("Masukkan nama gaya bicara baru:");
      if (name && name.trim()) {
        const formatted = name.trim();
        addCustomTone(formatted);
        setTone(formatted);
      }
    } else {
      setTone(val);
    }
  };

  return (
    <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm space-y-4">
      <h3 className="font-heading text-base font-bold flex items-center gap-2">
        <IconSparkles className="size-4 text-primary" />
        AI Prompt Studio
      </h3>

      <form onSubmit={onGenerate} className="grid gap-4">
        <div className="grid gap-1">
          <label
            htmlFor="topic-input"
            className="text-xs font-semibold text-muted-foreground"
          >
            Masukkan ide atau topik kasar di sini
          </label>
          <textarea
            id="topic-input"
            rows={4}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ketemu cafe murah buat nugas... "
            className="rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary/50 resize-none"
            required
          />
        </div>

        <div className="grid gap-1">
          <label
            htmlFor="platform-select"
            className="text-xs font-semibold text-muted-foreground"
          >
            Platform Sosial
          </label>
          <select
            id="platform-select"
            value={platform}
            onChange={handlePlatformChange}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50 cursor-pointer"
          >
            {platforms.map((plat) => (
              <option key={plat} value={plat}>{plat}</option>
            ))}
            <option value="_custom_" className="text-primary font-bold">
              + Platform Baru...
            </option>
          </select>
        </div>

        <div className="grid gap-1">
          <label
            htmlFor="tone-select"
            className="text-xs font-semibold text-muted-foreground"
          >
            Gaya Bicara
          </label>
          <select
            id="tone-select"
            value={tone}
            onChange={handleToneChange}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50 cursor-pointer"
          >
            {tones.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            <option value="_custom_" className="text-primary font-bold">
              + Gaya Bicara Baru...
            </option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-md shadow-purple-500/10"
        >
          {isGenerating ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              Sedang memproses, harap tunggu...
            </>
          ) : (
            <>
              <IconSparkles className="size-4" />
              Proses ide menggunakan AI
            </>
          )}
        </button>
      </form>
    </div>
  );
}
