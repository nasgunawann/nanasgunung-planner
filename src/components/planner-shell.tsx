"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  IconPlus,
  IconBulb,
  IconFilePlus,
  IconSparkleHighlight,
  IconTags,
} from "@tabler/icons-react";

import ThemeToggle from "@/components/theme-toggle";
import QuickAddModal from "@/components/quick-add-modal";
import AddSnippetDialog from "@/components/add-snippet-dialog";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { pageHeaders } from "@/lib/nav";
import { useDrafts } from "@/lib/drafts";
import { toast } from "sonner";
import { PlatformSelect } from "@/components/planner-selects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function AddRawIdeaModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addRawIdea } = useDrafts();
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("Instagram");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed) {
      addRawIdea(trimmed, platform);
      setTitle("");
      setPlatform("Instagram");
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm p-6 rounded-xl border border-border bg-background shadow-lg outline-none select-none">
        <DialogHeader>
          <DialogTitle className="font-heading text-sm font-bold text-foreground">
            Tambah Ide Baru
            <p className="text-xs text-muted-foreground font-normal mt-1">
              Ide bisa diakses di menu Pustaka
            </p>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Judul Ide
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tulis ide (misal: Tips untuk sukses)..."
              className="h-10 text-xs sm:text-sm bg-background outline-none border border-border/80 rounded-md p-3"
              required
              autoFocus
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Platform Sosial
            </label>
            <PlatformSelect
              value={platform}
              onValueChange={setPlatform}
              className="h-10 text-xs sm:text-sm bg-background cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-border/40 pt-3 mt-4">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button size="sm" type="submit">
              Simpan Ide
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GlobalAiLoadingIndicator() {
  const { isGenerating, displayProgress } = useDrafts();

  if (!isGenerating) return null;

  return (
    <Link
      href="/brainstorm"
      className="ai-accent fixed bottom-6 right-6 lg:right-24 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold ring-4 ring-primary/20 transition-all select-none animate-pulse shrink-0 touch-manipulation cursor-pointer"
    >
      <IconSparkleHighlight className="size-4 animate-spin" />
      <span>AI Agent: {Math.round(displayProgress)}%</span>
    </Link>
  );
}

// --- Premium Animated Speed Dial FAB ---
export function SpeedDialFab({
  onAddDraft,
  onAddIdea,
  onAddSnippet,
}: {
  onAddDraft: () => void;
  onAddIdea: () => void;
  onAddSnippet: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden lg:block select-none">
      <div className="relative flex flex-col items-end gap-3">
        {/* Speed Dial Menu Actions Column */}
        <AnimatePresence>
          {isExpanded && (
            <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3">
              {/* Action 1: Add Raw Idea */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ duration: 0.15, delay: 0.08 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    onAddIdea();
                    setIsExpanded(false);
                  }}
                  className="pointer-events-auto shrink-0 rounded-full bg-card px-3.5 py-2.5 text-xs font-bold shadow-lg transition-all hover:bg-muted sm:text-sm whitespace-nowrap"
                >
                  <IconBulb className="size-4 text-amber-500 animate-pulse" />
                  <span>Tambah Ide</span>
                </Button>
              </motion.div>

              {/* Action 2: Add Ready-to-Use Snippet */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ duration: 0.15, delay: 0.04 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    onAddSnippet();
                    setIsExpanded(false);
                  }}
                  className="pointer-events-auto shrink-0 rounded-full bg-card px-3.5 py-2.5 text-xs font-bold shadow-lg transition-all hover:bg-muted sm:text-sm whitespace-nowrap"
                >
                  <IconTags className="size-4 text-emerald-500" />
                  <span>Tambah Aset Siap Pakai</span>
                </Button>
              </motion.div>

              {/* Action 3: Add Draft */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    onAddDraft();
                    setIsExpanded(false);
                  }}
                  className="pointer-events-auto shrink-0 rounded-full bg-card px-3.5 py-2.5 text-xs font-bold shadow-lg transition-all hover:bg-muted sm:text-sm whitespace-nowrap"
                >
                  <IconFilePlus className="size-4 text-primary" />
                  <span>Tambah Draft Konten</span>
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Floating Trigger Button */}
        <Button
          variant="default"
          size="icon-lg"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Quick actions menu"
          className="pointer-events-auto size-14 rounded-full shadow-lg ring-2 ring-border/20 z-50 flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 135 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-center"
          >
            <IconPlus className="size-6 text-primary-foreground" />
          </motion.div>
        </Button>
      </div>
    </div>
  );
}

export default function PlannerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAddIdeaOpen, setIsAddIdeaOpen] = useState(false);
  const [isSnippetDialogOpen, setIsSnippetDialogOpen] = useState(false);

  const activePageHeader =
    Object.entries(pageHeaders).find(([route]) =>
      pathname?.startsWith(route),
    )?.[1] ?? pageHeaders["/calendar"];

  const handleSaveSnippet = (newSnippet: {
    title: string;
    content: string;
    category: string;
  }) => {
    try {
      const stored = localStorage.getItem("nanas_snippets");
      const snippetsList = stored ? JSON.parse(stored) : [];
      const updatedSnippet = {
        id: `snip-${Date.now()}`,
        ...newSnippet,
        tags: [],
      };
      const updatedList = [updatedSnippet, ...snippetsList];
      localStorage.setItem("nanas_snippets", JSON.stringify(updatedList));

      // Trigger custom cross-component sync event
      window.dispatchEvent(new Event("nanas-library-updated"));

      toast.success(`Aset "${newSnippet.title}" berhasil ditambahkan!`);
    } catch (e) {
      toast.error("Gagal menambahkan aset ke Pustaka.");
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="flex min-h-screen w-full gap-0 lg:gap-6">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0 lg:ml-[220px]">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-heading text-lg font-semibold">
                {activePageHeader.title}
              </h1>

              <div className="hidden items-center gap-2 md:flex">
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <ThemeToggle />
              </div>
            </div>
          </header>

          <div className="relative min-w-0 flex-1">
            <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
              {children}
            </main>

            {/* Custom Speed Dial FAB Replacing Simple Button on Desktop */}
            <SpeedDialFab
              onAddDraft={() => setIsQuickAddOpen(true)}
              onAddIdea={() => setIsAddIdeaOpen(true)}
              onAddSnippet={() => setIsSnippetDialogOpen(true)}
            />

            {/* Centralized Background AI progress indicator */}
            <GlobalAiLoadingIndicator />
          </div>
        </div>
      </div>

      <MobileNav onQuickAdd={() => setIsQuickAddOpen(true)} />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      <AddRawIdeaModal
        isOpen={isAddIdeaOpen}
        onClose={() => setIsAddIdeaOpen(false)}
      />

      <AddSnippetDialog
        isOpen={isSnippetDialogOpen}
        onClose={() => setIsSnippetDialogOpen(false)}
        onSave={handleSaveSnippet}
      />
    </div>
  );
}
