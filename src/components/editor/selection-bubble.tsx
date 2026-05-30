import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconHighlight,
  IconSparkles,
  IconScissors,
  IconBriefcase,
  IconMoodSmile,
  IconBulb,
} from "@tabler/icons-react";

const BubbleMenuAny = BubbleMenu as any;

type SelectionBubbleProps = {
  editor: Editor;
  isAiStreaming: boolean;
  isBubbleAiActive: boolean;
  setIsBubbleAiActive: (active: boolean) => void;
  handleSelectionAi: (
    commandType: string,
    requiresInput?: boolean,
    customPromptText?: string
  ) => void;
};

export default function SelectionBubble({
  editor,
  isAiStreaming,
  isBubbleAiActive,
  setIsBubbleAiActive,
  handleSelectionAi,
}: SelectionBubbleProps) {
  const [localPrompt, setLocalPrompt] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPrompt.trim()) return;
    handleSelectionAi("custom-selection", false, localPrompt.trim());
    setLocalPrompt("");
  };

  return (
    <BubbleMenuAny
      editor={editor}
      tippyOptions={{
        appendTo: () => document.body,
        zIndex: 9999,
      }}
      shouldShow={({
        editor: ed,
        from,
        to,
      }: {
        editor: any;
        from: number;
        to: number;
      }) => {
        // Only show bubble menu when there is an active selection (not a single cursor)
        // and the editor is focused, and we are not currently streaming
        return from !== to && ed.isFocused && !isAiStreaming;
      }}
    >
      <div className="bg-card border border-border shadow-2xl rounded-xl p-1 backdrop-blur-md flex flex-col z-[9997] transition-all overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {!isBubbleAiActive ? (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`size-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
                editor.isActive("bold")
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Bold (Ctrl+B)"
            >
              <IconBold className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`size-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
                editor.isActive("italic")
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Italic (Ctrl+I)"
            >
              <IconItalic className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`size-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
                editor.isActive("underline")
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Underline (Ctrl+U)"
            >
              <IconUnderline className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`size-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
                editor.isActive("strike")
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Strikethrough"
            >
              <IconStrikethrough className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`size-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
                editor.isActive("highlight")
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Highlight"
            >
              <IconHighlight className="size-3.5" />
            </button>

            <span className="w-px h-4 bg-border/60 mx-1" />

            <button
              type="button"
              onClick={() => setIsBubbleAiActive(true)}
              className="ai-accent h-7 flex items-center gap-1 px-2 rounded-lg font-semibold text-[10px] transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <IconSparkles className="size-3.5 animate-pulse" />
              Tanya AI
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 p-1 max-w-[550px] overflow-x-auto scrollbar-none animate-in slide-in-from-right-1 duration-150">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setIsBubbleAiActive(false)}
              className="size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
              title="Kembali ke Format"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <span className="w-px h-4 bg-border/60 mx-0.5 shrink-0" />

            {/* Inline Custom Prompt Input */}
            <form
              onSubmit={handleCustomSubmit}
              className="flex items-center gap-1 min-w-[160px] sm:min-w-[200px] shrink-0"
            >
              <input
                type="text"
                placeholder="Tanya AI atau perintah kustom..."
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                className="w-full h-7 bg-muted/70 hover:bg-muted/90 focus:bg-background border border-border/80 focus:border-primary/50 rounded-lg px-2.5 text-[9px] sm:text-[10px] font-medium placeholder:text-muted-foreground/60 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!localPrompt.trim()}
                className="h-7 px-2 bg-primary text-white rounded-lg text-[9px] font-bold shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors shrink-0"
              >
                Kirim
              </button>
            </form>

            <span className="w-px h-4 bg-border/60 mx-0.5 shrink-0" />

            {/* AI Presets with Smooth Slide-Expanding Hover Labels */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Perbaiki */}
              <button
                type="button"
                onClick={() => handleSelectionAi("improve-selection")}
                className="group h-7 flex items-center gap-0 hover:gap-1 px-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all shrink-0 cursor-pointer"
                title="Perbaiki Tulisan"
              >
                <IconSparkles className="size-3.5 text-primary shrink-0" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-[70px] transition-all duration-300 ease-out text-[9px] font-bold tracking-tight whitespace-nowrap">
                  Perbaiki
                </span>
              </button>

              {/* Persingkat */}
              <button
                type="button"
                onClick={() => handleSelectionAi("shorten-selection")}
                className="group h-7 flex items-center gap-0 hover:gap-1 px-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all shrink-0 cursor-pointer"
                title="Persingkat"
              >
                <IconScissors className="size-3.5 text-emerald-500 shrink-0" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-[75px] transition-all duration-300 ease-out text-[9px] font-bold tracking-tight whitespace-nowrap">
                  Persingkat
                </span>
              </button>

              {/* Formal */}
              <button
                type="button"
                onClick={() => handleSelectionAi("formalize-selection")}
                className="group h-7 flex items-center gap-0 hover:gap-1 px-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all shrink-0 cursor-pointer"
                title="Jadikan Formal"
              >
                <IconBriefcase className="size-3.5 text-sky-500 shrink-0" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-[65px] transition-all duration-300 ease-out text-[9px] font-bold tracking-tight whitespace-nowrap">
                  Formal
                </span>
              </button>

              {/* Santai */}
              <button
                type="button"
                onClick={() => handleSelectionAi("casualize-selection")}
                className="group h-7 flex items-center gap-0 hover:gap-1 px-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all shrink-0 cursor-pointer"
                title="Jadikan Santai"
              >
                <IconMoodSmile className="size-3.5 text-amber-500 shrink-0" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-[65px] transition-all duration-300 ease-out text-[9px] font-bold tracking-tight whitespace-nowrap">
                  Santai
                </span>
              </button>

              {/* Lanjutkan */}
              <button
                type="button"
                onClick={() => handleSelectionAi("continue-selection")}
                className="group h-7 flex items-center gap-0 hover:gap-1 px-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all shrink-0 cursor-pointer"
                title="Lanjutkan Tulisan"
              >
                <IconBulb className="size-3.5 text-orange-500 shrink-0" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-[75px] transition-all duration-300 ease-out text-[9px] font-bold tracking-tight whitespace-nowrap">
                  Lanjutkan
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </BubbleMenuAny>
  );
}
