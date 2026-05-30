"use client";

import { useState } from "react";
import PageTransition from "@/components/page-transition";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import {
  IconListDetails,
  IconTags,
  IconRecycle,
  IconPlus,
  IconBulb,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { defaultTemplates } from "@/lib/library-seed";
import TemplateCard from "./components/template-card";
import SnippetCard from "./components/snippet-card";
import AddSnippetDialog from "@/components/add-snippet-dialog";
import LibraryFilters from "./components/library-filters";
import { useLibraryData } from "./hooks/use-library-data";
import { useDrafts } from "@/lib/drafts";
import { platformColorMap } from "@/lib/platform-map";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function LibraryPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    activeTab,
    setActiveTab,
    templates,
    expandedTemplates,
    toggleTemplateExpand,
    handleDeleteTemplate,
    handleUseTemplate,
    categories,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    searchQuery,
    setSearchQuery,
    filteredSnippets,
    editingSnippetId,
    setEditingSnippetId,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editCategory,
    setEditCategory,
    handleStartEdit,
    handleSaveEdit,
    handleDeleteSnippet,
    handleCopy,
    copiedId,
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToDelete,
    executeDelete,
    setTemplates,
    addSnippetDirect,
  } = useLibraryData();

  const { rawIdeas, deleteRawIdea } = useDrafts();

  const tabPanelVariants = {
    initial: { opacity: 0, y: 10, filter: "blur(1px)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      opacity: 0,
      y: -8,
      filter: "blur(1px)",
      transition: { duration: 0.12, ease: [0.16, 1, 0.3, 1] },
    },
  } as const;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex gap-1 bg-muted/40 p-1 border border-border/40 rounded-lg overflow-x-auto scrollbar-none flex-nowrap w-full sm:w-auto shrink-0 max-w-full sm:max-w-lg md:max-w-xl">
          {[
            { id: "templates", label: "Template", icon: IconListDetails },
            { id: "snippets", label: "Aset Siap Pakai", icon: IconTags },
            { id: "raw_ideas", label: "Ide", icon: IconBulb },
            // { id: "history", label: "Arsip & Riwayat", icon: IconRecycle }, //TODO nanti tambahkan fungsi
          ].map((tab) => {
            const Icon = tab.icon as any;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={[
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap shrink-0",
                  active
                    ? "bg-card border border-border/50 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                ].join(" ")}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === "templates" && (
              <m.div
                key="templates"
                variants={tabPanelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <div className="grid gap-4">
                  {templates.length > 0 ? (
                    templates.map((t) => (
                      <TemplateCard
                        key={t.title}
                        template={t}
                        isExpanded={expandedTemplates.includes(t.title)}
                        onToggle={toggleTemplateExpand}
                        onDelete={handleDeleteTemplate}
                        onUse={handleUseTemplate}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-4 max-w-md mx-auto mt-6">
                      <IconListDetails className="size-10 text-muted-foreground/35 mx-auto animate-pulse" />
                      <div className="space-y-1">
                        <h3 className="font-heading text-sm font-bold text-foreground">
                          Belum ada templat kustom
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                          Gunakan AI Blueprint Generator untuk generate kerangka
                          konten kustom, atau pulihkan templat bawaan awal.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTemplates(defaultTemplates);
                          localStorage.setItem(
                            "nanas_custom_templates",
                            JSON.stringify(defaultTemplates),
                          );
                        }}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground px-4 text-xs font-bold transition-all shadow-sm cursor-pointer select-none mx-auto"
                      >
                        <IconRecycle className="size-4" /> Muat Ulang Templat
                        Bawaan
                      </button>
                    </div>
                  )}
                </div>
              </m.div>
            )}

            {activeTab === "snippets" && (
              <m.div
                key="snippets"
                variants={tabPanelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4 w-full"
              >
                <div className="space-y-4">
                  <LibraryFilters
                    categories={categories}
                    selectedCategoryFilter={selectedCategoryFilter}
                    setSelectedCategoryFilter={setSelectedCategoryFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex justify-between items-center bg-card/20 border border-border/40 p-3 rounded-lg">
                      <span>
                        Daftar Aset Siap Pakai ({filteredSnippets.length})
                      </span>
                      <div className="flex items-center gap-2">
                        {(selectedCategoryFilter !== "All" ||
                          searchQuery !== "") && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategoryFilter("All");
                              setSearchQuery("");
                            }}
                            className="text-[10px] text-primary hover:underline font-bold mr-2 cursor-pointer"
                          >
                            Reset Filter
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsAddDialogOpen(true)}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground px-3.5 text-xs font-bold transition-all shadow-sm cursor-pointer select-none"
                        >
                          <IconPlus className="size-3.5" />
                          Tambah Aset
                        </button>
                      </div>
                    </h3>

                    {filteredSnippets.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredSnippets.map((snip) => (
                          <SnippetCard
                            key={snip.id}
                            snip={snip}
                            isEditing={editingSnippetId === snip.id}
                            categories={categories}
                            editTitle={editTitle}
                            editContent={editContent}
                            editCategory={editCategory}
                            onChangeEditTitle={setEditTitle}
                            onChangeEditContent={setEditContent}
                            onChangeEditCategory={setEditCategory}
                            onStartEdit={handleStartEdit}
                            onSaveEdit={handleSaveEdit}
                            onCancelEdit={() => setEditingSnippetId(null)}
                            onDelete={handleDeleteSnippet}
                            onCopy={handleCopy}
                            copiedId={copiedId}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/45 max-w-md mx-auto mt-6">
                        <IconTags className="size-10 text-muted-foreground/35 mx-auto animate-pulse" />
                        <div className="space-y-1 mt-3">
                          <h3 className="font-heading text-sm font-bold text-foreground">
                            Aset Siap Pakai tidak ditemukan
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                            Tidak ada aset dengan kombinasi filter kategori atau
                            tag yang Anda pilih. Coba reset filter atau buat
                            baru!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddDialogOpen(true)}
                          className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground px-4 text-xs font-bold transition-all shadow-sm cursor-pointer select-none"
                        >
                          <IconPlus className="size-4" />
                          Buat Aset Siap Pakai Baru
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </m.div>
            )}

            {activeTab === "raw_ideas" && (
              <m.div
                key="raw_ideas"
                variants={tabPanelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4 animate-in fade-in duration-200"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rawIdeas.length > 0 ? (
                    rawIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={[
                                "px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm select-none",
                                platformColorMap[idea.platform] ?? "bg-primary",
                              ].join(" ")}
                            >
                              {idea.platform}
                            </span>
                            <span className="text-[10px] text-muted-foreground select-none">
                              {idea.createdAt}
                            </span>
                          </div>
                          <h4 className="font-heading text-sm font-bold text-foreground leading-snug line-clamp-3">
                            {idea.title}
                          </h4>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40 mt-auto">
                          <button
                            type="button"
                            onClick={() => deleteRawIdea(idea.id)}
                            className="p-2 rounded-md border border-border hover:border-red-500/20 hover:bg-red-500/5 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                            title="Hapus Ide"
                          >
                            <IconTrash className="size-4" />
                          </button>
                          <Link
                            href={`/brainstorm?idea=${encodeURIComponent(idea.title)}&platform=${encodeURIComponent(idea.platform)}`}
                            className="flex-1 flex items-center justify-center gap-1.5 h-8.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-sm select-none cursor-pointer"
                          >
                            <IconSparkles className="size-3.5 animate-pulse" />
                            Kembangkan Ide
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-xl border border-dashed border-border/80 bg-card/45 p-8 text-center space-y-4 max-w-md mx-auto mt-6">
                      <IconBulb className="size-10 text-muted-foreground/35 mx-auto animate-pulse" />
                      <div className="space-y-1">
                        <h3 className="font-heading text-sm font-bold text-foreground">
                          Belum ada ide tersimpan
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                          Catat ide cepat dari menu FAB (`+`) di pojok kanan
                          bawah atau dari Quick Capture di Dashboard.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </m.div>
            )}

            {activeTab === "history" && (
              <m.div
                key="history"
                variants={tabPanelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]"
              >
                <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 h-fit">
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Recent Updates & Synchronizations
                  </h3>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-4 h-fit bg-primary/5 border-primary/20">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                    Asset Synchronization
                  </h4>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Premium Dialog Confirmation: Library Item Deletion */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-heading text-sm font-bold text-foreground">
                  {itemToDelete?.type === "template"
                    ? "Hapus Templat Konten"
                    : "Hapus Aset Siap Pakai"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-2">
                  Apakah Anda yakin ingin menghapus{" "}
                  {itemToDelete?.type === "template"
                    ? "templat konten"
                    : "aset siap pakai"}{" "}
                  <strong>"{itemToDelete?.title}"</strong>? Tindakan ini dapat
                  dibatalkan melalui tombol 'Undo' pada notifikasi setelah
                  dihapus.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 border-t border-border/40 pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="px-3 py-1.5 rounded border border-border bg-background hover:bg-muted text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Hapus {itemToDelete?.type === "template" ? "Templat" : "Aset"}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <AddSnippetDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onSave={addSnippetDirect}
          />
        </div>
      </div>
    </PageTransition>
  );
}
