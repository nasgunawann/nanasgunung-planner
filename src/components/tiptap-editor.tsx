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
import { createPortal } from "react-dom";
import {
  IconBold,
  IconItalic,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconQuote,
  IconCode,
  IconSeparatorHorizontal,
  IconStrikethrough,
  IconSparkles,
  IconUnderline,
  IconHighlight,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconLink,
  IconTable,
  IconColumnInsertRight,
  IconRowInsertBottom,
  IconTrash,
} from "@tabler/icons-react";

type DraftMeta = {
  title?: string;
  platform?: string;
  category?: string;
  status?: string;
};

type TipTapEditorProps = {
  content: string;
  onChange: (val: string) => void;
  insertTrigger?: { text: string; time: number } | null;
  snippets?: { id: string; title: string; content: string }[];
  draftMeta?: DraftMeta;
};

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

  // Post-generation Action Bar State
  const [aiActionBar, setAiActionBar] = useState<{
    startPos: number;
    endPos: number;
    commandType: string;
    prompt: string;
    coords: { top: number; left: number };
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

  // ─── Format Commands ─────────────────────────────────────────────────────────
  const formatCommands = [
    { id: "h1", title: "Heading 1", desc: "Judul ukuran besar (H1)", icon: IconH1, action: (ed: any) => ed.chain().focus().toggleHeading({ level: 1 }).run() },
    { id: "h2", title: "Heading 2", desc: "Judul ukuran sedang (H2)", icon: IconH2, action: (ed: any) => ed.chain().focus().toggleHeading({ level: 2 }).run() },
    { id: "h3", title: "Heading 3", desc: "Judul ukuran kecil (H3)", icon: IconH3, action: (ed: any) => ed.chain().focus().toggleHeading({ level: 3 }).run() },
    { id: "bullet", title: "Bulleted List", desc: "Daftar bulatan sederhana", icon: IconList, action: (ed: any) => ed.chain().focus().toggleBulletList().run() },
    { id: "number", title: "Numbered List", desc: "Daftar urutan angka", icon: IconListNumbers, action: (ed: any) => ed.chain().focus().toggleOrderedList().run() },
    { id: "quote", title: "Quote / Kutipan", desc: "Blok kutipan teks/visual", icon: IconQuote, action: (ed: any) => ed.chain().focus().toggleBlockquote().run() },
    { id: "divider", title: "Divider (Garis)", desc: "Garis pembatas horizontal", icon: IconSeparatorHorizontal, action: (ed: any) => ed.chain().focus().setHorizontalRule().run() },
    { id: "code", title: "Storyboard Block", desc: "Blok kode storyboard", icon: IconCode, action: (ed: any) => ed.chain().focus().toggleCodeBlock().run() },
    { id: "strike", title: "Strikethrough", desc: "Coretan teks draf", icon: IconStrikethrough, action: (ed: any) => ed.chain().focus().toggleStrike().run() },
    { id: "underline", title: "Underline", desc: "Garis bawah teks", icon: IconUnderline, action: (ed: any) => ed.chain().focus().toggleUnderline().run() },
    { id: "highlight", title: "Highlight", desc: "Warna kuning sorotan", icon: IconHighlight, action: (ed: any) => ed.chain().focus().toggleHighlight().run() },
    { id: "align-left", title: "Rata Kiri", desc: "Teks rata kiri", icon: IconAlignLeft, action: (ed: any) => ed.chain().focus().setTextAlign("left").run() },
    { id: "align-center", title: "Rata Tengah", desc: "Teks rata tengah", icon: IconAlignCenter, action: (ed: any) => ed.chain().focus().setTextAlign("center").run() },
    { id: "align-right", title: "Rata Kanan", desc: "Teks rata kanan", icon: IconAlignRight, action: (ed: any) => ed.chain().focus().setTextAlign("right").run() },
    { id: "table", title: "Tabel", desc: "Sisipkan tabel 3x3", icon: IconTable, action: (ed: any) => ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    { id: "link", title: "Link / Tautan", desc: "Sisipkan hyperlink", icon: IconLink, action: (ed: any) => {
      const url = prompt("Masukkan URL:");
      if (url) ed.chain().focus().setLink({ href: url }).run();
    }},
  ];

  // Map snippets
  const snippetCommands = snippets.map((s) => ({
    id: s.id,
    title: s.title,
    desc: `Salin aset: "${s.title}"`,
    icon: IconSparkles,
    content: s.content,
  }));

  // AI Commands
  const aiCommands = [
    { id: "ai-generate", type: "ai", title: "AI Generate", desc: "Tulis konten bebas sesuai instruksimu", icon: IconSparkles, commandType: "general", requiresInput: true, placeholder: "Contoh: tulis hook pembuka yang menarik perhatian..." },
    { id: "ai-hook", type: "ai", title: "Tulis Hook", desc: "Generate 3 variasi opening hook viral", icon: IconSparkles, commandType: "hook", requiresInput: false, placeholder: "" },
    { id: "ai-caption", type: "ai", title: "Caption Medsos", desc: "Caption siap posting untuk platformmu", icon: IconSparkles, commandType: "caption", requiresInput: false, placeholder: "" },
    { id: "ai-outline", type: "ai", title: "Buat Outline", desc: "Buat struktur konten dari topik ini", icon: IconSparkles, commandType: "outline", requiresInput: false, placeholder: "" },
    { id: "ai-improve", type: "ai", title: "Perbaiki Tulisan", desc: "Polish & perbaiki teks yang sudah ada", icon: IconSparkles, commandType: "improve", requiresInput: false, placeholder: "" },
  ];

  const allItems = [
    ...formatCommands.map((item) => ({ ...item, type: "format" })),
    ...snippetCommands.map((item) => ({ ...item, type: "snippet" })),
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
      const coords = view.coordsAtPos(selection.from);
      if (coords) {
        setSlashCoords({ top: coords.top, bottom: coords.bottom, left: coords.left });
      }
    } catch (e) {}
  };

  // ─── Execute slash command ────────────────────────────────────────────────────
  const executeCommand = (item: any) => {
    if (!editor) return;

    const { selection } = editor.state;
    const triggerLength = slashQuery.length + 1;
    const from = selection.from - triggerLength;
    const to = selection.from;

    slashTriggerPosRef.current = null;
    escapedTriggerPosRef.current = null;
    setIsSlashActive(false);
    setSlashQuery("");
    setSelectedIndex(0);

    if (item.type === "ai") {
      editor.chain().focus().deleteRange({ from, to }).run();

      let coords = { top: 200, bottom: 220, left: 100 };
      try {
        const c = editor.view.coordsAtPos(editor.state.selection.from);
        coords = { top: c.top, bottom: c.bottom, left: c.left };
      } catch (e) {}
      setAiPromptCoords(coords);

      if (item.requiresInput) {
        setAiPromptValue("");
        setAiPromptPlaceholder(item.placeholder || "Tulis instruksi untuk AI...");
        setAiCommandType(item.commandType || "general");
        setIsAiPromptActive(true);
        setTimeout(() => aiPromptInputRef.current?.focus(), 50);
      } else {
        setAiCommandType(item.commandType || "general");
        streamAiGenerate(item.commandType || "general", "");
      }
      return;
    }

    let chain = editor.chain().focus().deleteRange({ from, to });

    if (item.type === "format") {
      if (item.id === "h1") chain = chain.toggleHeading({ level: 1 });
      else if (item.id === "h2") chain = chain.toggleHeading({ level: 2 });
      else if (item.id === "h3") chain = chain.toggleHeading({ level: 3 });
      else if (item.id === "bullet") chain = chain.toggleBulletList();
      else if (item.id === "number") chain = chain.toggleOrderedList();
      else if (item.id === "quote") chain = chain.toggleBlockquote();
      else if (item.id === "divider") chain = chain.setHorizontalRule();
      else if (item.id === "code") chain = chain.toggleCodeBlock();
      else if (item.id === "strike") chain = chain.toggleStrike();
      else if (item.id === "underline") chain = chain.toggleUnderline();
      else if (item.id === "highlight") chain = chain.toggleHighlight();
      else if (item.id === "align-left") chain = chain.setTextAlign("left");
      else if (item.id === "align-center") chain = chain.setTextAlign("center");
      else if (item.id === "align-right") chain = chain.setTextAlign("right");
      else if (item.id === "table") chain = chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
      else if (item.id === "link") {
        chain.run();
        const url = prompt("Masukkan URL:");
        if (url) editor.chain().focus().setLink({ href: url }).run();
        return;
      }
    } else {
      chain = chain.insertContent(item.content);
    }

    chain.run();
  };

  // Human-readable labels for each AI command type
  const AI_COMMAND_LABELS: Record<string, string> = {
    general: "AI Generate",
    hook: "Tulis Hook",
    caption: "Caption Medsos",
    outline: "Buat Outline",
    improve: "Perbaiki Tulisan",
  };

  // ─── Streaming AI generate ────────────────────────────────────────────────────
  const streamAiGenerate = async (commandType: string, userPrompt: string) => {
    if (!editor || isAiStreaming) return;
    setIsAiStreaming(true);
    setAiActionBar(null); // dismiss any previous action bar

    const currentContent = editor.getHTML();

    // Record where streaming will START (before any insertions)
    const startPos = editor.state.selection.from;

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          context: currentContent,
          commandType,
          draftMeta,
        }),
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      editor.commands.focus();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          editor.commands.insertContent(chunk);
        }
      }

      // After streaming — record end position and show action bar
      const endPos = editor.state.selection.from;
      try {
        const coords = editor.view.coordsAtPos(endPos);
        
        let barTop = coords.bottom + 8;
        
        // Auto-scroll logic if the cursor is near the bottom of the viewport
        const scrollContainer = containerRef.current?.querySelector('.overflow-y-auto');
        if (scrollContainer) {
          const minBottomSpace = 80; // space needed for the action bar
          const overflow = (coords.bottom + minBottomSpace) - window.innerHeight;
          if (overflow > 0) {
            scrollContainer.scrollTop += overflow;
            barTop -= overflow; // adjust position for scroll displacement
          }
        }
        
        // Horizontal clamping logic
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
          // Fallback if containerRect is not available
          barLeft = Math.max(12, Math.min(coords.left, window.innerWidth - 360));
        }

        setAiActionBar({ startPos, endPos, commandType, prompt: userPrompt, coords: { top: barTop, left: barLeft } });
      } catch (e) {
        // coords unavailable — still show action bar at fallback position
        setAiActionBar({ startPos, endPos, commandType, prompt: userPrompt, coords: { top: 200, left: 100 } });
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
    editor.chain().focus().deleteRange({ from: aiActionBar.startPos, to: aiActionBar.endPos }).run();
    setAiActionBar(null);
  };

  const handleAiRetry = async () => {
    if (!aiActionBar || !editor) return;
    const { commandType, prompt, startPos, endPos } = aiActionBar;
    // First discard the previous output
    editor.chain().focus().deleteRange({ from: startPos, to: endPos }).run();
    setAiActionBar(null);
    // Re-run the exact same command + prompt
    await streamAiGenerate(commandType, prompt);
  };

  useEffect(() => {
    triggerExecuteRef.current = () => {
      if (filteredItems[selectedIndexRef.current]) {
        executeCommand(filteredItems[selectedIndexRef.current]);
      }
    };
  }, [filteredItems]);

  // Dismiss action bar when user starts typing (they implicitly accepted the output)
  useEffect(() => {
    if (!editor || !aiActionBar) return;
    const handler = () => setAiActionBar(null);
    editor.on("update", handler);
    return () => { editor.off("update", handler); };
  }, [editor, aiActionBar]);

  // Dismiss action bar on scroll (they are scrolling away)
  useEffect(() => {
    if (!aiActionBar) return;
    const handleScroll = () => {
      setAiActionBar(null);
    };
    const scrollContainer = containerRef.current?.querySelector('.overflow-y-auto');
    scrollContainer?.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
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

  // Listen for text insertion triggers from parents
  useEffect(() => {
    if (!insertTrigger || !editor) return;
    editor.chain().focus().insertContent(insertTrigger.text).run();
  }, [insertTrigger]);

  // Sync external content changes (e.g., revision restore)
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

  // ─── Toolbar button helper ────────────────────────────────────────────────────
  const ToolbarBtn = ({
    onClick, active = false, title, children,
  }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "size-7 flex items-center justify-center rounded transition-colors",
        active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );

  // ─── Slash menu item renderer ─────────────────────────────────────────────────
  const renderMenuItems = (items: any[], colorClass = "text-muted-foreground/80") =>
    items.map((item) => {
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
            isSelected ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted",
          ].join(" ")}
        >
          <Icon className={["size-4 shrink-0", isSelected ? "text-primary-foreground" : colorClass].join(" ")} />
          <div className="flex-1 min-w-0">
            <div className="truncate">{item.title}</div>
            <div className={["text-[9px] truncate font-normal leading-tight mt-0.5", isSelected ? "text-primary-foreground/75" : "text-muted-foreground/65"].join(" ")}>
              {item.desc}
            </div>
          </div>
        </button>
      );
    });

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden min-h-0 relative">

      {/* ── Formatting Toolbar ───────────────────────────────────────── */}
      <div className="bg-muted/30 border-b border-border/50 px-3 py-2 flex flex-wrap items-center gap-1 shadow-inner shrink-0">
        {/* Text style */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)"><IconBold className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)"><IconItalic className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><IconUnderline className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><IconStrikethrough className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight"><IconHighlight className="size-4" /></ToolbarBtn>

        <span className="h-4 w-px bg-border mx-1" />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1"><IconH1 className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><IconH2 className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><IconH3 className="size-4" /></ToolbarBtn>

        <span className="h-4 w-px bg-border mx-1" />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List"><IconList className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List"><IconListNumbers className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><IconQuote className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block"><IconCode className="size-4" /></ToolbarBtn>

        <span className="h-4 w-px bg-border mx-1" />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Rata Kiri"><IconAlignLeft className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Rata Tengah"><IconAlignCenter className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Rata Kanan"><IconAlignRight className="size-4" /></ToolbarBtn>

        <span className="h-4 w-px bg-border mx-1" />

        {/* Table & extras */}
        <ToolbarBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Sisipkan Tabel"><IconTable className="size-4" /></ToolbarBtn>
        {editor.isActive("table") && (
          <>
            <ToolbarBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Tambah Kolom"><IconColumnInsertRight className="size-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Tambah Baris"><IconRowInsertBottom className="size-4" /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Hapus Tabel"><IconTrash className="size-4" /></ToolbarBtn>
          </>
        )}
        <ToolbarBtn onClick={() => {
          const url = prompt("Masukkan URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} active={editor.isActive("link")} title="Link"><IconLink className="size-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><IconSeparatorHorizontal className="size-4" /></ToolbarBtn>
      </div>

      {/* ── Editor Content ───────────────────────────────────────────── */}
      <div className="flex-1 p-4 pb-32 bg-background/30 overflow-y-auto min-h-0 relative">
        <EditorContent editor={editor} />

        {/* AI streaming indicator — small pulsing bar at bottom of content area */}
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

      {/* ── AI Prompt Popup (for requiresInput commands) ─────────────── */}
      {isAiPromptActive && aiPromptCoords && typeof document !== "undefined" &&
        createPortal(
          <div
            id="tiptap-ai-prompt"
            style={{
              position: "fixed",
              top:
                typeof window !== "undefined" && aiPromptCoords.bottom + 160 > window.innerHeight
                  ? aiPromptCoords.top - 164
                  : aiPromptCoords.bottom + 6,
              left:
                typeof window !== "undefined"
                  ? Math.max(12, Math.min(aiPromptCoords.left, window.innerWidth - 400))
                  : aiPromptCoords.left,
            }}
            className="fixed z-[9999] w-96 bg-card border border-primary/30 shadow-2xl rounded-xl p-3 backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <IconSparkles className="size-3.5 text-primary shrink-0" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">AI Generate</span>
              {draftMeta?.platform && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {draftMeta.platform}
                </span>
              )}
              {draftMeta?.category && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  {draftMeta.category}
                </span>
              )}
              <span className="text-[9px] text-muted-foreground ml-auto">Enter · Esc batal</span>
            </div>
            {draftMeta?.title && (
              <div className="text-[9px] text-muted-foreground/70 mb-2 px-0.5">
                Topik: <span className="text-foreground/80 font-medium">{draftMeta.title}</span>
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
                  if (e.key === "Enter") { e.preventDefault(); submitAiPrompt(); }
                  if (e.key === "Escape") { setIsAiPromptActive(false); setAiPromptValue(""); editor?.commands.focus(); }
                }}
                placeholder={aiPromptPlaceholder}
                disabled={isAiStreaming}
                className="flex-1 bg-muted/60 border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-60 transition-all"
              />
              <button
                type="button"
                onClick={submitAiPrompt}
                disabled={!aiPromptValue.trim() || isAiStreaming}
                className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                <IconSparkles className="size-3.5" />
              </button>
            </div>
          </div>,
          document.body,
        )
      }

      {/* ── Post-generation Action Bar (Portal) ──────────────────────── */}
      {aiActionBar && !isAiStreaming && typeof document !== "undefined" &&
        createPortal(
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
              <IconSparkles className="size-3 text-primary shrink-0" />
              <span className="text-[10px] font-medium text-foreground/80 max-w-[100px] sm:max-w-[180px] truncate">
                {aiActionBar.commandType === "general" && aiActionBar.prompt
                  ? `"${aiActionBar.prompt.length > 28 ? aiActionBar.prompt.slice(0, 28) + "…" : aiActionBar.prompt}"`
                  : AI_COMMAND_LABELS[aiActionBar.commandType] ?? "AI Generate"}
              </span>
            </div>

            <span className="w-px h-4 bg-border/60 mx-0.5 sm:mx-1" />

            {/* Accept */}
            <button
              type="button"
              onClick={handleAiAccept}
              title="Simpan hasil AI"
              className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-3 shrink-0"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="hidden sm:inline">Simpan</span>
            </button>

            {/* Retry */}
            <button
              type="button"
              onClick={handleAiRetry}
              title="Coba lagi dengan instruksi yang sama"
              className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-3 shrink-0"><path d="M13.5 2.5A6.5 6.5 0 1 1 9 2.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M13.5 2.5V6h-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="hidden sm:inline">Coba Lagi</span>
            </button>

            {/* Discard */}
            <button
              type="button"
              onClick={handleAiDiscard}
              title="Buang hasil AI"
              className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-3 shrink-0"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              <span className="hidden sm:inline">Buang</span>
            </button>
          </div>,
          document.body,
        )
      }

      {/* ── Slash Command Menu (Portal) ───────────────────────────────── */}
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
                  ? slashCoords.top - Math.min(260, filteredItems.length * 40 + 20) - 4
                  : slashCoords.bottom + 4,
              left:
                typeof window !== "undefined"
                  ? Math.max(12, Math.min(slashCoords.left, window.innerWidth - 270))
                  : slashCoords.left,
            }}
            className="fixed z-[9999] w-64 bg-card/95 border border-border shadow-2xl rounded-xl p-2 max-h-[300px] overflow-y-auto backdrop-blur-md flex flex-col focus:outline-none scrollbar-none"
          >
            {filteredItems.some((i) => i.type === "format") && (
              <div className="flex flex-col">
                <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 px-3 py-1.5 select-none">Format Teks</div>
                {renderMenuItems(filteredItems.filter((i) => i.type === "format"), "text-muted-foreground/80")}
              </div>
            )}

            {filteredItems.some((i) => i.type === "ai") && (
              <div className="flex flex-col mt-1 pt-1 border-t border-border/40">
                <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 px-3 py-1.5 select-none">AI Commands</div>
                {renderMenuItems(filteredItems.filter((i) => i.type === "ai"), "text-primary")}
              </div>
            )}

            {filteredItems.some((i) => i.type === "snippet") && (
              <div className="flex flex-col mt-1 pt-1 border-t border-border/40">
                <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 px-3 py-1.5 select-none">Aset Siap Pakai</div>
                {renderMenuItems(filteredItems.filter((i) => i.type === "snippet"), "text-primary")}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
