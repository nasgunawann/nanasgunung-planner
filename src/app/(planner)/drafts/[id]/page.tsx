"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDrafts, type Draft } from "@/lib/drafts";
import {
  IconArrowLeft,
  IconSparkles,
  IconTrash,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { formatToDatetimeLocalValue } from "@/lib/date-utils";

// Dynamic import for TipTap Editor Hub (Client-only / SSR Safe)
const TipTapEditor = dynamic(() => import("@/components/tiptap-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center p-8 text-xs font-mono text-muted-foreground/60">
      Loading TipTap Writing Canvas...
    </div>
  ),
});

// Helper to extract text from HTML string safely (Next.js SSR safe)
const getTextFromHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " "); // Replace HTML tags with spaces
};

export default function DraftWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { drafts, updateDraft, deleteDraft } = useDrafts();

  const id = params?.id as string;
  const draft = drafts.find((d) => d.id === id);

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

  // Live Statistics metrics (using our safe text parser)
  const plainText = getTextFromHtml(localContent);
  const wordCount =
    plainText.trim() === "" ? 0 : plainText.trim().split(/\s+/).length;
  const charCount = plainText.trim().length;

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

  return (
    <div className="space-y-6">
      {/* Two-Column Editor Layout - Contained Height on Desktop */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:h-[calc(100vh-140px)] lg:overflow-hidden">
        {/* Left Column: Metadata Sidebar - Scrolling only inside */}
        <aside className="space-y-4 lg:h-full lg:overflow-y-auto lg:pr-1 select-none flex flex-col shrink-0">
          <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-4">
            {/* Embedded Stationary Navigation Header */}
            <div className="border-b border-border/60 pb-3">
              <Link
                href="/drafts"
                className="w-full flex items-center justify-center gap-2 h-9 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold transition-all shadow-sm"
              >
                <IconArrowLeft className="size-4" />
                Back to Drafts Hub
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
                Schedule Date & Time
              </label>
              <input
                id="ws-date"
                type="datetime-local"
                value={formatToDatetimeLocalValue(draft.date)}
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
            className="w-full flex items-center justify-center gap-1.5 h-9 rounded-md border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all mt-auto"
          >
            <IconTrash className="size-4" />
            Delete Draft
          </button>
        </aside>

        {/* Right Column: Immersive Creative Canvas - Completely Contained */}
        <section className="lg:h-full lg:overflow-hidden flex flex-col min-h-[520px] flex-1">
          <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
            {/* Editor Hub Header: Title & Stationary Save State (No Redundant Preview Toggle) */}
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 shrink-0">
              {/* Left Header Title & Compact Disk Status */}
              <div className="flex items-center gap-4">
                <h3 className="font-heading text-sm font-bold flex items-center gap-2">
                  <IconSparkles className="size-4 text-primary animate-pulse" />
                  Scripting Studio Canvas
                </h3>

                {/* Floppy Disk Status badge */}
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
            </div>

            {/* Direct TipTap Editor rendering (WYSIWYG) */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <TipTapEditor
                content={localContent}
                onChange={(val) => setLocalContent(val)}
              />
            </div>

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
