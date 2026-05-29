"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import { useDrafts, type Draft } from "@/lib/drafts";
import {
  contentCategoryLabelMap,
  platformColorMap,
  normalizeStatus,
  statusAccentMap,
} from "@/lib/platform-map";
import {
  BrandInstagramIcon,
  BrandTiktokIcon,
  BrandYoutubeIcon,
  BrandLinkedinIcon,
} from "@/components/brand-icons";
import {
  IconSearch,
  IconTrash,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  formatFriendlyIndonesianDate,
  isDateToday,
  isDateThisWeek,
  isDateThisMonth,
} from "@/lib/date-utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PageTransition from "@/components/page-transition";
import QuickAddModal from "@/components/quick-add-modal";
import { AnimatePresence, m } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const platformIconMap: Record<string, ComponentType<{ className?: string }>> = {
  Instagram: BrandInstagramIcon,
  LinkedIn: BrandLinkedinIcon,
  TikTok: BrandTiktokIcon,
  YouTube: BrandYoutubeIcon,
};

export default function DraftsPage() {
  const { drafts, deleteDraft, deleteDrafts, addDraft, updateDraft } = useDrafts();

  // Dialog Confirmation States
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [deletingDraft, setDeletingDraft] = useState<Draft | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All"); // "All", "Today", "ThisWeek", "ThisMonth"

  // Pagination State - 10 items per page as requested
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const platformOptions = ["All", "Instagram", "TikTok", "LinkedIn", "YouTube"];
  const statusTabOptions = ["All", "Draft", "In progress", "Published"];
  const timeFilterOptions = [
    { value: "All", label: "Semua Waktu" },
    { value: "Today", label: "Hari Ini" },
    { value: "ThisWeek", label: "Minggu Ini" },
    { value: "ThisMonth", label: "Bulan Ini" },
  ];

  // Reset pagination and selection on filter adjustments to prevent out-of-bound or hidden errors
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handlePlatformChange = (val: string) => {
    setSelectedPlatform(val);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleTimeChange = (val: string) => {
    setTimeFilter(val);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Filter Logic
  const filteredDrafts = drafts.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.content ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform =
      selectedPlatform === "All" || d.platform === selectedPlatform;

    const normalized = normalizeStatus(d.status);
    const matchesStatus =
      selectedStatus === "All" ||
      normalized.toLowerCase() === selectedStatus.toLowerCase();

    const matchesTime = (() => {
      if (timeFilter === "All") return true;
      if (timeFilter === "Today") return isDateToday(d.date);
      if (timeFilter === "ThisWeek") return isDateThisWeek(d.date);
      if (timeFilter === "ThisMonth") return isDateThisMonth(d.date);
      return true;
    })();

    return matchesSearch && matchesPlatform && matchesStatus && matchesTime;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredDrafts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDrafts = filteredDrafts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Bulk Actions Logic
  const isAllSelected =
    paginatedDrafts.length > 0 &&
    paginatedDrafts.every((d) => selectedIds.includes(d.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const currentPageIds = paginatedDrafts.map((d) => d.id);
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      const currentPageIds = paginatedDrafts.map((d) => d.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteOpen(true);
  };

  return (
    <PageTransition>
      <div className="space-y-4">
      {/* Consolidated Control Panel - Combined filters in a single sleek row */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-[2fr_1.2fr_1.2fr_1.2fr_auto] items-center bg-card border border-border/60 p-2 rounded-lg shadow-sm">
        {/* Search */}
        <div className="relative flex items-center">
          <IconSearch className="absolute left-2.5 size-3.5 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Cari draft..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 w-full bg-background pl-8 pr-3 text-[11px] outline-none"
          />
        </div>

        {/* Platform Dropdown */}
        <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
          <SelectTrigger className="h-8 text-[11px] bg-background w-full cursor-pointer border border-input">
            <SelectValue placeholder="Semua Platform" />
          </SelectTrigger>
          <SelectContent>
            {platformOptions.map((plat) => (
              <SelectItem key={plat} value={plat} className="text-[11px]">
                {plat === "All" ? "Semua Platform" : plat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Time Filter Dropdown */}
        <Select value={timeFilter} onValueChange={handleTimeChange}>
          <SelectTrigger className="h-8 text-[11px] bg-background w-full cursor-pointer border border-input">
            <SelectValue placeholder="Semua Waktu" />
          </SelectTrigger>
          <SelectContent>
            {timeFilterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Dropdown */}
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-8 text-[11px] bg-background w-full cursor-pointer border border-input">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            {statusTabOptions.map((statusTab) => (
              <SelectItem key={statusTab} value={statusTab} className="text-[11px]">
                {statusTab === "All" ? "Semua Status" : statusTab}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add Draft Shortcut */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-3 text-[11px] font-bold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
        >
          <IconPlus className="size-3" />
          Add Draft
        </button>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence initial={false}>
        {selectedIds.length > 0 && (
          <m.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 8 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{
              type: "tween",
              ease: [0.16, 1, 0.3, 1],
              duration: 0.22,
            }}
            className="overflow-hidden w-full"
          >
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 p-2 rounded-lg text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground/80">
                  {selectedIds.length} Draft terpilih
                </span>
                <span className="text-muted-foreground font-medium">|</span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="font-semibold text-primary hover:underline text-[11px] cursor-pointer"
                >
                  {isAllSelected ? "Batal Pilih Semua" : "Pilih Semua"}
                </button>
                <span className="text-muted-foreground font-medium">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="font-semibold text-muted-foreground hover:text-foreground hover:underline text-[11px] cursor-pointer"
                >
                  Batal
                </button>
              </div>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex h-7 items-center justify-center gap-1 rounded bg-red-600 hover:bg-red-700 text-white px-3 text-[10px] font-bold transition-colors cursor-pointer shadow-sm"
              >
                <IconTrash className="size-3" />
                Hapus Terpilih ({selectedIds.length})
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Glanceable Drafts List */}
      {paginatedDrafts.length > 0 ? (
        <div className="w-full">
          <AnimatePresence initial={false}>
            {paginatedDrafts.map((d) => {
              const status = normalizeStatus(d.status);
              const statusTheme =
                statusAccentMap[status] ?? statusAccentMap.Default;
              const Icon = platformIconMap[d.platform ?? ""];

              return (
                <m.div
                  key={d.id}
                  initial={{ height: 0, opacity: 0, scale: 0.98, y: 4 }}
                  animate={{ height: "auto", opacity: 1, scale: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, scale: 0.98, y: -4 }}
                  transition={{
                    type: "tween",
                    ease: [0.16, 1, 0.3, 1],
                    duration: 0.22,
                  }}
                  className="overflow-hidden w-full"
                >
                  <div className="pb-2">
                    <Link
                      href={`/drafts/${d.id}`}
                      className={[
                        "block rounded-lg border border-border/60 bg-card overflow-hidden transition-all hover:border-y-primary/40 hover:border-r-primary/40 hover:shadow-sm border-l-4",
                        statusTheme.border,
                      ].join(" ")}
                    >
                {/* Horizontal compact row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3">
                  {/* Left: Checkbox + Platform Icon + Title + Format Badge */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Custom styled select checkbox */}
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSelect(d.id);
                      }}
                      className={[
                        "size-4 shrink-0 rounded border cursor-pointer flex items-center justify-center transition-all duration-150",
                        selectedIds.includes(d.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-background hover:border-muted-foreground/60",
                      ].join(" ")}
                    >
                      {selectedIds.includes(d.id) && (
                        <svg className="size-2.5 fill-none stroke-current stroke-[3.5px]" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    {Icon ? (
                      <Icon className="size-6 shrink-0" />
                    ) : null}

                    {/* Truncated Title for perfect spacing */}
                    <h3 className="truncate text-sm font-bold font-heading text-foreground leading-tight max-w-[140px] sm:max-w-[280px] md:max-w-[380px]">
                      {d.title}
                    </h3>

                    {/* Format/Category Badge nestled inline */}
                    {d.category ? (
                      <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px] leading-none shrink-0">
                        {contentCategoryLabelMap[d.category] ?? d.category}
                      </span>
                    ) : null}
                  </div>

                  {/* Right: Status Dropdown, Friendly Date, and Delete Button */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] sm:shrink-0">
                    {/* Interactive Quick Status Dropdown */}
                    <select
                      value={status}
                      onClick={(e) => {
                        e.preventDefault(); // Prevents navigating to detail page
                        e.stopPropagation(); // Prevents link event bubbling
                      }}
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateDraft(d.id, { status: e.target.value });
                      }}
                      className={[
                        "border px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] leading-none cursor-pointer bg-transparent outline-none focus:ring-1 focus:ring-primary/40 transition-colors duration-150 select-none",
                        statusTheme.bg,
                        statusTheme.chipText,
                        statusTheme.border,
                      ].join(" ")}
                    >
                      <option
                        value="Draft"
                        className="bg-background text-foreground font-sans uppercase font-bold text-[10px]"
                      >
                        Draft
                      </option>
                      <option
                        value="In progress"
                        className="bg-background text-foreground font-sans uppercase font-bold text-[10px]"
                      >
                        In progress
                      </option>
                      <option
                        value="Published"
                        className="bg-background text-foreground font-sans uppercase font-bold text-[10px]"
                      >
                        Published
                      </option>
                    </select>

                    {/* Friendly Localized Date */}
                    <span className="text-[11px] font-medium text-muted-foreground px-2 py-0.5 bg-muted/40 border border-border/40 rounded-md">
                      {formatFriendlyIndonesianDate(d.date)}
                    </span>

                    {/* Quick Delete button with shadcn Tooltip (Stops link navigation) */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault(); // Prevents navigating to the detail workspace
                            e.stopPropagation(); // Prevents event bubbling
                            setDeletingDraft(d);
                          }}
                          className="p-1 rounded text-muted-foreground/35 hover:text-red-500 hover:bg-red-500/5 transition-all ml-1 shrink-0 cursor-pointer"
                        >
                          <IconTrash className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="text-[10px] px-2 py-1 font-semibold select-none">
                        Hapus Draft
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                  </Link>
                </div>
              </m.div>
            );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 p-10 text-center bg-card">
          <p className="text-sm font-bold">No matching drafts found</p>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[280px]">
            Try adjusting search queries or select different platform/status
            filters.
          </p>
        </div>
      )}

      {/* Pagination Controls - Placed at the bottom-left with compact chevrons */}
      {totalPages > 1 ? (
        <div className="flex justify-start items-center border-t border-border/60 pt-4 mt-6">
          <div className="flex items-center gap-2 bg-muted/40 p-1 border border-border/40 rounded-lg shadow-sm">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:hover:bg-card"
              title="Halaman Sebelumnya"
            >
              <IconChevronLeft className="size-3.5" />
            </button>
            <span className="text-[11px] text-muted-foreground font-mono font-bold px-2 select-none">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:hover:bg-card"
              title="Halaman Berikutnya"
            >
              <IconChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}
      {/* Dialog Confirmation: Single Draft Deletion */}
      <Dialog open={deletingDraft !== null} onOpenChange={(open) => { if (!open) setDeletingDraft(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-sm font-bold text-foreground">Hapus Draft</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2">
              Apakah Anda yakin ingin menghapus draft <strong>"{deletingDraft?.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 border-t border-border/40 pt-3 mt-4">
            <button
              type="button"
              onClick={() => setDeletingDraft(null)}
              className="px-3 py-1.5 rounded border border-border bg-background hover:bg-muted text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (deletingDraft) {
                  deleteDraft(deletingDraft.id);
                  setDeletingDraft(null);
                }
              }}
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Hapus Draft
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmation: Bulk Drafts Deletion */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-sm font-bold text-foreground">Hapus Massal Draft</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2">
              Apakah Anda yakin ingin menghapus <strong>{selectedIds.length} draft</strong> terpilih secara permanen? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 border-t border-border/40 pt-3 mt-4">
            <button
              type="button"
              onClick={() => setIsBulkDeleteOpen(false)}
              className="px-3 py-1.5 rounded border border-border bg-background hover:bg-muted text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                deleteDrafts(selectedIds);
                setSelectedIds([]);
                setIsBulkDeleteOpen(false);
              }}
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Hapus Semua ({selectedIds.length})
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Unified Add Draft Modal */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultPlatform={selectedPlatform !== "All" ? selectedPlatform : "Instagram"}
      />
      </div>
    </PageTransition>
  );
}
