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
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandYoutube,
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

const platformIconMap: Record<string, ComponentType<{ className?: string }>> = {
  Instagram: IconBrandInstagram,
  LinkedIn: IconBrandLinkedin,
  TikTok: IconBrandTiktok,
  YouTube: IconBrandYoutube,
};

export default function DraftsPage() {
  const { drafts, deleteDraft, addDraft, updateDraft } = useDrafts();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All"); // "All", "Today", "ThisWeek", "ThisMonth"

  // Pagination State - 10 items per page as requested
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const platformOptions = ["All", "Instagram", "TikTok", "LinkedIn", "YouTube"];
  const statusTabOptions = ["All", "Draft", "In progress", "Published"];
  const timeFilterOptions = [
    { value: "All", label: "Semua Waktu" },
    { value: "Today", label: "Hari Ini" },
    { value: "ThisWeek", label: "Minggu Ini" },
    { value: "ThisMonth", label: "Bulan Ini" },
  ];

  // Reset pagination on filter adjustments to prevent out-of-bound errors
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handlePlatformChange = (val: string) => {
    setSelectedPlatform(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleTimeChange = (val: string) => {
    setTimeFilter(val);
    setCurrentPage(1);
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

  return (
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
          onClick={() => {
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(
              now.getMonth() + 1
            ).padStart(2, "0")}-${String(now.getDate()).padStart(
              2,
              "0"
            )}T08:00`;
            addDraft({
              title: "New Draft Concept",
              platform:
                selectedPlatform !== "All" ? selectedPlatform : "Instagram",
              category: "Post",
              status: "Draft",
              content: "",
              date: dateStr,
            });
          }}
          className="flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-3 text-[11px] font-bold text-primary-foreground hover:bg-primary/95 transition-colors"
        >
          <IconPlus className="size-3" />
          Add Draft
        </button>
      </div>

      {/* Glanceable Drafts List */}
      {paginatedDrafts.length > 0 ? (
        <div className="space-y-2">
          {paginatedDrafts.map((d) => {
            const status = normalizeStatus(d.status);
            const statusTheme =
              statusAccentMap[status] ?? statusAccentMap.Default;
            const Icon = platformIconMap[d.platform ?? ""];

            return (
              <Link
                key={d.id}
                href={`/drafts/${d.id}`}
                className={[
                  "block rounded-lg border border-border/60 bg-card overflow-hidden transition-all hover:border-y-primary/40 hover:border-r-primary/40 hover:shadow-sm border-l-4",
                  statusTheme.border,
                ].join(" ")}
              >
                {/* Horizontal compact row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3">
                  {/* Left: Platform Icon + Title + Format Badge */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {Icon ? (
                      <span
                        className={[
                          "inline-flex size-6 items-center justify-center rounded-full shrink-0",
                          platformColorMap[d.platform ?? "Default"],
                        ].join(" ")}
                      >
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </span>
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
                            if (
                              confirm(`Delete "${d.title}"? This cannot be undone.`)
                            ) {
                              deleteDraft(d.id);
                            }
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
            );
          })}
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
    </div>
  );
}
