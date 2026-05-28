"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  IconBold,
  IconItalic,
  IconH1,
  IconH2,
  IconList,
  IconListNumbers,
  IconQuote,
  IconCode,
  IconSeparatorHorizontal,
  IconStrikethrough,
  IconSparkles,
} from "@tabler/icons-react";

type TipTapEditorProps = {
  content: string;
  onChange: (val: string) => void;
  insertTrigger?: { text: string; time: number } | null;
  snippets?: { id: string; title: string; content: string }[];
};

export default function TipTapEditor({
  content,
  onChange,
  insertTrigger,
  snippets = [],
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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiPromptInputRef = useRef<HTMLInputElement>(null);

  const selectedItemRef = useRef<HTMLButtonElement>(null);
  const slashTriggerPosRef = useRef<number | null>(null);
  const escapedTriggerPosRef = useRef<number | null>(null);

  // Setup refs to bypass stale React closures in useEditor handleKeyDown hook
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

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // Pass computed HTML to debounced autosave
      handleTextUpdate(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      handleTextUpdate(editor);
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
  });

  // Formatting blocks list
  const formatCommands = [
    {
      id: "h1",
      title: "Heading 1",
      desc: "Judul ukuran besar (H1)",
      icon: IconH1,
      action: (ed: any) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: "h2",
      title: "Heading 2",
      desc: "Judul ukuran sedang (H2)",
      icon: IconH2,
      action: (ed: any) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: "bullet",
      title: "Bulleted List",
      desc: "Daftar bulatan sederhana",
      icon: IconList,
      action: (ed: any) => ed.chain().focus().toggleBulletList().run(),
    },
    {
      id: "number",
      title: "Numbered List",
      desc: "Daftar urutan angka",
      icon: IconListNumbers,
      action: (ed: any) => ed.chain().focus().toggleOrderedList().run(),
    },
    {
      id: "quote",
      title: "Quote / Kutipan",
      desc: "Blok kutipan teks/visual",
      icon: IconQuote,
      action: (ed: any) => ed.chain().focus().toggleBlockquote().run(),
    },
    {
      id: "divider",
      title: "Divider (Garis)",
      desc: "Garis pembatas horizontal",
      icon: IconSeparatorHorizontal,
      action: (ed: any) => ed.chain().focus().setHorizontalRule().run(),
    },
    {
      id: "code",
      title: "Storyboard Block",
      desc: "Blok kode storyboard",
      icon: IconCode,
      action: (ed: any) => ed.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: "strike",
      title: "Strikethrough",
      desc: "Coretan teks draf",
      icon: IconStrikethrough,
      action: (ed: any) => ed.chain().focus().toggleStrike().run(),
    },
  ];

  // Map user custom snippets to command items
  const snippetCommands = snippets.map((s) => ({
    id: s.id,
    title: s.title,
    desc: `Salin aset: "${s.title}"`,
    icon: IconSparkles,
    content: s.content, // content to insert
  }));

  const allItems = [
    ...formatCommands.map((item) => ({ ...item, type: "format" })),
    ...snippetCommands.map((item) => ({ ...item, type: "snippet" })),
    // AI Generate command (hardcoded model via env)
    {
      id: "ai-generate",
      type: "ai",
      title: "AI Generate",
      desc: "Generate AI content for the current selection",
      icon: IconSparkles,
      action: async (ed: any) => {
        const content = ed.getHTML();
        try {
          const resp = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: content }),
          });
          const data = await resp.json();
          if (data && data.output) {
            ed.chain().focus().insertContent(data.output).run();
          }
        } catch (e) {
          console.error("AI generate error", e);
        }
      },
    },
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

    // Get text from current block up to cursor (start of paragraph to cursor)
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

    // Record current trigger pos
    slashTriggerPosRef.current = slashDocPos;

    // If the user dismissed this specific trigger pos using Escape, do not reopen
    if (escapedTriggerPosRef.current === slashDocPos) {
      setIsSlashActive(false);
      setSlashQuery("");
      return;
    }

    setIsSlashActive(true);
    setSlashQuery(match[1]);

    try {
      const coords = view.coordsAtPos(selection.from);
      if (coords) {
        setSlashCoords({
          top: coords.top,
          bottom: coords.bottom,
          left: coords.left,
        });
      }
    } catch (e) {}
  };

  const executeCommand = (item: any) => {
    if (!editor) return;

    // Delete trigger slash keyword text from document
    const { selection } = editor.state;
    const triggerLength = slashQuery.length + 1; // slash + keyword
    const from = selection.from - triggerLength;
    const to = selection.from;

    slashTriggerPosRef.current = null;
    escapedTriggerPosRef.current = null;
    setIsSlashActive(false);
    setSlashQuery("");
    setSelectedIndex(0);

    // AI command: open inline prompt popup instead of inserting content
    if (item.type === "ai") {
      editor.chain().focus().deleteRange({ from, to }).run();
      // Capture cursor coords for the prompt popup
      try {
        const coords = editor.view.coordsAtPos(editor.state.selection.from);
        setAiPromptCoords({ top: coords.top, bottom: coords.bottom, left: coords.left });
      } catch (e) {
        setAiPromptCoords({ top: 200, bottom: 220, left: 100 });
      }
      setAiPromptValue("");
      setIsAiPromptActive(true);
      setTimeout(() => aiPromptInputRef.current?.focus(), 50);
      return;
    }

    // Combine operations into a single atomic transaction chain
    let chain = editor.chain().focus().deleteRange({ from, to });

    if (item.type === "format") {
      if (item.id === "h1") chain = chain.toggleHeading({ level: 1 });
      else if (item.id === "h2") chain = chain.toggleHeading({ level: 2 });
      else if (item.id === "bullet") chain = chain.toggleBulletList();
      else if (item.id === "number") chain = chain.toggleOrderedList();
      else if (item.id === "quote") chain = chain.toggleBlockquote();
      else if (item.id === "divider") chain = chain.setHorizontalRule();
      else if (item.id === "code") chain = chain.toggleCodeBlock();
      else if (item.id === "strike") chain = chain.toggleStrike();
    } else {
      chain = chain.insertContent(item.content);
    }

    chain.run();
  };

  const submitAiPrompt = async () => {
    if (!editor || !aiPromptValue.trim() || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const currentContent = editor.getHTML();
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPromptValue.trim(), context: currentContent }),
      });
      const data = await resp.json();
      if (data && data.output) {
        editor.chain().focus().insertContent(data.output).run();
      }
    } catch (e) {
      console.error("AI generate error", e);
    } finally {
      setIsAiLoading(false);
      setIsAiPromptActive(false);
      setAiPromptValue("");
    }
  };

  useEffect(() => {
    triggerExecuteRef.current = () => {
      if (filteredItems[selectedIndexRef.current]) {
        executeCommand(filteredItems[selectedIndexRef.current]);
      }
    };
  }, [filteredItems]);

  // Close slash menu popover during any page or editor scrolling event to avoid floating drift,
  // but ignore scrolling events inside the slash menu itself.
  useEffect(() => {
    if (!isSlashActive) return;
    const handleScroll = (event: Event) => {
      const menuEl = document.getElementById("tiptap-slash-menu");
      if (menuEl && menuEl.contains(event.target as Node)) {
        return;
      }
      setIsSlashActive(false);
    };

    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isSlashActive]);

  // Close slash menu popover when clicking outside the menu
  useEffect(() => {
    if (!isSlashActive) return;
    const handleClickOutside = (event: MouseEvent) => {
      const menuEl = document.getElementById("tiptap-slash-menu");
      if (menuEl && !menuEl.contains(event.target as Node)) {
        setIsSlashActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSlashActive]);

  // Auto-scroll the highlighted menu item into view when navigating via keyboard
  useEffect(() => {
    if (isSlashActive && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [selectedIndex, isSlashActive]);

  // Listen for text insertion triggers from parents
  useEffect(() => {
    if (!editor || !insertTrigger) return;
    editor.commands.insertContent(insertTrigger.text);
    editor.commands.focus();
  }, [insertTrigger, editor]);

  // Sync internal TipTap state if the parent content changes externally (e.g. Initial load)
  useEffect(() => {
    if (!editor || content === editor.getHTML()) return;
    editor.commands.setContent(content, { emitUpdate: false });
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs font-mono text-muted-foreground/60">
        Initializing TipTap Engine...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col overflow-hidden min-h-0 relative"
    >
      {/* Dynamic WYSIWYG Formatting Toolbar */}
      <div className="bg-muted/30 border-b border-border/50 px-3 py-2 flex flex-wrap items-center gap-1 shadow-inner shrink-0">
        {/* Bold Button */}
        <button
          type="button"
          title="Bold (Ctrl+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("bold")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconBold className="size-4" />
        </button>

        {/* Italic Button */}
        <button
          type="button"
          title="Italic (Ctrl+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("italic")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconItalic className="size-4" />
        </button>

        {/* H1 Heading */}
        <button
          type="button"
          title="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("heading", { level: 1 })
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconH1 className="size-4" />
        </button>

        {/* H2 Heading */}
        <button
          type="button"
          title="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("heading", { level: 2 })
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconH2 className="size-4" />
        </button>

        {/* Bullet List */}
        <button
          type="button"
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("bulletList")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconList className="size-4" />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("orderedList")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconListNumbers className="size-4" />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("blockquote")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconQuote className="size-4" />
        </button>

        {/* Code Block */}
        <button
          type="button"
          title="Storyboard Code Block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("codeBlock")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconCode className="size-4" />
        </button>

        {/* Strikethrough Button */}
        <button
          type="button"
          title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("strike")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconStrikethrough className="size-4" />
        </button>

        {/* Divider (Horizontal Rule) Button */}
        <button
          type="button"
          title="Divider Line"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="size-7 flex items-center justify-center rounded transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <IconSeparatorHorizontal className="size-4" />
        </button>

        <span className="h-4 w-px bg-border mx-2" />
      </div>

      {/* Tiptap Styled Content Area */}
      <div className="flex-1 p-4 bg-background/30 overflow-y-auto min-h-0">
        <EditorContent editor={editor} />
      </div>

      {/* AI Inline Prompt Popup (Portal) */}
      {isAiPromptActive && aiPromptCoords && typeof document !== "undefined" &&
        createPortal(
          <div
            id="tiptap-ai-prompt"
            style={{
              position: "fixed",
              top:
                typeof window !== "undefined" && aiPromptCoords.bottom + 140 > window.innerHeight
                  ? aiPromptCoords.top - 144
                  : aiPromptCoords.bottom + 6,
              left:
                typeof window !== "undefined"
                  ? Math.max(12, Math.min(aiPromptCoords.left, window.innerWidth - 360))
                  : aiPromptCoords.left,
            }}
            className="fixed z-[9999] w-80 bg-card border border-primary/30 shadow-2xl rounded-xl p-3 backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <IconSparkles className="size-3.5 text-primary shrink-0" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">AI Generate</span>
              <span className="text-[9px] text-muted-foreground ml-auto">Enter untuk generate · Esc untuk batal</span>
            </div>
            {/* Input */}
            <div className="flex items-center gap-2">
              <input
                ref={aiPromptInputRef}
                type="text"
                value={aiPromptValue}
                onChange={(e) => setAiPromptValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); submitAiPrompt(); }
                  if (e.key === "Escape") { setIsAiPromptActive(false); setAiPromptValue(""); editor?.commands.focus(); }
                }}
                placeholder="Contoh: tulis hook pembuka untuk konten travel..."
                disabled={isAiLoading}
                className="flex-1 bg-muted/60 border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-60 transition-all"
              />
              <button
                type="button"
                onClick={submitAiPrompt}
                disabled={!aiPromptValue.trim() || isAiLoading}
                className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                {isAiLoading ? (
                  <svg className="animate-spin size-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <IconSparkles className="size-3.5" />
                )}
              </button>
            </div>
            {/* Loading state */}
            {isAiLoading && (
              <div className="mt-2 text-[9px] text-muted-foreground flex items-center gap-1.5">
                <svg className="animate-spin size-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating dengan AI...
              </div>
            )}
          </div>,
          document.body,
        )
      }

      {/* Slash Command Floating Menu Popover (Rendered globally using React Portal) */}
      {isSlashActive &&
        slashCoords &&
        filteredItems.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="tiptap-slash-menu"
            style={{
              position: "fixed",
              top:
                typeof window !== "undefined" &&
                slashCoords.bottom + 260 > window.innerHeight
                  ? slashCoords.top -
                    Math.min(260, filteredItems.length * 40 + 20) -
                    4
                  : slashCoords.bottom + 4,
              left:
                typeof window !== "undefined"
                  ? Math.max(
                      12,
                      Math.min(slashCoords.left, window.innerWidth - 270),
                    )
                  : slashCoords.left,
            }}
            className="fixed z-[9999] w-64 bg-card/95 border border-border shadow-2xl rounded-xl p-2 max-h-[260px] overflow-y-auto backdrop-blur-md flex flex-col focus:outline-none scrollbar-none"
          >
            {/* Render Formatting Category if any matching formatting items are present */}
            {filteredItems.some((i) => i.type === "format") && (
              <div className="flex flex-col">
                <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 px-3 py-1.5 select-none">
                  Format Teks
                </div>
                {filteredItems
                  .filter((i) => i.type === "format")
                  .map((item) => {
                    const itemIndex = filteredItems.indexOf(item);
                    const isSelected = itemIndex === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        ref={isSelected ? selectedItemRef : null}
                        type="button"
                        onClick={() => executeCommand(item)}
                        className={[
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer select-none",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground hover:bg-muted",
                        ].join(" ")}
                      >
                        <Icon
                          className={[
                            "size-4 shrink-0",
                            isSelected
                              ? "text-primary-foreground"
                              : "text-muted-foreground/80",
                          ].join(" ")}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.title}</div>
                          <div
                            className={[
                              "text-[9px] truncate font-normal leading-tight mt-0.5",
                              isSelected
                                ? "text-primary-foreground/75"
                                : "text-muted-foreground/65",
                            ].join(" ")}
                          >
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Render AI Commands Category */}
            {filteredItems.some((i) => i.type === "ai") && (
              <div className="flex flex-col mt-1 pt-1 border-t border-border/40">
                <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 px-3 py-1.5 select-none">
                  AI Commands
                </div>
                {filteredItems
                  .filter((i) => i.type === "ai")
                  .map((item) => {
                    const itemIndex = filteredItems.indexOf(item);
                    const isSelected = itemIndex === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        ref={isSelected ? selectedItemRef : null}
                        type="button"
                        onClick={() => executeCommand(item)}
                        className={[
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer select-none",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground hover:bg-muted",
                        ].join(" ")}
                      >
                        <Icon
                          className={[
                            "size-4 shrink-0",
                            isSelected
                              ? "text-primary-foreground"
                              : "text-primary",
                          ].join(" ")}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.title}</div>
                          <div
                            className={[
                              "text-[9px] truncate font-normal leading-tight mt-0.5",
                              isSelected
                                ? "text-primary-foreground/75"
                                : "text-muted-foreground/65",
                            ].join(" ")}
                          >
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Render Aset Siap Pakai Category if any matching snippet items are present */}
            {filteredItems.some((i) => i.type === "snippet") && (
              <div className="flex flex-col mt-1 pt-1 border-t border-border/40">
                <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 px-3 py-1.5 select-none">
                  Aset Siap Pakai
                </div>
                {filteredItems
                  .filter((i) => i.type === "snippet")
                  .map((item) => {
                    const itemIndex = filteredItems.indexOf(item);
                    const isSelected = itemIndex === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        ref={isSelected ? selectedItemRef : null}
                        type="button"
                        onClick={() => executeCommand(item)}
                        className={[
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer select-none",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground hover:bg-muted",
                        ].join(" ")}
                      >
                        <Icon
                          className={[
                            "size-4 shrink-0",
                            isSelected
                              ? "text-primary-foreground"
                              : "text-primary",
                          ].join(" ")}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.title}</div>
                          <div
                            className={[
                              "text-[9px] truncate font-normal leading-tight mt-0.5",
                              isSelected
                                ? "text-primary-foreground/75"
                                : "text-muted-foreground/65",
                            ].join(" ")}
                          >
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
