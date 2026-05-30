"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

// ─── Template UI Primitives ───────────────────────────────────────────────────
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import { Toolbar } from "@/components/tiptap-ui-primitive/toolbar";

// ─── Template Node Extensions ─────────────────────────────────────────────────
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// ─── Template Hooks & Utils ───────────────────────────────────────────────────
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// ─── Template Styles ──────────────────────────────────────────────────────────
import "@/components/tiptap-templates/simple/simple-editor.scss";

// ─── Our Custom Modular Components ────────────────────────────────────────────
import {
  DraftMeta,
  EditorCommandItem,
  formatCommands,
  aiCommands,
} from "./editor/editor-commands";
import SelectionBubble from "./editor/selection-bubble";
import ActionBar from "./editor/action-bar";
import SlashMenu from "./editor/slash-menu";
import AiPromptPopup from "./editor/ai-prompt-popup";
import TableBubble from "./editor/table-bubble";
import { BlockReorder } from "./editor/block-reorder";
import DragHandle from "./editor/drag-handle";
import { IconSparkles } from "@tabler/icons-react";
import {
  MainToolbarContent,
  MobileToolbarContent,
} from "@/components/editor/toolbar-content";

// ─── Extracted Extensions ─────────────────────────────────────────────────────
import AiHighlight from "@/components/editor/extensions/ai-highlight";
import Callout from "@/components/editor/extensions/callout";

// ─── Custom AI Hook ───────────────────────────────────────────────────────────
import { useEditorAi } from "@/hooks/use-editor-ai";

// ─── Types ────────────────────────────────────────────────────────────────────
type TipTapEditorProps = {
  content: string;
  onChange: (val: string) => void;
  insertTrigger?: { text: string; time: number } | null;
  snippets?: { id: string; title: string; content: string }[];
  draftMeta?: DraftMeta;
};

// ─── Main TipTap Editor Component ────────────────────────────────────────────
export default function TipTapEditor({
  content,
  onChange,
  insertTrigger,
  snippets = [],
  draftMeta,
}: TipTapEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main",
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Slash Command States ────────────────────────────────────────────────────
  const [isSlashActive, setIsSlashActive] = useState(false);
  const [slashCoords, setSlashCoords] = useState<{
    top: number;
    bottom: number;
    left: number;
  } | null>(null);
  const [slashQuery, setSlashQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ── AI States ───────────────────────────────────────────────────────────────
  const [isAiPromptActive, setIsAiPromptActive] = useState(false);
  const [aiPromptCoords, setAiPromptCoords] = useState<{
    top: number;
    bottom: number;
    left: number;
  } | null>(null);
  const [aiPromptValue, setAiPromptValue] = useState("");
  const [aiPromptPlaceholder, setAiPromptPlaceholder] = useState(
    "Tulis instruksi untuk AI...",
  );
  const [aiCommandType, setAiCommandType] = useState("general");
  const [isBubbleAiActive, setIsBubbleAiActive] = useState(false);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const aiPromptInputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement | null>(null);
  const slashTriggerPosRef = useRef<number | null>(null);
  const escapedTriggerPosRef = useRef<number | null>(null);
  const draggedPosRef = useRef<number | null>(null);
  const isSlashActiveRef = useRef(isSlashActive);
  const selectedIndexRef = useRef(selectedIndex);
  const filteredCountRef = useRef(0);
  const triggerExecuteRef = useRef(() => {});

  useEffect(() => {
    isSlashActiveRef.current = isSlashActive;
  }, [isSlashActive]);
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  // ── Initialize Editor ───────────────────────────────────────────────────────
  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Editor konten. Ketik / untuk melihat perintah tersedia.",
        class: "simple-editor",
      },
      handleClickOn: (
        view: any,
        pos: number,
        node: any,
        nodePos: number,
        event: MouseEvent,
      ) => {
        if (node.type.name === "callout") {
          const target = event.target as HTMLElement;
          if (
            target.classList.contains("callout-emoji") ||
            target.closest?.(".callout-emoji")
          ) {
            event.preventDefault();
            const currentEmoji = node.attrs.emoji || "💡";
            const newEmoji = prompt("Ubah emoji callout:", currentEmoji);
            if (newEmoji !== null) {
              const trimmed = Array.from(newEmoji.trim()).slice(0, 2).join("");
              view.dispatch(
                view.state.tr.setNodeMarkup(nodePos, undefined, {
                  ...node.attrs,
                  emoji: trimmed || "💡",
                }),
              );
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view: any, event: any) => {
        if (draggedPosRef.current !== null) {
          event.preventDefault();
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          if (coordinates) {
            const dropPos = coordinates.pos;
            const fromPos = draggedPosRef.current;
            const node = view.state.doc.nodeAt(fromPos);
            if (node) {
              const nodeSize = node.nodeSize;
              const tr = view.state.tr;
              if (dropPos >= fromPos && dropPos <= fromPos + nodeSize) {
                draggedPosRef.current = null;
                return true;
              }
              let insertPos = dropPos > fromPos ? dropPos - nodeSize : dropPos;
              insertPos = Math.max(0, Math.min(insertPos, tr.doc.content.size));
              tr.delete(fromPos, fromPos + nodeSize);
              tr.insert(insertPos, node);
              view.dispatch(tr);
            }
          }
          draggedPosRef.current = null;
          return true;
        }
        return false;
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
          setSelectedIndex(
            (prev) =>
              (prev - 1 + filteredCountRef.current) % filteredCountRef.current,
          );
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
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: { openOnClick: false, enableClickSelection: true } as any,
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error: any) => console.error("Upload failed:", error),
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      AiHighlight,
      Callout,
      BlockReorder,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      handleTextUpdate(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      handleTextUpdate(editor);
      setIsBubbleAiActive(false);
    },
  });

  // ── Modular AI Custom Hook ──────────────────────────────────────────────────
  const {
    isAiStreaming,
    aiActionBar,
    setAiActionBar,
    handleCancelAi,
    streamAiGenerate,
    handleAiAccept,
    handleAiDiscard,
    handleAiRetry,
    handleAiVariation,
  } = useEditorAi(editor, draftMeta, containerRef);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") setMobileView("main");
  }, [isMobile, mobileView]);

  // ── Slash Command Commands List ─────────────────────────────────────────────
  const snippetCommands = snippets.map((s) => ({
    id: s.id,
    title: s.title,
    desc: `Salin aset: "${s.title}"`,
    icon: IconSparkles,
    content: s.content,
  }));

  // Slash menu hanya tampilkan block-type commands (bukan inline format)
  const blockFormatIds = [
    "h1",
    "h2",
    "h3",
    "bullet",
    "number",
    "todo",
    "quote",
    "callout",
    "divider",
    "code",
    "table",
  ];
  const slashFormatCommands = formatCommands.filter((c) =>
    blockFormatIds.includes(c.id),
  );

  const allItems: EditorCommandItem[] = [
    ...slashFormatCommands.map((item) => ({
      ...item,
      type: "format" as const,
    })),
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

  // ── Slash Command: Detect Trigger ───────────────────────────────────────────
  const handleTextUpdate = (editorInstance: any) => {
    const { view, state } = editorInstance;
    const { selection } = state;
    const { $from } = selection;
    const textBeforeCursor = $from.parent.textBetween(
      0,
      $from.parentOffset,
      " ",
    );
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
      setSlashCoords({
        top: coords.top,
        bottom: coords.bottom,
        left: coords.left,
      });
    } catch {
      setIsSlashActive(false);
    }
  };

  // ── Execute Command ─────────────────────────────────────────────────────────
  const executeCommand = (item: EditorCommandItem) => {
    if (!editor) return;
    if (isSlashActive && slashTriggerPosRef.current !== null) {
      const currentPos = editor.state.selection.from;
      editor.commands.deleteRange({
        from: slashTriggerPosRef.current - 1,
        to: currentPos,
      });
    }
    setIsSlashActive(false);
    if (item.type === "ai") {
      setAiCommandType(item.commandType ?? "general");
      if (item.requiresInput) {
        setAiPromptPlaceholder(
          item.placeholder ?? "Tulis instruksi untuk AI...",
        );
        setIsAiPromptActive(true);
        try {
          const coords = editor.view.coordsAtPos(editor.state.selection.from);
          setAiPromptCoords({
            top: coords.top,
            bottom: coords.bottom,
            left: coords.left,
          });
        } catch {
          setAiPromptCoords({ top: 200, bottom: 200, left: 100 });
        }
        setTimeout(() => aiPromptInputRef.current?.focus(), 50);
      } else {
        streamAiGenerate(item.commandType ?? "general", "");
      }
      return;
    }
    if (item.action) {
      item.action(editor);
    } else if (item.content) {
      editor.chain().focus().insertContent(item.content).run();
    }
  };

  // ── AI Toolbar Button Handler ─────────────────────────────────────────────
  const handleAiToolbarClick = () => {
    if (!editor) return;
    setAiCommandType("general");
    setAiPromptPlaceholder(
      "Contoh: tulis hook pembuka yang menarik perhatian...",
    );
    setIsAiPromptActive(true);
    try {
      const coords = editor.view.coordsAtPos(editor.state.selection.from);
      setAiPromptCoords({
        top: coords.top,
        bottom: coords.bottom,
        left: coords.left,
      });
    } catch {
      setAiPromptCoords({ top: 200, bottom: 200, left: 100 });
    }
    setTimeout(() => aiPromptInputRef.current?.focus(), 50);
  };

  const submitAiPrompt = async () => {
    if (!editor || !aiPromptValue.trim() || isAiStreaming) return;
    setIsAiPromptActive(false);
    await streamAiGenerate(aiCommandType, aiPromptValue.trim());
    setAiPromptValue("");
  };

  const handleSelectionAi = async (commandType: string) => {
    setIsBubbleAiActive(false);
    await streamAiGenerate(commandType, "");
  };

  useEffect(() => {
    triggerExecuteRef.current = () => {
      if (filteredItems[selectedIndexRef.current])
        executeCommand(filteredItems[selectedIndexRef.current]);
    };
  }, [filteredItems]);

  useEffect(() => {
    if (!editor || !aiActionBar) return;
    const handler = () => setAiActionBar(null);
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, aiActionBar, setAiActionBar]);

  useEffect(() => {
    if (!aiActionBar) return;
    const handleScroll = () => setAiActionBar(null);
    const scrollContainer = containerRef.current?.querySelector(
      ".simple-editor-content",
    );
    scrollContainer?.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, [aiActionBar, setAiActionBar]);

  useEffect(() => {
    if (!isSlashActive) return;
    const handleScroll = (event: Event) => {
      const menuEl = document.getElementById("tiptap-slash-menu");
      if (menuEl && menuEl.contains(event.target as HTMLElement)) return;
      setIsSlashActive(false);
    };
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [isSlashActive]);

  useEffect(() => {
    if (!isSlashActive) return;
    const handleClickOutside = (event: MouseEvent) => {
      const menuEl = document.getElementById("tiptap-slash-menu");
      if (menuEl && !menuEl.contains(event.target as HTMLElement))
        setIsSlashActive(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSlashActive]);

  useEffect(() => {
    if (isSlashActive && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [selectedIndex, isSlashActive]);

  useEffect(() => {
    if (!insertTrigger || !editor) return;
    editor.chain().focus().insertContent(insertTrigger.text).run();
  }, [insertTrigger, editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== content)
      editor.commands.setContent(content, { emitUpdate: false });
  }, [content, editor]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs font-mono text-muted-foreground/60">
        Memuat editor...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-[9990] bg-background flex flex-col p-4 md:p-8 animate-in fade-in zoom-in-98 duration-200 editor-focus-mode"
          : "relative flex-1 flex flex-col min-h-0 overflow-hidden"
      }
    >
      <EditorContext.Provider value={{ editor }}>
        {/* ── Template Toolbar ───────────────────────────────────────────── */}
        <Toolbar
          ref={toolbarRef}
          style={
            isMobile ? { bottom: `calc(100% - ${height - rect.y}px)` } : {}
          }
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              onAiClick={handleAiToolbarClick}
              isMobile={isMobile}
              isFullscreen={isFullscreen}
              onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        {/* ── Editor Content ─────────────────────────────────────────────── */}
        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content flex-1 overflow-y-auto min-h-0 pb-32"
        />

        {/* ── AI Streaming Indicator ────────────────────────────────────── */}
        {isAiStreaming && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] flex justify-center pointer-events-none">
            <div className="inline-flex items-center gap-2.5 bg-card/90 border border-primary/30 shadow-lg rounded-full pl-3.5 pr-2 py-1.5 backdrop-blur-sm pointer-events-auto">
              <span className="flex gap-0.5">
                <span
                  className="w-1 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "120ms" }}
                />
                <span
                  className="w-1 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "240ms" }}
                />
              </span>
              <span className="text-[10px] text-primary font-medium">
                AI sedang menulis...
              </span>
              <button
                type="button"
                onClick={handleCancelAi}
                className="flex items-center justify-center bg-destructive/15 hover:bg-destructive/25 text-destructive rounded-full px-2 py-0.5 text-[9px] font-bold transition-all shrink-0 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* ── Modular AI & Custom Components ───────────────────────────── */}
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
          handleAiVariation={handleAiVariation}
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

        <TableBubble editor={editor} isAiStreaming={isAiStreaming} />

        <DragHandle editor={editor} draggedPosRef={draggedPosRef} />
      </EditorContext.Provider>
    </div>
  );
}
