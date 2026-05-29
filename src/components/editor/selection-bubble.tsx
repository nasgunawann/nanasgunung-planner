import React from "react";
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
  handleSelectionAi: (commandType: string) => void;
};

export default function SelectionBubble({
  editor,
  isAiStreaming,
  isBubbleAiActive,
  setIsBubbleAiActive,
  handleSelectionAi,
}: SelectionBubbleProps) {
  return (
    <BubbleMenuAny
      editor={editor}
      tippyOptions={{
        appendTo: () => document.body,
        zIndex: 9999,
      }}
      shouldShow={({ editor: ed, from, to }: { editor: any; from: number; to: number }) => {
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
              className="h-7 flex items-center gap-1 px-2 rounded bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-[10px] transition-all active:scale-95 cursor-pointer"
            >
              <IconSparkles className="size-3.5" />
              Tanya AI
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 p-0.5 max-w-[420px] overflow-x-auto scrollbar-none animate-in slide-in-from-right-1 duration-150">
            <button
              type="button"
              onClick={() => setIsBubbleAiActive(false)}
              className="size-7 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
              title="Kembali ke Format"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <span className="w-px h-4 bg-border/60 mx-0.5 shrink-0" />

            <button
              type="button"
              onClick={() => handleSelectionAi("improve-selection")}
              className="h-7 flex items-center gap-1 px-2 rounded text-[10px] font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors shrink-0 cursor-pointer"
            >
              <IconSparkles className="size-3 text-primary shrink-0" />
              Perbaiki
            </button>
            <button
              type="button"
              onClick={() => handleSelectionAi("shorten-selection")}
              className="h-7 flex items-center gap-1 px-2 rounded text-[10px] font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors shrink-0 cursor-pointer"
            >
              <IconScissors className="size-3 text-primary shrink-0" />
              Persingkat
            </button>
            <button
              type="button"
              onClick={() => handleSelectionAi("formalize-selection")}
              className="h-7 flex items-center gap-1 px-2 rounded text-[10px] font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors shrink-0 cursor-pointer"
            >
              <IconBriefcase className="size-3 text-primary shrink-0" />
              Formal
            </button>
            <button
              type="button"
              onClick={() => handleSelectionAi("casualize-selection")}
              className="h-7 flex items-center gap-1 px-2 rounded text-[10px] font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors shrink-0 cursor-pointer"
            >
              <IconMoodSmile className="size-3 text-primary shrink-0" />
              Santai
            </button>
            <button
              type="button"
              onClick={() => handleSelectionAi("continue-selection")}
              className="h-7 flex items-center gap-1 px-2 rounded text-[10px] font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors shrink-0 cursor-pointer"
            >
              <IconBulb className="size-3 text-primary shrink-0" />
              Lanjutkan
            </button>
          </div>
        )}
      </div>
    </BubbleMenuAny>
  );
}
