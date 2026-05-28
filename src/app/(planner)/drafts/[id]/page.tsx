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
  IconTags,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import PageTransition from "@/components/page-transition";
import { AnimatePresence, m } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatToDatetimeLocalValue } from "@/lib/date-utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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

  // Collapsible Library Snippets State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [snippets, setSnippets] = useState<{ id: string; title: string; content: string }[]>([]);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nanas_snippets");
      if (stored) {
        setSnippets(JSON.parse(stored));
      } else {
        const defaultSnippets = [
          {
            id: "snip-1",
            title: "CTA Follow Standard",
            content: "Jangan lupa untuk follow @nanasgunung untuk tips menarik seputar Web Development & Design setiap hari! 🚀",
          },
          {
            id: "snip-2",
            title: "Kumpulan Hashtag Tech",
            content: "#nextjs #typescript #programmerindonesia #webdev #codinglife #belajarcoding",
          },
          {
            id: "snip-3",
            title: "Closing Post LinkedIn",
            content: "Bagaimana dengan workflow tim Anda saat membangun MVP? Mari diskusi di kolom komentar! 👇",
          },
        ];
        setSnippets(defaultSnippets);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 1500);
  };

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
    <PageTransition>
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
              <Input
                id="ws-title"
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="h-9 text-xs bg-background"
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
              <Select
                value={draft.platform ?? "Instagram"}
                onValueChange={(val) => handleDropdownChange("platform", val)}
              >
                <SelectTrigger id="ws-platform" className="h-9 text-xs bg-background cursor-pointer">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Dropdown */}
            <div className="grid gap-1">
              <label
                htmlFor="ws-category"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Format / Category
              </label>
              <Select
                value={draft.category ?? "none"}
                onValueChange={(val) => handleDropdownChange("category", val === "none" ? "" : val)}
              >
                <SelectTrigger id="ws-category" className="h-9 text-xs bg-background cursor-pointer">
                  <SelectValue placeholder="No Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  <SelectItem value="Stories">Stories</SelectItem>
                  <SelectItem value="Reels">Reels</SelectItem>
                  <SelectItem value="Post">Post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Dropdown */}
            <div className="grid gap-1">
              <label
                htmlFor="ws-status"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Workflow Status
              </label>
              <Select
                value={draft.status ?? "Draft"}
                onValueChange={(val) => handleDropdownChange("status", val)}
              >
                <SelectTrigger id="ws-status" className="h-9 text-xs bg-background cursor-pointer">
                  <SelectValue placeholder="Workflow Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="In progress">In progress</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Date */}
            <div className="grid gap-1">
              <label
                htmlFor="ws-date"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Schedule Date & Time
              </label>
              <Input
                id="ws-date"
                type="datetime-local"
                value={formatToDatetimeLocalValue(draft.date)}
                onChange={(e) => handleDropdownChange("date", e.target.value)}
                className="h-9 text-xs bg-background"
              />
            </div>
          </div>

          {/* Delete Action button */}
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 h-9 rounded-md border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all mt-auto cursor-pointer"
          >
            <IconTrash className="size-4" />
            Delete Draft
          </button>
        </aside>

        {/* Right Column: Immersive Creative Canvas - Completely Contained */}
        <section className="lg:h-full lg:overflow-hidden flex flex-row min-h-[520px] flex-1 gap-4">
          <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col h-full overflow-hidden flex-1">
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

              {/* Right Header: Toggle Library Snippets Button */}
              <button
                type="button"
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className={[
                  "flex h-8 items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer select-none shrink-0",
                  isLibraryOpen
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "bg-background border-border text-muted-foreground hover:text-foreground",
                ].join(" ")}
                title="Buka Klip Aset Reusable"
              >
                <IconTags className="size-3.5" />
                <span className="hidden sm:inline">Klip Aset</span>
              </button>
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

          {/* Library Snippets Sidebar Drawer */}
          <AnimatePresence>
            {isLibraryOpen && (
              <m.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{
                  type: "tween",
                  ease: [0.16, 1, 0.3, 1],
                  duration: 0.22,
                }}
                className="hidden lg:flex border border-border/60 rounded-xl bg-card flex-col h-full overflow-hidden shrink-0 shadow-sm"
              >
                {/* Header */}
                <div className="p-3.5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/10">
                  <span className="font-heading text-xs font-bold text-foreground flex items-center gap-1.5">
                    <IconTags className="size-3.5 text-primary" />
                    Klip Aset Reusable
                  </span>
                </div>

                {/* List of snippets with instant copy/insert */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {snippets.length > 0 ? (
                    snippets.map((snip) => (
                      <div
                        key={snip.id}
                        className="rounded-lg border border-border bg-background/50 p-2.5 space-y-2 text-[11px]"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-bold text-foreground truncate max-w-[150px]">
                            {snip.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySnippet(snip.id, snip.content)}
                            className={[
                              "flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer select-none",
                              copiedSnippetId === snip.id
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground",
                            ].join(" ")}
                          >
                            {copiedSnippetId === snip.id ? (
                              <>
                                <IconCheck className="size-2.5" />
                                Tersalin!
                              </>
                            ) : (
                              <>
                                <IconCopy className="size-2.5" />
                                Salin
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed bg-muted/15 p-2 rounded whitespace-pre-wrap select-all border border-border/20 max-h-[85px] overflow-y-auto font-mono">
                          {snip.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-muted-foreground space-y-1">
                      <p className="text-xs font-bold">Aset Klip Kosong</p>
                      <p className="text-[10px] max-w-[200px] mx-auto leading-relaxed">
                        Tambahkan templat tulisan, tanda tangan, atau klip CTA baru di tab **Library** agar muncul di sini!
                      </p>
                    </div>
                  )}
                </div>
              </m.aside>
            )}
          </AnimatePresence>
        </section>

      {/* Dialog Confirmation: Delete Draft */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-sm font-bold text-foreground">Hapus Draft</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2">
              Apakah Anda yakin ingin menghapus draft <strong>"{draft.title}"</strong> secara permanen? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 border-t border-border/40 pt-3 mt-4">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-3 py-1.5 rounded border border-border bg-background hover:bg-muted text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                deleteDraft(draft.id);
                setIsDeleteOpen(false);
                router.push("/drafts");
              }}
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Hapus Draft
            </button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
      </div>
    </PageTransition>
  );
}
