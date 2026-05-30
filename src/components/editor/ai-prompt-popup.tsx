import React from "react";
import { createPortal } from "react-dom";
import { IconSparkles } from "@tabler/icons-react";
import { DraftMeta } from "./editor-commands";

type AiPromptPopupProps = {
  isAiPromptActive: boolean;
  aiPromptCoords: { top: number; bottom: number; left: number } | null;
  aiPromptInputRef: React.RefObject<HTMLInputElement | null>;
  aiPromptValue: string;
  setAiPromptValue: (val: string) => void;
  submitAiPrompt: () => void;
  setIsAiPromptActive: (active: boolean) => void;
  aiPromptPlaceholder: string;
  draftMeta?: DraftMeta;
  isAiStreaming: boolean;
};

export default function AiPromptPopup({
  isAiPromptActive,
  aiPromptCoords,
  aiPromptInputRef,
  aiPromptValue,
  setAiPromptValue,
  submitAiPrompt,
  setIsAiPromptActive,
  aiPromptPlaceholder,
  draftMeta,
  isAiStreaming,
}: AiPromptPopupProps) {
  if (!isAiPromptActive || !aiPromptCoords || typeof document === "undefined")
    return null;

  return createPortal(
    <div
      id="tiptap-ai-prompt"
      style={{
        position: "fixed",
        top:
          typeof window !== "undefined" &&
          aiPromptCoords.bottom + 160 > window.innerHeight
            ? aiPromptCoords.top - 164
            : aiPromptCoords.bottom + 6,
        left:
          typeof window !== "undefined"
            ? Math.max(
                12,
                Math.min(aiPromptCoords.left, window.innerWidth - 400),
              )
            : aiPromptCoords.left,
      }}
      className="fixed z-[9999] w-96 ai-accent-surface rounded-xl p-3 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <IconSparkles className="size-3.5 ai-accent-text shrink-0" />
        <span className="text-[10px] font-semibold ai-accent-text uppercase tracking-wider">
          AI Generate
        </span>
        {draftMeta?.platform && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full ai-accent-chip font-medium">
            {draftMeta.platform}
          </span>
        )}
        {draftMeta?.category && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
            {draftMeta.category}
          </span>
        )}
        <span className="text-[9px] text-muted-foreground ml-auto">
          Enter · Esc batal
        </span>
      </div>
      {draftMeta?.title && (
        <div className="text-[9px] text-muted-foreground/70 mb-2 px-0.5">
          Topik:{" "}
          <span className="text-foreground/80 font-medium">
            {draftMeta.title}
          </span>
        </div>
      )}
      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          ref={aiPromptInputRef}
          type="text"
          value={aiPromptValue}
          onChange={(e) => setAiPromptValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitAiPrompt();
            }
            if (e.key === "Escape") {
              setIsAiPromptActive(false);
              setAiPromptValue("");
            }
          }}
          placeholder={aiPromptPlaceholder}
          disabled={isAiStreaming}
          className="flex-1 bg-muted/60 border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-60 transition-all"
        />
        <button
          type="button"
          onClick={submitAiPrompt}
          disabled={!aiPromptValue.trim() || isAiStreaming}
          className="ai-accent shrink-0 h-8 w-8 flex items-center justify-center rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
        >
          <IconSparkles className="size-3.5" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
