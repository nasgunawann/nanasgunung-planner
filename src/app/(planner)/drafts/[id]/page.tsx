"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useDrafts, type Draft } from "@/lib/drafts";
import {
  IconArrowLeft,
  IconSparkles,
  IconEye,
  IconEdit,
  IconTrash,
  IconHash,
  IconDeviceFloppy,
} from "@tabler/icons-react";

export default function DraftWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { drafts, updateDraft, deleteDraft } = useDrafts();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const id = params?.id as string;
  const draft = drafts.find((d) => d.id === id);

  // Editor Tabs
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  // Local input buffers for Debouncing
  const [localTitle, setLocalTitle] = useState("");
  const [localContent, setLocalContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  // Initial Sync from drafts context state
  useEffect(() => {
    if (draft) {
      setLocalTitle(draft.title);
      setLocalContent(draft.content ?? "");
    }
  }, [id]); // Trigger only when draft ID changes

  // Auto-Redirect if draft is deleted
  useEffect(() => {
    if (!draft && drafts.length > 0) {
      router.push("/drafts");
    }
  }, [draft, drafts, router]);

  // 1. Debounce Pipeline for Content / Script (600ms idle timer)
  useEffect(() => {
    if (!draft || localContent === (draft.content ?? "")) return;

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      updateDraft(draft.id, { content: localContent });
      setSaveStatus("saved");
    }, 600);

    return () => clearTimeout(timer); // Wipes out timer if user presses another key
  }, [localContent, draft?.id]);

  // 2. Debounce Pipeline for Title (600ms idle timer)
  useEffect(() => {
    if (!draft || localTitle === draft.title) return;

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      updateDraft(draft.id, { title: localTitle });
      setSaveStatus("saved");
    }, 600);

    return () => clearTimeout(timer);
  }, [localTitle, draft?.id]);

  if (!draft) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold">Draft not found</h2>
        <p className="text-sm text-muted-foreground mt-2">
          This draft may have been deleted or the URL is incorrect.
        </p>
        <Link
          href="/drafts"
          className="mt-4 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          Return to Drafts
        </Link>
      </div>
    );
  }

  // Live Statistics metrics
  const wordCount =
    localContent.trim() === "" ? 0 : localContent.trim().split(/\s+/).length;
  const charCount = localContent.length;

  // Metadata dropdown selections (saved instantly as they are click events)
  const handleDropdownChange = (
    field: keyof Omit<Draft, "id" | "updatedAt">,
    value: string,
  ) => {
    setSaveStatus("saving");
    updateDraft(draft.id, { [field]: value });
    setTimeout(() => {
      setSaveStatus("saved");
    }, 400);
  };

  // Markdown Formatting Toolbar Engine
  const insertFormat = (syntaxBefore: string, syntaxAfter = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);

    const replacement = syntaxBefore + selectedText + syntaxAfter;
    const newVal =
      currentVal.substring(0, start) + replacement + currentVal.substring(end);

    setLocalContent(newVal); // Instantly triggers debounced useEffect save pipeline

    // Refocus cursor selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + syntaxBefore.length,
        start + syntaxBefore.length + selectedText.length,
      );
    }, 0);
  };

  // Custom Inline Markdown Compiler (Fast, Client-side, Lightweight)
  function parseMarkdown(text: string) {
    if (!text || text.trim() === "") {
      return (
        <p className="italic text-muted-foreground/35 text-xs py-4">
          No storyboard script has been drafted yet. Click the "Write" tab above
          to start scripting!
        </p>
      );
    }

    return text.split("\n").map((line, idx) => {
      // H1 Header
      if (line.startsWith("# ")) {
        return (
          <h1
            key={idx}
            className="font-heading text-xl font-bold mt-4 mb-2 text-foreground border-b border-border/40 pb-1"
          >
            {line.replace("# ", "")}
          </h1>
        );
      }

      // H2 Header
      if (line.startsWith("## ")) {
        return (
          <h2
            key={idx}
            className="font-heading text-base font-bold mt-3 mb-1.5 text-foreground"
          >
            {line.replace("## ", "")}
          </h2>
        );
      }

      // Blockquotes
      if (line.startsWith("> ")) {
        return (
          <blockquote
            key={idx}
            className="border-l-4 border-primary bg-muted/40 p-2.5 my-2 rounded-r italic text-foreground/90 text-xs"
          >
            {line.replace("> ", "")}
          </blockquote>
        );
      }

      // Bullet List items
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <ul
            key={idx}
            className="list-disc pl-5 my-0.5 text-muted-foreground text-xs"
          >
            <li>{line.substring(2)}</li>
          </ul>
        );
      }

      // Code Block or Scene indicators
      if (line.startsWith("`") && line.endsWith("`")) {
        return (
          <div
            key={idx}
            className="bg-muted border border-border/60 p-2 rounded font-mono text-[11px] text-muted-foreground my-1.5"
          >
            {line.replace(/`/g, "")}
          </div>
        );
      }

      // Empty Lines
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }

      // Inline Bold formatting parser: **text** ➔ <strong>text</strong>
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-bold text-foreground">
            {match[1]}
          </strong>,
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <p
          key={idx}
          className="text-muted-foreground leading-relaxed text-xs my-0.5"
        >
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  }

  // Pre-configured Creators Hashtag Vault Injector
  const hashtagPacks: Record<string, string[]> = {
    Code: ["#developer", "#nextjs", "#programming", "#coding", "#reactjs"],
    Design: ["#uidesign", "#webdesign", "#figma", "#creative", "#aesthetics"],
    Life: ["#solocreator", "#developerlife", "#buildinpublic", "#remotework"],
  };

  return (
    <div className="space-y-6">
      {/* Two-Column Editor Layout */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left Column: Metadata Sidebar */}
        <aside className="space-y-4">
          <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-4">
            {/* Embedded Stationary Navigation Header */}
            <div className="border-b border-border/60 pb-3">
              <Link
                href="/drafts"
                className="w-full flex items-center justify-center gap-2 h-9 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold transition-all shadow-sm"
              >
                <IconArrowLeft className="size-4" />
                Back to Drafts
              </Link>
            </div>

            {/* Title Field (Debounced Input) */}
            <div className="grid gap-1">
              <label
                htmlFor="ws-title"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Title
              </label>
              <input
                id="ws-title"
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-primary/50"
              />
            </div>

            {/* Platform Dropdown */}
            <div className="grid gap-1">
              <label
                htmlFor="ws-platform"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Platform
              </label>
              <select
                id="ws-platform"
                value={draft.platform ?? "Instagram"}
                onChange={(e) =>
                  handleDropdownChange("platform", e.target.value)
                }
                className="h-9 rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-primary/50"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="grid gap-1">
              <label
                htmlFor="ws-category"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Format / Category
              </label>
              <select
                id="ws-category"
                value={draft.category ?? ""}
                onChange={(e) =>
                  handleDropdownChange("category", e.target.value)
                }
                className="h-9 rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-primary/50"
              >
                <option value="">No Category</option>
                <option value="Stories">Stories</option>
                <option value="Reels">Reels</option>
                <option value="Post">Post</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="grid gap-1">
              <label
                htmlFor="ws-status"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Workflow Status
              </label>
              <select
                id="ws-status"
                value={draft.status ?? "Draft"}
                onChange={(e) => handleDropdownChange("status", e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-primary/50"
              >
                <option value="Draft">Draft</option>
                <option value="In progress">In progress</option>
                <option value="Published">Published</option>
              </select>
            </div>

            {/* Schedule Date */}
            <div className="grid gap-1">
              <label
                htmlFor="ws-date"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Schedule Date
              </label>
              <input
                id="ws-date"
                type="date"
                value={draft.date ?? ""}
                onChange={(e) => handleDropdownChange("date", e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Delete Action button */}
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  `Delete this entire draft ("${draft.title}") permanently?`,
                )
              ) {
                deleteDraft(draft.id);
                router.push("/drafts");
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 h-9 rounded-md border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all"
          >
            <IconTrash className="size-4" />
            Delete Draft
          </button>
        </aside>

        {/* Right Column: Immersive Creative Canvas */}
        <section className="space-y-4">
          <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col min-h-[580px]">
            {/* Editor Hub Header: Mode Toggles & Stationary Save State */}
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 shrink-0">
              {/* Left Header Title & Compact Disk Status */}
              <div className="flex items-center gap-4">
                <h3 className="font-heading text-sm font-bold flex items-center gap-2">
                  <IconSparkles className="size-4 text-primary animate-pulse" />
                  Scripting Studio Canvas
                </h3>

                {/* Highly intuitive Floppy Disk Status badge */}
                <div className="flex items-center gap-1.5 text-xs border-l border-border/60 pl-4">
                  {saveStatus === "saving" ? (
                    <span className="flex items-center gap-1 text-amber-500 font-semibold animate-pulse">
                      <IconDeviceFloppy className="size-4 text-amber-500" />
                      <span className="hidden sm:inline">Saving...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground/60 font-semibold">
                      <IconDeviceFloppy className="size-4 text-muted-foreground/45" />
                      <span className="hidden sm:inline">Saved</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right Header Toggles */}
              <div className="flex bg-muted p-0.5 rounded-md text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={[
                    "px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors",
                    activeTab === "write"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <IconEdit className="size-3.5" />
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={[
                    "px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors",
                    activeTab === "preview"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <IconEye className="size-3.5" />
                  Preview
                </button>
              </div>
            </div>

            {/* Conditional Tab Rendering */}
            {activeTab === "write" ? (
              <div className="flex-1 flex flex-col">
                {/* 1. Markdown Formatting Toolbar */}
                <div className="bg-muted/30 border-b border-border/50 px-3 py-2 flex flex-wrap items-center gap-1 shadow-inner shrink-0">
                  <button
                    type="button"
                    title="Bold text"
                    onClick={() => insertFormat("**", "**")}
                    className="size-7 flex items-center justify-center font-bold text-xs rounded hover:bg-muted font-heading"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    title="Italic text"
                    onClick={() => insertFormat("*", "*")}
                    className="size-7 flex items-center justify-center italic text-xs rounded hover:bg-muted font-heading"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    title="Header 1"
                    onClick={() => insertFormat("# ")}
                    className="size-7 flex items-center justify-center text-xs font-bold rounded hover:bg-muted font-heading"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    title="Header 2"
                    onClick={() => insertFormat("## ")}
                    className="size-7 flex items-center justify-center text-xs font-bold rounded hover:bg-muted font-heading"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    title="Blockquote"
                    onClick={() => insertFormat("> ")}
                    className="size-7 flex items-center justify-center text-xs rounded hover:bg-muted"
                  >
                    ”
                  </button>
                  <button
                    type="button"
                    title="Bullet List"
                    onClick={() => insertFormat("- ")}
                    className="size-7 flex items-center justify-center text-xs rounded hover:bg-muted"
                  >
                    •
                  </button>
                  <button
                    type="button"
                    title="Storyboard Code Block"
                    onClick={() => insertFormat("`", "`")}
                    className="size-7 flex items-center justify-center text-xs font-mono rounded hover:bg-muted"
                  >
                    &lt;/&gt;
                  </button>

                  <span className="h-4 w-px bg-border mx-2" />

                  {/* Creators Hashtag Snippet Pack Injectors */}
                  <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mr-1">
                    <IconHash className="size-3" />
                    Inject Hashtags:
                  </span>
                  {Object.entries(hashtagPacks).map(([packName, tags]) => (
                    <button
                      key={packName}
                      type="button"
                      onClick={() => insertFormat("\n" + tags.join(" ") + "\n")}
                      className="text-[10px] bg-background hover:bg-muted border border-border px-2 py-0.5 rounded font-semibold transition-all"
                    >
                      +{packName}
                    </button>
                  ))}
                </div>

                {/* 2. Full-Screen Monospace Workspace Panel */}
                <div className="flex-1 p-4 flex flex-col bg-background/30">
                  <textarea
                    ref={textareaRef}
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    placeholder="Ketik draft di sini&#8230;"
                    className="flex-1 w-full p-2 bg-transparent text-sm font-mono text-muted-foreground outline-none resize-none leading-relaxed overflow-y-auto min-h-[420px]"
                  />
                </div>
              </div>
            ) : (
              /* Immersive compiled preview pane */
              <div className="flex-1 p-6 bg-background/10 overflow-y-auto leading-relaxed">
                <div className="max-w-2xl mx-auto space-y-2 border border-border/50 bg-background/40 p-6 rounded-lg shadow-inner">
                  {parseMarkdown(localContent)}
                </div>
              </div>
            )}

            {/* Immersive Creative Canvas Footer (Word & Char counts) */}
            <div className="border-t border-border/60 px-4 py-2 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground shrink-0 rounded-b-xl">
              <div className="flex items-center gap-3 font-mono font-semibold">
                <span>{wordCount} words</span>
                <span className="text-border/45">|</span>
                <span>{charCount} characters</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
