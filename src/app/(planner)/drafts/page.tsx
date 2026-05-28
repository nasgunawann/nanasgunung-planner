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
  IconEdit,
  IconPlus,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

const platformIconMap: Record<string, ComponentType<{ className?: string }>> = {
  Instagram: IconBrandInstagram,
  LinkedIn: IconBrandLinkedin,
  TikTok: IconBrandTiktok,
  YouTube: IconBrandYoutube,
};

export default function DraftsPage() {
  const { drafts, deleteDraft, addDraft } = useDrafts();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const platformOptions = ["All", "Instagram", "TikTok", "LinkedIn", "YouTube"];
  const statusTabOptions = ["All", "Draft", "In progress", "Published"];

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

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

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Simple Control Panel */}
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] bg-card border border-border/60 p-3 rounded-lg shadow-sm">
        {/* Search */}
        <div className="relative flex items-center">
          <IconSearch className="absolute left-3 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search title, platform, outline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-4 text-xs outline-none focus:border-primary/50"
          />
        </div>

        {/* Platform Dropdown */}
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-primary/50"
        >
          {platformOptions.map((plat) => (
            <option key={plat} value={plat}>
              {plat === "All" ? "All Platforms" : plat}
            </option>
          ))}
        </select>

        {/* Add Draft Shortcut */}
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            addDraft({
              title: "New Draft Concept",
              platform: selectedPlatform !== "All" ? selectedPlatform : "Instagram",
              category: "Post",
              status: "Draft",
              content: "",
              date: dateStr,
            });
          }}
          className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors"
        >
          <IconPlus className="size-3.5" />
          Add Draft
        </button>
      </div>

      {/* Simple Status Filter Tabs */}
      <div className="flex gap-1.5 border-b border-border/60 pb-1 text-xs">
        {statusTabOptions.map((statusTab) => (
          <button
            key={statusTab}
            type="button"
            onClick={() => setSelectedStatus(statusTab)}
            className={[
              "px-3 py-1.5 font-semibold uppercase tracking-wider rounded-t-md transition-colors -mb-1 border-b-2",
              selectedStatus === statusTab
                ? "border-primary text-foreground bg-primary/5 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {statusTab}
          </button>
        ))}
      </div>

      {/* Accordion list */}
      {filteredDrafts.length > 0 ? (
        <div className="space-y-2">
          {filteredDrafts.map((d) => {
            const status = normalizeStatus(d.status);
            const statusTheme = statusAccentMap[status] ?? statusAccentMap.Default;
            const Icon = platformIconMap[d.platform ?? ""];
            const isExpanded = expandedId === d.id;

            return (
              <div
                key={d.id}
                className={[
                  "rounded-lg border border-border/60 bg-card overflow-hidden transition-all",
                  isExpanded ? "border-primary/45 shadow-sm" : "hover:border-border",
                ].join(" ")}
              >
                {/* Horizontal compact row (Header) */}
                <button
                  type="button"
                  onClick={() => toggleExpand(d.id)}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-muted/15"
                >
                  {/* Left: Platform Icon + Title */}
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
                    <h3 className="truncate text-sm font-bold font-heading text-foreground leading-tight">
                      {d.title}
                    </h3>
                  </div>

                  {/* Middle & Right: Unified Badges, Date, and Chevron */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] sm:shrink-0">
                    {/* Platform Badge */}
                    {d.platform ? (
                      <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-md font-bold uppercase tracking-wider leading-none">
                        {d.platform}
                      </span>
                    ) : null}

                    {/* Category Badge */}
                    {d.category ? (
                      <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-md font-bold uppercase tracking-wider leading-none">
                        {contentCategoryLabelMap[d.category] ?? d.category}
                      </span>
                    ) : null}

                    {/* Status Badge */}
                    <span
                      className={[
                        "border px-2 py-0.5 rounded-md font-bold uppercase tracking-wider leading-none",
                        statusTheme.bg,
                        statusTheme.chipText,
                        statusTheme.border,
                      ].join(" ")}
                    >
                      {status}
                    </span>

                    {/* Date */}
                    <span className="text-[11px] font-mono text-muted-foreground px-1 bg-muted/40 rounded">
                      {d.date || "No date"}
                    </span>

                    {/* Expand indicator */}
                    <span className="text-muted-foreground/60 p-0.5">
                      {isExpanded ? (
                        <IconChevronUp className="size-4" />
                      ) : (
                        <IconChevronDown className="size-4" />
                      )}
                    </span>
                  </div>
                </button>

                {/* Expanded Script Outline Tray */}
                {isExpanded ? (
                  <div className="border-t border-border/40 bg-muted/5 p-4 space-y-3 animate-in slide-in-from-top-1 duration-150">
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex justify-between">
                        <span>Script & Storyboard Outline</span>
                        <span className="font-normal font-mono text-[9px]">Last modified {d.updatedAt}</span>
                      </div>
                      <div className="rounded border border-border/50 bg-background p-3 text-[11px] text-muted-foreground font-mono leading-relaxed whitespace-pre-line max-h-[160px] overflow-y-auto">
                        {d.content || (
                          <span className="italic text-muted-foreground/35">
                            No storyboard script added yet. Click edit to draft content.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tray actions */}
                    <div className="flex justify-end gap-2 border-t border-border/40 pt-2.5">
                      <Link
                        href={`/drafts/${d.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 rounded-md border border-border bg-background hover:bg-muted px-2.5 py-1 text-xs font-semibold text-foreground transition-colors"
                      >
                        <IconEdit className="size-3.5" />
                        Edit Draft
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${d.title}"? This cannot be undone.`)) {
                            deleteDraft(d.id);
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-md border border-red-500/10 bg-background hover:bg-red-500/5 px-2.5 py-1 text-xs font-semibold text-red-500 transition-colors"
                      >
                        <IconTrash className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 p-10 text-center bg-card">
          <p className="text-sm font-bold">No matching drafts found</p>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[280px]">
            Try adjusting search queries or select different platform/status filters.
          </p>
        </div>
      )}
    </div>
  );
}
