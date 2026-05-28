"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  useDrafts,
  type Draft,
  type DraftRevision,
  getRevisions,
  saveRevision,
} from "@/lib/drafts";
import {
  IconArrowLeft,
  IconSparkles,
  IconTrash,
  IconDeviceFloppy,
  IconTags,
  IconHistory,
  IconClockHour4,
  IconX,
} from "@tabler/icons-react";
import PageTransition from "@/components/page-transition";
import { AnimatePresence, m } from "motion/react";
import { toast } from "sonner";
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
      Loading...
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [snippets, setSnippets] = useState<
    { id: string; title: string; content: string }[]
  >([]);
  const [insertTrigger, setInsertTrigger] = useState<{
    text: string;
    time: number;
  } | null>(null);
  const [revisions, setRevisions] = useState<DraftRevision[]>([]);

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
            content:
              "Jangan lupa untuk follow @nanasgunung untuk tips menarik seputar Web Development & Design setiap hari! 🚀",
          },
          {
            id: "snip-2",
            title: "Kumpulan Hashtag Tech",
            content:
              "#nextjs #typescript #programmerindonesia #webdev #codinglife #belajarcoding",
          },
          {
            id: "snip-3",
            title: "Closing Post LinkedIn",
            content:
              "Bagaimana dengan workflow tim Anda saat membangun MVP? Mari diskusi di kolom komentar! 👇",
          },
        ];
        setSnippets(defaultSnippets);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Note: Snippets are now inserted inline directly into TipTap editor via insertTrigger state

  const handleCreateManualBackup = () => {
    if (!draft) return;
    const updated = saveRevision(draft.id, draft.title, localContent);
    setRevisions(updated);
    toast.success("Cadangan versi draf berhasil dibuat!");
  };

  const handleRestoreRevision = (rev: DraftRevision) => {
    if (!draft) return;
    // Save current state first so they can undo the restore
    saveRevision(draft.id, draft.title, localContent);

    // Update local state and persist
    setLocalContent(rev.content);
    updateDraft(draft.id, { content: rev.content });

    // Reload revision list
    const updated = getRevisions(draft.id);
    setRevisions(updated);

    toast.success(
      `Draf dipulihkan ke versi (${new Date(rev.timestamp).toLocaleTimeString()})!`,
    );
  };

  // Initial Sync from drafts context state
  useEffect(() => {
    if (draft) {
      setLocalTitle(draft.title);
      setLocalContent(draft.content ?? "");
    }
  }, [id, draft]); // Trigger when draft ID or draft context object loads/changes

  // Load and initialize version history revisions for this draft session
  useEffect(() => {
    if (!draft) return;

    // Load existing revisions
    const existingRevisions = getRevisions(draft.id);
    setRevisions(existingRevisions);

    // Save initial session snapshot if there's content and we don't have it as the latest checkpoint
    if (draft.content) {
      const updated = saveRevision(draft.id, draft.title, draft.content);
      setRevisions(updated);
    }
  }, [id, draft?.id]);

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
      <div className="space-y-4">
        {/* Two-Column Editor Layout - Contained Height on Desktop */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:h-[calc(100vh-120px)] lg:min-h-0 lg:overflow-hidden">
          {/* Left Column: Metadata Sidebar - Scrolling only inside */}
          <aside className="space-y-4 lg:h-full lg:overflow-y-auto lg:min-h-0 lg:pr-1 select-none flex flex-col shrink-0">
            <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-4">
              {/* Embedded Stationary Navigation Header */}
              <div className="border-b border-border/60 pb-3 space-y-2">
                <Link
                  href="/drafts"
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold transition-all shadow-sm"
                >
                  <IconArrowLeft className="size-4" />
                  Kembali ke Drafts
                </Link>

                {/* Delete Action button */}
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 h-9 rounded-md border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all cursor-pointer"
                >
                  <IconTrash className="size-4" />
                  Delete Draft
                </button>
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
                  <SelectTrigger
                    id="ws-platform"
                    className="h-9 text-xs bg-background cursor-pointer"
                  >
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
                  onValueChange={(val) =>
                    handleDropdownChange("category", val === "none" ? "" : val)
                  }
                >
                  <SelectTrigger
                    id="ws-category"
                    className="h-9 text-xs bg-background cursor-pointer"
                  >
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
                  <SelectTrigger
                    id="ws-status"
                    className="h-9 text-xs bg-background cursor-pointer"
                  >
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
          </aside>

          {/* Right Column: Immersive Creative Canvas - Completely Contained */}
          <section className="lg:h-full lg:overflow-hidden flex flex-row lg:min-h-0 min-h-[520px] flex-1 gap-4 relative overflow-hidden">
            <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col h-full overflow-hidden flex-1">
              {/* Editor Hub Header: Title & Stationary Save State */}
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 shrink-0">
                {/* Left Header Title & Compact Disk Status */}
                <div className="flex items-center gap-4">
                  <h3 className="font-heading text-sm font-bold flex items-center gap-2">
                    <IconSparkles className="size-4 text-primary animate-pulse" />
                    Dokumen Draf
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

                {/* Right Header: Toggles for Library & Version History */}
                <div className="flex items-center gap-2">
                  {/* Aset Siap Pakai Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLibraryOpen(!isLibraryOpen);
                      setIsHistoryOpen(false);
                    }}
                    className={[
                      "flex h-9 items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer select-none shrink-0 touch-manipulation active:scale-95",
                      isLibraryOpen
                        ? "bg-primary border-primary text-primary-foreground shadow-sm active:bg-primary/95"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/20 active:bg-muted/30",
                    ].join(" ")}
                    title="Buka Aset Siap Pakai"
                  >
                    <IconTags className="size-3.5" />
                    <span className="inline sm:hidden">Aset</span>
                    <span className="hidden sm:inline">Aset Siap Pakai</span>
                  </button>

                  {/* Riwayat Versi Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHistoryOpen(!isHistoryOpen);
                      setIsLibraryOpen(false);
                    }}
                    className={[
                      "flex h-9 items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer select-none shrink-0 touch-manipulation active:scale-95",
                      isHistoryOpen
                        ? "bg-primary border-primary text-primary-foreground shadow-sm active:bg-primary/95"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/20 active:bg-muted/30",
                    ].join(" ")}
                    title="Buka Riwayat Versi"
                  >
                    <IconHistory className="size-3.5" />
                    <span className="inline sm:hidden">Riwayat</span>
                    <span className="hidden sm:inline">Riwayat Versi</span>
                  </button>
                </div>
              </div>

              {/* Direct TipTap Editor rendering (WYSIWYG) */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <TipTapEditor
                  content={localContent}
                  onChange={(val) => setLocalContent(val)}
                  insertTrigger={insertTrigger}
                  snippets={snippets}
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

            {/* Library Snippets Sidebar Drawer (Floating overlay) */}
            <AnimatePresence>
              {isLibraryOpen && (
                <>
                  {/* Backdrop overlay */}
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsLibraryOpen(false)}
                    className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm cursor-pointer"
                  />
                  <m.aside
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{
                      type: "tween",
                      ease: [0.16, 1, 0.3, 1],
                      duration: 0.25,
                    }}
                    className="fixed top-0 right-0 z-50 w-[290px] border-l border-border bg-card flex flex-col h-full overflow-hidden shadow-2xl"
                  >
                    {/* Header */}
                    <div className="p-3.5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/10">
                      <span className="font-heading text-xs font-bold text-foreground flex items-center gap-1.5">
                        <IconTags className="size-3.5 text-primary" />
                        Aset Siap Pakai
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLibraryOpen(false)}
                        className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                      >
                        <IconX className="size-3.5" />
                      </button>
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
                              <span className="font-bold text-foreground truncate max-w-[130px]">
                                {snip.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  // Save a revision before applying snippet so they can undo it!
                                  if (draft) {
                                    const updated = saveRevision(
                                      draft.id,
                                      draft.title,
                                      localContent,
                                    );
                                    setRevisions(updated);
                                  }
                                  setInsertTrigger({
                                    text: snip.content,
                                    time: Date.now(),
                                  });
                                  toast.success(
                                    `Aset "${snip.title}" disisipkan!`,
                                  );
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-pointer select-none"
                              >
                                <IconSparkles className="size-2.5 text-primary" />
                                Apply
                              </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed bg-muted/15 p-2 rounded whitespace-pre-wrap select-all border border-border/20 max-h-[85px] overflow-y-auto font-mono">
                              {snip.content}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-muted-foreground space-y-1">
                          <p className="text-xs font-bold">
                            Aset Siap Pakai Kosong
                          </p>
                          <p className="text-[10px] max-w-[200px] mx-auto leading-relaxed font-sans mt-1">
                            Tambahkan templat tulisan, tanda tangan, atau aset
                            baru di tab **Library** agar muncul di sini!
                          </p>
                        </div>
                      )}
                    </div>
                  </m.aside>
                </>
              )}
            </AnimatePresence>

            {/* Version History Sidebar Drawer (Floating overlay) */}
            <AnimatePresence>
              {isHistoryOpen && (
                <>
                  {/* Backdrop overlay */}
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsHistoryOpen(false)}
                    className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm cursor-pointer"
                  />
                  <m.aside
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{
                      type: "tween",
                      ease: [0.16, 1, 0.3, 1],
                      duration: 0.25,
                    }}
                    className="fixed top-0 right-0 z-50 w-[290px] border-l border-border bg-card flex flex-col h-full overflow-hidden shadow-2xl"
                  >
                    {/* Header */}
                    <div className="p-3.5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/10">
                      <span className="font-heading text-xs font-bold text-foreground flex items-center gap-1.5">
                        <IconHistory className="size-3.5 text-primary" />
                        Riwayat Versi
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsHistoryOpen(false)}
                        className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                      >
                        <IconX className="size-3.5" />
                      </button>
                    </div>

                    <div className="p-3 border-b border-border/40 bg-muted/5 flex items-center justify-between shrink-0">
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        Penyimpanan Lokal (Offline)
                      </span>
                      <button
                        type="button"
                        onClick={handleCreateManualBackup}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all cursor-pointer select-none"
                      >
                        <IconDeviceFloppy className="size-2.5" />
                        Buat Cadangan
                      </button>
                    </div>

                    {/* List of revisions */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      <p className="text-[10px] text-muted-foreground leading-relaxed px-1 font-sans">
                        Sistem mencatat maksimal 5 versi terakhir secara
                        otomatis. Mengembalikan versi akan mencadangkan status
                        saat ini.
                      </p>

                      {revisions.length > 0 ? (
                        revisions.map((rev, index) => {
                          const dateObj = new Date(rev.timestamp);
                          const timeStr = dateObj.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          });
                          const dateStr = dateObj.toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          });
                          const isInitial = index === revisions.length - 1;

                          return (
                            <div
                              key={rev.id}
                              className="rounded-lg border border-border bg-background/50 p-2.5 space-y-2 text-[11px]"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-foreground flex items-center gap-1">
                                    <IconClockHour4 className="size-3 text-primary/70" />
                                    <span>{timeStr}</span>
                                  </div>
                                  <div className="text-[9px] text-muted-foreground font-mono">
                                    {dateStr}{" "}
                                    {isInitial && (
                                      <span className="text-emerald-500 font-bold ml-1">
                                        (Awal Sesi)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRestoreRevision(rev)}
                                  className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer select-none"
                                >
                                  Restore
                                </button>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed bg-muted/15 p-2 rounded truncate max-h-[35px] overflow-hidden border border-border/20 font-mono">
                                {getTextFromHtml(rev.content) ||
                                  "(Teks Kosong)"}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-10 text-muted-foreground font-sans">
                          <p className="text-xs font-bold">Belum Ada Riwayat</p>
                          <p className="text-[10px] max-w-[200px] mx-auto leading-relaxed mt-1">
                            Cadangan versi draf otomatis akan terekam saat Anda
                            mulai mengetik atau menyisipkan aset baru!
                          </p>
                        </div>
                      )}
                    </div>
                  </m.aside>
                </>
              )}
            </AnimatePresence>
          </section>

          {/* Dialog Confirmation: Delete Draft */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-heading text-sm font-bold text-foreground">
                  Hapus Draft
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-2">
                  Apakah Anda yakin ingin menghapus draft{" "}
                  <strong>"{draft.title}"</strong> secara permanen? Tindakan ini
                  tidak dapat dibatalkan.
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
