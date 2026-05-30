"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import React from "react";
import { useDrafts } from "@/lib/drafts";
import {
  IconTags,
  IconHistory,
  IconDeviceFloppy,
  IconX,
  IconArrowLeft,
  IconTrash,
  IconClockHour4,
} from "@tabler/icons-react";
import PageTransition from "@/components/page-transition";
import { AnimatePresence, m } from "motion/react";
import { toast } from "sonner";
import MetadataSidebar from "./components/metadata-sidebar";
import AssetsDrawer from "./components/assets-drawer";
import HistoryDrawer from "./components/history-drawer";
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
import useDraftWorkspace from "./hooks/use-draft-workspace";

const TipTapEditor = dynamic(() => import("@/components/tiptap-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center p-8 text-xs font-mono text-muted-foreground/60">
      Loading...
    </div>
  ),
});

export default function DraftWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { deleteDraft } = useDrafts();

  const id = params?.id as string;
  const {
    draft,
    localTitle,
    setLocalTitle,
    localContent,
    setLocalContent,
    saveStatus,
    isLibraryOpen,
    setIsLibraryOpen,
    isHistoryOpen,
    setIsHistoryOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    snippets,
    snippetSearchQuery,
    setSnippetSearchQuery,
    selectedSnippetCategory,
    setSelectedSnippetCategory,
    snippetCategories,
    filteredSnippets,
    insertTrigger,
    setInsertTrigger,
    revisions,
    handleCreateManualBackup,
    handleRestoreRevision,
    handleDropdownChange,
  } = useDraftWorkspace(id);

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

  const plainText = (localContent || "").replace(/<[^>]*>/g, " ");
  const wordCount =
    plainText.trim() === "" ? 0 : plainText.trim().split(/\s+/).length;
  const charCount = plainText.trim().length;

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:h-[calc(100vh-120px)] lg:min-h-0 lg:overflow-hidden">
          <aside className="space-y-4 lg:h-full lg:overflow-y-auto lg:min-h-0 lg:pr-1 select-none flex flex-col shrink-0">
            <MetadataSidebar
              draft={draft}
              localTitle={localTitle}
              setLocalTitle={setLocalTitle}
              setIsDeleteOpen={setIsDeleteOpen}
              handleDropdownChange={handleDropdownChange}
            />
          </aside>

          <section className="lg:h-full lg:overflow-hidden flex flex-row lg:min-h-0 min-h-[520px] flex-1 gap-4 relative overflow-hidden">
            <div className="bg-card border border-border/60 rounded-xl shadow-sm flex flex-col h-full overflow-hidden flex-1">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs">
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

                <div className="flex items-center gap-2">
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

              <div className="flex-1 flex flex-col overflow-hidden">
                <TipTapEditor
                  content={localContent}
                  onChange={(val: string) => setLocalContent(val)}
                  insertTrigger={insertTrigger}
                  snippets={snippets}
                  draftMeta={{
                    title: draft?.title,
                    platform: draft?.platform,
                    category: draft?.category,
                    status: draft?.status,
                  }}
                />
              </div>

              <div className="border-t border-border/60 px-4 py-2 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground shrink-0 rounded-b-xl">
                <div className="flex items-center gap-3 font-mono font-semibold">
                  <span>{wordCount} words</span>
                  <span className="text-border/45">|</span>
                  <span>{charCount} characters</span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isLibraryOpen && (
                <>
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
                    <AssetsDrawer
                      snippets={snippets}
                      snippetSearchQuery={snippetSearchQuery}
                      setSnippetSearchQuery={setSnippetSearchQuery}
                      snippetCategories={snippetCategories}
                      selectedSnippetCategory={selectedSnippetCategory}
                      setSelectedSnippetCategory={setSelectedSnippetCategory}
                      filteredSnippets={filteredSnippets}
                      setInsertTrigger={setInsertTrigger}
                      setIsLibraryOpen={setIsLibraryOpen}
                      handleCreateManualBackup={handleCreateManualBackup}
                    />
                  </m.aside>
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isHistoryOpen && (
                <>
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
                    <HistoryDrawer
                      revisions={revisions}
                      handleCreateManualBackup={handleCreateManualBackup}
                      handleRestoreRevision={handleRestoreRevision}
                      setIsHistoryOpen={setIsHistoryOpen}
                    />
                  </m.aside>
                </>
              )}
            </AnimatePresence>
          </section>

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-heading text-sm font-bold text-foreground">
                  Hapus Draft
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-2">
                  Apakah Anda yakin ingin menghapus draft{" "}
                  <strong>"{draft.title}"</strong>? Tindakan ini dapat dibatalkan melalui tombol 'Undo' pada notifikasi setelah dihapus.
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
