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
import { Mark, Node, mergeAttributes } from "@tiptap/core";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

// ─── Template UI Primitives ───────────────────────────────────────────────────
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// ─── Template UI Components ───────────────────────────────────────────────────
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";

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

// ─── Template Icons ───────────────────────────────────────────────────────────
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

// ─── Template Styles ──────────────────────────────────────────────────────────
import "@/components/tiptap-templates/simple/simple-editor.scss";

// ─── Our Custom Modular Components ────────────────────────────────────────────
import { Button } from "@/components/tiptap-ui-primitive/button";
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
import { IconSparkles, IconMaximize, IconMinimize } from "@tabler/icons-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TipTapEditorProps = {
  content: string;
  onChange: (val: string) => void;
  insertTrigger?: { text: string; time: number } | null;
  snippets?: { id: string; title: string; content: string }[];
  draftMeta?: DraftMeta;
};

// ─── Custom AI Highlight Mark Extension ──────────────────────────────────────
const AiHighlight = Mark.create({
  name: "aiHighlight",
  addOptions() {
    return { HTMLAttributes: { class: "ai-processing px-1 rounded" } };
  },
  parseHTML() {
    return [{ tag: "span[data-ai-highlight]" }];
  },
  renderHTML({ HTMLAttributes }: any) {
    return [
      "span",
      mergeAttributes(
        { "data-ai-highlight": "" },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ];
  },
});

// ─── Custom Callout Node Extension ───────────────────────────────────────────
const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return { emoji: { default: "💡" } };
  },
  parseHTML() {
    return [{ tag: "div[data-type='callout']" }];
  },
  renderHTML({ node, HTMLAttributes }: any) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "callout" }),
      [
        "span",
        { class: "callout-emoji select-none", contenteditable: "false" },
        node.attrs.emoji,
      ],
      ["div", { class: "callout-content" }, 0],
    ];
  },
  addCommands() {
    return {
      setCallout:
        (attributes: any) =>
        ({ commands }: any) => {
          return commands.toggleNode(this.name, "paragraph", attributes);
        },
    };
  },
} as any);

// ─── Toolbar Content Components ───────────────────────────────────────────────
const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onAiClick,
  isMobile,
  isFullscreen,
  onFullscreenToggle,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  onAiClick: () => void;
  isMobile: boolean;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
}) => (
  <>
    {/* AI Button */}
    <ToolbarGroup>
      <Button
        onClick={onAiClick}
        variant="ghost"
        className="gap-1 px-2 text-[10px] font-semibold text-primary"
        title="AI Generate (Ctrl+/)"
      >
        <IconSparkles className="size-4 shrink-0" />
        {!isMobile && <span>AI Generate</span>}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <UndoRedoButton action="undo" />
      <UndoRedoButton action="redo" />
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
      <ListDropdownMenu
        modal={false}
        types={["bulletList", "orderedList", "taskList"]}
      />
      <BlockquoteButton />
      <CodeBlockButton />
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <MarkButton type="bold" />
      <MarkButton type="italic" />
      <MarkButton type="strike" />
      <MarkButton type="underline" />
      {!isMobile ? (
        <ColorHighlightPopover />
      ) : (
        <ColorHighlightPopoverButton onClick={onHighlighterClick} />
      )}
      {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <TextAlignButton align="left" />
      <TextAlignButton align="center" />
      <TextAlignButton align="right" />
    </ToolbarGroup>

    {/* Zen Focus Mode Button */}
    {!isMobile && (
      <>
        <ToolbarSeparator />
        <ToolbarGroup>
          <Button
            onClick={onFullscreenToggle}
            variant="ghost"
            className="size-7 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title={isFullscreen ? "Keluar Mode Fokus (Esc)" : "Mode Fokus Fullscreen (Zen)"}
          >
            {isFullscreen ? (
              <IconMinimize className="size-4 shrink-0 text-primary" />
            ) : (
              <IconMaximize className="size-4 shrink-0" />
            )}
          </Button>
        </ToolbarGroup>
      </>
    )}
  </>
);

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

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
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [isBubbleAiActive, setIsBubbleAiActive] = useState(false);
  const [aiActionBar, setAiActionBar] = useState<{
    startPos: number;
    endPos: number;
    commandType: string;
    prompt: string;
    coords: { top: number; left: number };
    originalText?: string;
  } | null>(null);

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

  // ── AI Streaming ────────────────────────────────────────────────────────────
  const streamAiGenerate = async (
    commandType: string,
    userPrompt: string,
    customContext?: string,
  ) => {
    if (!editor || isAiStreaming) return;
    setIsAiStreaming(true);
    setAiActionBar(null);
    const currentContent = editor.getHTML();
    let startPos = editor.state.selection.from;
    let endPos = editor.state.selection.to;
    const isSelection = commandType.endsWith("-selection");
    let contextToUse = customContext || currentContent;
    let originalText = customContext || "";
    if (isSelection && !customContext) {
      contextToUse = editor.state.doc.textBetween(startPos, endPos, " ");
      originalText = contextToUse;
      editor.chain().focus().setMark("aiHighlight").run();
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
        if (chunk) editor.commands.insertContent(chunk);
      }
      const finalEndPos = editor.state.selection.from;
      try {
        const coords = editor.view.coordsAtPos(finalEndPos);
        let barTop = coords.bottom + 8;
        const scrollContainer = containerRef.current?.querySelector(
          ".simple-editor-content",
        );
        if (scrollContainer) {
          const minBottomSpace = 80;
          const overflow = coords.bottom + minBottomSpace - window.innerHeight;
          if (overflow > 0) {
            scrollContainer.scrollTop += overflow;
            barTop -= overflow;
          }
        }
        let barLeft = coords.left;
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          const isMobileW = window.innerWidth < 640;
          const barWidth = isMobileW ? 250 : 450;
          const padding = 16;
          barLeft = Math.max(
            containerRect.left + padding,
            Math.min(coords.left, containerRect.right - barWidth - padding),
          );
        }
        setAiActionBar({
          startPos,
          endPos: finalEndPos,
          commandType,
          prompt: userPrompt,
          coords: { top: barTop, left: barLeft },
          originalText: isSelection ? originalText : undefined,
        });
      } catch {
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
        .setTextSelection({
          from: startPos,
          to: startPos + originalText.length,
        })
        .run();
      await streamAiGenerate(commandType, prompt);
    } else {
      editor.chain().focus().deleteRange({ from: startPos, to: endPos }).run();
      await streamAiGenerate(commandType, prompt);
    }
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
  }, [editor, aiActionBar]);

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
  }, [aiActionBar]);

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
  }, [insertTrigger]);

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
            <div className="inline-flex items-center gap-2 bg-card/90 border border-primary/30 shadow-lg rounded-full px-3 py-1.5 backdrop-blur-sm">
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
