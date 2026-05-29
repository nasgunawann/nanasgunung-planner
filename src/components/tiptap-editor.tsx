"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import React, { useEffect, useState, useRef } from "react";
import { Mark, mergeAttributes } from "@tiptap/core";
import { IconSparkles } from "@tabler/icons-react";

// Import Modular Components & Configurations
import {
  DraftMeta,
  EditorCommandItem,
  formatCommands,
  aiCommands,
} from "./editor/editor-commands";
import Toolbar from "./editor/toolbar";
import SelectionBubble from "./editor/selection-bubble";
import ActionBar from "./editor/action-bar";
import SlashMenu from "./editor/slash-menu";
import AiPromptPopup from "./editor/ai-prompt-popup";
import TableBubble from "./editor/table-bubble";

type TipTapEditorProps = {
  content: string;
  onChange: (val: string) => void;
  insertTrigger?: { text: string; time: number } | null;
  snippets?: { id: string; title: string; content: string }[];
  draftMeta?: DraftMeta;
};

// ─── Custom AI Highlight Mark Extension ─────────────────────────────
const AiHighlight = Mark.create({
  name: "aiHighlight",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "ai-processing px-1 rounded",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-ai-highlight]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({ "data-ai-highlight": "" }, this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});

export default function TipTapEditor({
  content,
  onChange,
  insertTrigger,
  snippets = [],
  draftMeta,
}: TipTapEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Slash Command Menu States
  const [isSlashActive, setIsSlashActive] = useState(false);
  const [slashCoords, setSlashCoords] = useState<{
    top: number;
    bottom: number;
    left: number;
  } | null>(null);
  const [slashQuery, setSlashQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // AI Inline Prompt States
  const [isAiPromptActive, setIsAiPromptActive] = useState(false);
  const [aiPromptCoords, setAiPromptCoords] = useState<{ top: number; bottom: number; left: number } | null>(null);
  const [aiPromptValue, setAiPromptValue] = useState("");
  const [aiPromptPlaceholder, setAiPromptPlaceholder] = useState("Tulis instruksi untuk AI...");
  const [aiCommandType, setAiCommandType] = useState("general");
  const [isAiStreaming, setIsAiStreaming] = useState(false);

  // Bubble Selection Menu State
  const [isBubbleAiActive, setIsBubbleAiActive] = useState(false);

  // Post-generation Action Bar State
  const [aiActionBar, setAiActionBar] = useState<{
    startPos: number;
    endPos: number;
    commandType: string;
    prompt: string;
    coords: { top: number; left: number };
    originalText?: string;
  } | null>(null);

  const aiPromptInputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);
  const slashTriggerPosRef = useRef<number | null>(null);
  const escapedTriggerPosRef = useRef<number | null>(null);

  // Setup refs to bypass stale React closures in useEditor handleKeyDown hook
  const isSlashActiveRef = useRef(isSlashActive);
  const selectedIndexRef = useRef(selectedIndex);
  const filteredCountRef = useRef(0);
  const triggerExecuteRef = useRef(() => {});

  useEffect(() => { isSlashActiveRef.current = isSlashActive; }, [isSlashActive]);
  useEffect(() => { selectedIndexRef.current = selectedIndex; }, [selectedIndex]);

  // Initialize TipTap Editor with all extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      AiHighlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline cursor-pointer" } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      handleTextUpdate(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      handleTextUpdate(editor);
      setIsBubbleAiActive(false);
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[420px] text-xs text-foreground/90 leading-relaxed p-4 font-sans ProseMirror",
      },
      handleKeyDown: (view, event) => {
        if (!isSlashActiveRef.current) return false;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCountRef.current);
          return true;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCountRef.current) % filteredCountRef.current);
          return true;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          triggerExecuteRef.current();
          return true;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          escapedTriggerPosRef.current = slashTriggerPosRef.current;
          setIsSlashActive(false);
          return true;
        }
        return false;
      },
    },
  });

  // Map snippets
  const snippetCommands = snippets.map((s) => ({
    id: s.id,
    title: s.title,
    desc: `Salin aset: "${s.title}"`,
    icon: IconSparkles,
    content: s.content,
  }));

  const allItems: EditorCommandItem[] = [
    ...formatCommands.map((item) => ({ ...item, type: "format" as const })),
    ...snippetCommands.map((item) => ({ ...item, type: "snippet" as const })),
    ...aiCommands,
  ];

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(slashQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(slashQuery.toLowerCase()),
  );

  useEffect(() => {
    filteredCountRef.current = filteredItems.length;
    setSelectedIndex((prev) => (prev >= filteredItems.length ? 0 : prev));
  }, [filteredItems.length]);

  const handleTextUpdate = (editorInstance: any) => {
    const { view, state } = editorInstance;
    const { selection } = state;
    const { $from } = selection;

    const textBeforeCursor = $from.parent.textBetween(0, $from.parentOffset, " ");
    const match = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9\-+_]*)$/);
    if (!match) {
      slashTriggerPosRef.current = null;
      escapedTriggerPosRef.current = null;
      setIsSlashActive(false);
      setSlashQuery("");
      return;
    }

    const matchIndex = match.index ?? 0;
    const slashParentOffset = matchIndex + (match[0].startsWith(" ") ? 1 : 0);
    const slashDocPos = $from.start() + slashParentOffset;
    slashTriggerPosRef.current = slashDocPos;

    if (escapedTriggerPosRef.current === slashDocPos) {
      setIsSlashActive(false);
      setSlashQuery("");
      return;
    }

    setIsSlashActive(true);
    setSlashQuery(match[1]);

    try {
      const coords = view.coordsAtPos(slashDocPos);
      setSlashCoords({ top: coords.top, bottom: coords.bottom, left: coords.left });
    } catch (e) {
      setIsSlashActive(false);
    }
  };

  const executeCommand = (item: EditorCommandItem) => {
    if (!editor) return;

    // Erase the slash trigger text if slash menu was active
    if (isSlashActive && slashTriggerPosRef.current !== null) {
      const currentPos = editor.state.selection.from;
      editor.commands.deleteRange({ from: slashTriggerPosRef.current - 1, to: currentPos });
    }

    setIsSlashActive(false);

    // AI commands routing
    if (item.type === "ai") {
      setAiCommandType(item.commandType ?? "general");
      if (item.requiresInput) {
        setAiPromptPlaceholder(item.placeholder ?? "Tulis instruksi untuk AI...");
        setIsAiPromptActive(true);
        try {
          const coords = editor.view.coordsAtPos(editor.state.selection.from);
          setAiPromptCoords({ top: coords.top, bottom: coords.bottom, left: coords.left });
        } catch (e) {
          setAiPromptCoords({ top: 200, bottom: 200, left: 100 });
        }
        setTimeout(() => aiPromptInputRef.current?.focus(), 50);
      } else {
        streamAiGenerate(item.commandType ?? "general", "");
      }
      return;
    }

    // Formatting / content commands execution
    if (item.action) {
      item.action(editor);
    } else if (item.content) {
      editor.chain().focus().insertContent(item.content).run();
    }
  };

  // ─── Streaming AI generate ────────────────────────────────────────────────────
  const streamAiGenerate = async (commandType: string, userPrompt: string, customContext?: string) => {
    if (!editor || isAiStreaming) return;
    setIsAiStreaming(true);
    setAiActionBar(null);

    const currentContent = editor.getHTML();

    let startPos = editor.state.selection.from;
    let endPos = editor.state.selection.to;

    const isSelection = commandType.endsWith("-selection");
    let contextToUse = customContext || currentContent;
    let originalText = customContext || "";

    if (isSelection) {
      if (!customContext) {
        contextToUse = editor.state.doc.textBetween(startPos, endPos, " ");
        originalText = contextToUse;
        editor.chain().focus().setMark("aiHighlight").run();
      }
    }

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          context: contextToUse,
          commandType,
          draftMeta,
        }),
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      editor.commands.focus();

      if (isSelection) {
        editor.chain().focus().deleteSelection().run();
        startPos = editor.state.selection.from;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          editor.commands.insertContent(chunk);
        }
      }

      const finalEndPos = editor.state.selection.from;
      try {
        const coords = editor.view.coordsAtPos(finalEndPos);
        let barTop = coords.bottom + 8;
        const scrollContainer = containerRef.current?.querySelector(".overflow-y-auto");
        if (scrollContainer) {
          const minBottomSpace = 80;
          const overflow = (coords.bottom + minBottomSpace) - window.innerHeight;
          if (overflow > 0) {
            scrollContainer.scrollTop += overflow;
            barTop -= overflow;
          }
        }

        let barLeft = coords.left;
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect && typeof window !== "undefined") {
          const isMobile = window.innerWidth < 640;
          const barWidth = isMobile ? 250 : 450;
          const padding = 16;
          const minLeft = containerRect.left + padding;
          const maxLeft = containerRect.right - barWidth - padding;
          barLeft = Math.max(minLeft, Math.min(coords.left, Math.max(minLeft, maxLeft)));
        } else if (typeof window !== "undefined") {
          barLeft = Math.max(12, Math.min(coords.left, window.innerWidth - 360));
        }

        setAiActionBar({
          startPos,
          endPos: finalEndPos,
          commandType,
          prompt: userPrompt,
          coords: { top: barTop, left: barLeft },
          originalText: isSelection ? originalText : undefined,
        });
      } catch (e) {
        setAiActionBar({
          startPos,
          endPos: finalEndPos,
          commandType,
          prompt: userPrompt,
          coords: { top: 200, left: 100 },
          originalText: isSelection ? originalText : undefined,
        });
      }
    } catch (e) {
      console.error("AI stream error", e);
    } finally {
      setIsAiStreaming(false);
    }
  };

  const submitAiPrompt = async () => {
    if (!editor || !aiPromptValue.trim() || isAiStreaming) return;
    setIsAiPromptActive(false);
    await streamAiGenerate(aiCommandType, aiPromptValue.trim());
    setAiPromptValue("");
  };

  // ─── Action Bar Handlers ──────────────────────────────────────────────────────
  const handleAiAccept = () => {
    setAiActionBar(null);
    editor?.commands.focus();
  };

  const handleAiDiscard = () => {
    if (!aiActionBar || !editor) return;
    const { startPos, endPos, originalText } = aiActionBar;
    if (originalText) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: startPos, to: endPos })
        .insertContentAt(startPos, originalText)
        .run();
    } else {
      editor.chain().focus().deleteRange({ from: startPos, to: endPos }).run();
    }
    setAiActionBar(null);
  };

  const handleSelectionAi = async (commandType: string) => {
    setIsBubbleAiActive(false);
    await streamAiGenerate(commandType, "");
  };

  const handleAiRetry = async () => {
    if (!aiActionBar || !editor) return;
    const { commandType, prompt, startPos, endPos, originalText } = aiActionBar;
    
    setAiActionBar(null);

    if (originalText) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: startPos, to: endPos })
        .insertContentAt(startPos, originalText)
        .setTextSelection({ from: startPos, to: startPos + originalText.length })
        .run();
      await streamAiGenerate(commandType, prompt);
    } else {
      editor.chain().focus().deleteRange({ from: startPos, to: endPos }).run();
      await streamAiGenerate(commandType, prompt);
    }
  };

  useEffect(() => {
    triggerExecuteRef.current = () => {
      if (filteredItems[selectedIndexRef.current]) {
        executeCommand(filteredItems[selectedIndexRef.current]);
      }
    };
  }, [filteredItems]);

  // Dismiss action bar when typing
  useEffect(() => {
    if (!editor || !aiActionBar) return;
    const handler = () => setAiActionBar(null);
    editor.on("update", handler);
    return () => { editor.off("update", handler); };
  }, [editor, aiActionBar]);

  // Dismiss action bar on scroll
  useEffect(() => {
    if (!aiActionBar) return;
    const handleScroll = () => setAiActionBar(null);
    const scrollContainer = containerRef.current?.querySelector(".overflow-y-auto");
    scrollContainer?.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, [aiActionBar]);

  // Close slash menu on scroll
  useEffect(() => {
    if (!isSlashActive) return;
    const handleScroll = (event: Event) => {
      const menuEl = document.getElementById("tiptap-slash-menu");
      if (menuEl && menuEl.contains(event.target as Node)) return;
      setIsSlashActive(false);
    };
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [isSlashActive]);

  // Close slash menu on outside click
  useEffect(() => {
    if (!isSlashActive) return;
    const handleClickOutside = (event: MouseEvent) => {
      const menuEl = document.getElementById("tiptap-slash-menu");
      if (menuEl && !menuEl.contains(event.target as Node)) setIsSlashActive(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSlashActive]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (isSlashActive && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [selectedIndex, isSlashActive]);

  // Listen for text insertion triggers
  useEffect(() => {
    if (!insertTrigger || !editor) return;
    editor.chain().focus().insertContent(insertTrigger.text).run();
  }, [insertTrigger]);

  // Sync external content changes
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs font-mono text-muted-foreground/60">
        Initializing TipTap Engine...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
      {/* ── Formatting Toolbar Component ───────────────────────────── */}
      <Toolbar editor={editor} />

      {/* ── Editor Content Viewport ─────────────────────────────────── */}
      <div className="flex-1 p-4 pb-32 bg-background/30 overflow-y-auto min-h-0 relative">
        <EditorContent editor={editor} />

        {/* AI streaming indicator */}
        {isAiStreaming && (
          <div className="sticky bottom-2 left-0 right-0 flex justify-center pointer-events-none">
            <div className="inline-flex items-center gap-2 bg-card/90 border border-primary/30 shadow-lg rounded-full px-3 py-1.5 backdrop-blur-sm">
              <span className="flex gap-0.5">
                <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
                <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
              </span>
              <span className="text-[10px] text-primary font-medium">AI sedang menulis...</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Modular Portal Components ───────────────────────────────── */}
      <AiPromptPopup
        isAiPromptActive={isAiPromptActive}
        aiPromptCoords={aiPromptCoords}
        aiPromptInputRef={aiPromptInputRef}
        aiPromptValue={aiPromptValue}
        setAiPromptValue={setAiPromptValue}
        submitAiPrompt={submitAiPrompt}
        setIsAiPromptActive={setIsAiPromptActive}
        aiPromptPlaceholder={aiPromptPlaceholder}
        draftMeta={draftMeta}
        isAiStreaming={isAiStreaming}
      />

      <ActionBar
        aiActionBar={aiActionBar}
        isAiStreaming={isAiStreaming}
        handleAiAccept={handleAiAccept}
        handleAiRetry={handleAiRetry}
        handleAiDiscard={handleAiDiscard}
      />

      <SlashMenu
        isSlashActive={isSlashActive}
        slashCoords={slashCoords}
        filteredItems={filteredItems}
        selectedIndex={selectedIndex}
        selectedItemRef={selectedItemRef}
        executeCommand={executeCommand}
      />

      <SelectionBubble
        editor={editor}
        isAiStreaming={isAiStreaming}
        isBubbleAiActive={isBubbleAiActive}
        setIsBubbleAiActive={setIsBubbleAiActive}
        handleSelectionAi={handleSelectionAi}
      />

      <TableBubble
        editor={editor}
        isAiStreaming={isAiStreaming}
      />
    </div>
  );
}
