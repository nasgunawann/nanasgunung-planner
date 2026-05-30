import React from "react";
import { createPortal } from "react-dom";
import { IconSparkles } from "@tabler/icons-react";
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
};

export default function ActionBar({
  aiActionBar,
  isAiStreaming,
  handleAiAccept,
  handleAiRetry,
  handleAiDiscard,
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
      className="fixed z-[9998] flex items-center gap-1 sm:gap-1.5 bg-card border border-border shadow-xl rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-1 duration-150"
    >
      {/* Command label */}
      <div className="flex items-center gap-1 sm:gap-1.5 mr-0.5 sm:mr-1">
        <IconSparkles className="size-3 ai-accent-text shrink-0" />
        <span className="text-[10px] font-medium text-foreground/80 max-w-[100px] sm:max-w-[180px] truncate">
          {aiActionBar.commandType === "general" && aiActionBar.prompt
            ? `"${aiActionBar.prompt.length > 28 ? aiActionBar.prompt.slice(0, 28) + "…" : aiActionBar.prompt}"`
            : (AI_COMMAND_LABELS[aiActionBar.commandType] ?? "AI Generate")}
        </span>
      </div>

      <span className="w-px h-4 bg-border/60 mx-0.5 sm:mx-1" />

      {/* Accept */}
      <button
        type="button"
        onClick={handleAiAccept}
        title="Simpan hasil AI"
        className="ai-accent flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer shadow-sm"
      >
        <svg viewBox="0 0 16 16" fill="none" className="size-3 shrink-0">
          <path
            d="M3 8l3.5 3.5L13 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline">Simpan</span>
      </button>

      {/* Retry */}
      <button
        type="button"
        onClick={handleAiRetry}
        title="Coba lagi dengan instruksi yang sama"
        className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
      >
        <svg viewBox="0 0 16 16" fill="none" className="size-3 shrink-0">
          <path
            d="M13.5 2.5A6.5 6.5 0 1 1 9 2.07"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M13.5 2.5V6h-3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline">Coba Lagi</span>
      </button>

      {/* Discard */}
      <button
        type="button"
        onClick={handleAiDiscard}
        title="Buang hasil AI"
        className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0 cursor-pointer"
      >
        <svg viewBox="0 0 16 16" fill="none" className="size-3 shrink-0">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <span className="hidden sm:inline">Buang</span>
      </button>
    </div>,
    document.body,
  );
}
