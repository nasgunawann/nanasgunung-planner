import React from "react";
import { createPortal } from "react-dom";
import { IconSparkles, IconCrown, IconBolt, IconLeaf } from "@tabler/icons-react";
import { AI_COMMAND_LABELS } from "./editor-commands";

type ActionBarProps = {
  aiActionBar: {
    startPos: number;
    endPos: number;
    commandType: string;
    prompt: string;
    coords: { top: number; left: number };
    originalText?: string;
  } | null;
  isAiStreaming: boolean;
  handleAiAccept: () => void;
  handleAiRetry: () => void;
  handleAiDiscard: () => void;
  handleAiVariation?: (style: "professional" | "creative" | "concise") => void;
};

export default function ActionBar({
  aiActionBar,
  isAiStreaming,
  handleAiAccept,
  handleAiRetry,
  handleAiDiscard,
  handleAiVariation,
}: ActionBarProps) {
  if (!aiActionBar || isAiStreaming || typeof document === "undefined")
    return null;

  return createPortal(
    <div
      id="tiptap-ai-action-bar"
      style={{
        position: "fixed",
        top: aiActionBar.coords.top,
        left: aiActionBar.coords.left,
      }}
      className="fixed z-[9998] flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-card border border-border shadow-2xl rounded-2xl p-2 md:p-2.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 w-[280px] md:w-auto"
    >
      {/* Variations Selector Carousel / Row */}
      {handleAiVariation && (
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
          <button
            type="button"
            onClick={() => handleAiVariation("professional")}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
            title="Gaya Formal, Berbobot & Elegan"
          >
            <IconCrown className="size-2.5 text-amber-500" />
            <span>Profesional</span>
          </button>
          <button
            type="button"
            onClick={() => handleAiVariation("creative")}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
            title="Gaya Kreatif, Viral & Storytelling"
          >
            <IconBolt className="size-2.5 text-purple-500" />
            <span>Kreatif</span>
          </button>
          <button
            type="button"
            onClick={() => handleAiVariation("concise")}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
            title="Gaya Singkat, Padat & Efisien"
          >
            <IconLeaf className="size-2.5 text-emerald-500" />
            <span>Ringkas</span>
          </button>
        </div>
      )}

      {handleAiVariation && <span className="hidden md:block w-px h-5 bg-border/60 mx-0.5" />}

      {/* Main Actions Menu */}
      <div className="flex items-center gap-1 md:gap-1.5 justify-between">
        {/* Command label */}
        <div className="flex items-center gap-1 sm:gap-1.5 mr-0.5 sm:mr-1 max-w-[80px] md:max-w-[120px]">
          <IconSparkles className="size-3 ai-accent-text shrink-0" />
          <span className="text-[9px] md:text-[10px] font-semibold text-foreground/80 truncate">
            {aiActionBar.commandType === "general" && aiActionBar.prompt
              ? `"${aiActionBar.prompt.length > 20 ? aiActionBar.prompt.slice(0, 20) + "…" : aiActionBar.prompt}"`
              : (AI_COMMAND_LABELS[aiActionBar.commandType] ?? "AI Hasil")}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Accept */}
          <button
            type="button"
            onClick={handleAiAccept}
            title="Simpan hasil AI"
            className="ai-accent flex items-center gap-1 px-2 py-1 md:px-2.5 md:py-1 rounded-lg text-[9px] md:text-[10px] font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-2.5 md:size-3 shrink-0">
              <path
                d="M3 8l3.5 3.5L13 5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Simpan</span>
          </button>

          {/* Retry */}
          <button
            type="button"
            onClick={handleAiRetry}
            title="Coba lagi dengan instruksi yang sama"
            className="flex items-center gap-1 px-2 py-1 md:px-2 md:py-1 rounded-lg text-[9px] md:text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-2.5 md:size-3 shrink-0">
              <path
                d="M13.5 2.5A6.5 6.5 0 1 1 9 2.07"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M13.5 2.5V6h-3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Discard */}
          <button
            type="button"
            onClick={handleAiDiscard}
            title="Buang hasil AI"
            className="flex items-center gap-1 px-1.5 py-1 md:px-2 md:py-1 rounded-lg text-[9px] md:text-[10px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0 cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-2.5 md:size-3 shrink-0">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
