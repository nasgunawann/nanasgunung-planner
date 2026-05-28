"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import { useDrafts } from "@/lib/drafts";
import {
  normalizeStatus,
  platformColorMap,
  statusAccentMap,
} from "@/lib/platform-map";
import {
  IconChevronLeft,
  IconChevronRight,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  IconBrandLinkedin,
} from "@tabler/icons-react";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { drafts, addDraft } = useDrafts();
  const [currentMonth, setCurrentMonth] = useState(() => new Date(2026, 4, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const monthLabel = format(currentMonth, "LLLL yyyy", { locale: id });

  function itemsForDate(date: Date) {
    const key = format(date, "yyyy-MM-dd");
    return Array.isArray(drafts)
      ? drafts.filter((draft) => draft.date === key)
      : [];
  }

  const platformIconMap: Record<string, any> = {
    Instagram: IconBrandInstagram,
    TikTok: IconBrandTiktok,
    YouTube: IconBrandYoutube,
    LinkedIn: IconBrandLinkedin,
  };

  const categoryOptions = ["Stories", "Reels", "Post"];
  const statusOptions = ["Draft", "In progress", "Published"];

  function openDay(date: Date) {
    setSelectedDate(date);
  }

  function closeModal() {
    setSelectedDate(null);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/60 bg-card p-3">
        {/* Header Calendar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCurrentMonth((date) => subMonths(date, 1))}
              className="rounded-md border border-border bg-background hover:bg-muted px-2 py-1 text-sm transition-colors"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Today"
              onClick={() => {
                const now = new Date();
                setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
              }}
              className="rounded-md border border-border bg-background hover:bg-muted px-3 py-1 text-sm font-medium transition-colors"
            >
              Today
            </button>

            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCurrentMonth((date) => addMonths(date, 1))}
              className="rounded-md border border-border bg-background hover:bg-muted px-2 py-1 text-sm transition-colors"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-2 py-1 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid - ALWAYS visible */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date) => {
            const activeMonth = isSameMonth(date, currentMonth);
            const dateKey = format(date, "yyyy-MM-dd");
            const items = itemsForDate(date);
            const today = isToday(date);

            return (
              <div
                key={dateKey}
                onClick={() => openDay(date)}
                className={[
                  "relative min-h-[110px] overflow-hidden rounded-md border p-1 pt-7 text-left text-sm transition-all outline-none cursor-pointer",
                  activeMonth
                    ? "border-border/50 bg-background hover:border-primary/40"
                    : "border-border/10 bg-muted/20 text-muted-foreground/40 opacity-60",
                  today
                    ? "ring-2 ring-primary border-primary bg-primary/5"
                    : "",
                ].join(" ")}
              >
                {/* Date Number Badge */}
                <div
                  className={[
                    "absolute left-1/2 top-1.5 -translate-x-1/2 rounded-full px-2 py-0.5 text-xs font-bold transition-colors",
                    today
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : activeMonth
                      ? "bg-muted text-foreground"
                      : "bg-muted/30 text-muted-foreground/50",
                  ].join(" ")}
                >
                  {format(date, "d")}
                </div>

                {/* Items/Drafts List inside Date Block */}
                <div className="space-y-1 mt-1">
                  {items.slice(0, 2).map((item) => {
                    const status = normalizeStatus(item.status);
                    const statusTheme =
                      statusAccentMap[status] ?? statusAccentMap.Default;
                    const Icon = platformIconMap[item.platform ?? ""];

                    return (
                      <Link
                        key={item.id}
                        href={`/drafts/${item.id}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Stop opening the "New Draft" modal
                        }}
                        className={[
                          "block rounded px-1.5 py-0.5 text-[10px] leading-tight font-medium overflow-hidden truncate transition-colors hover:opacity-90",
                          statusTheme.bg,
                          statusTheme.chipText,
                          "border",
                          statusTheme.border,
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-1">
                          {Icon ? (
                            <span
                              className={[
                                "inline-flex items-center justify-center rounded-full p-0.5 scale-75",
                                platformColorMap[item.platform ?? "Default"],
                              ].join(" ")}
                              aria-hidden
                            >
                              <Icon className="h-3 w-3 text-white" />
                            </span>
                          ) : null}
                          <span className="truncate flex-1">{item.title}</span>
                        </div>
                      </Link>
                    );
                  })}

                  {items.length > 2 ? (
                    <div className="px-1.5 text-[9px] font-bold text-muted-foreground">
                      +{items.length - 2} more
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Scheduling Modal (with Script/Storyboard Support) */}
      {selectedDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-3">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold">
                  Schedule New Content
                </h3>
                <p className="text-xs text-muted-foreground">
                  Planned for {format(selectedDate, "PP")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-border bg-background hover:bg-muted px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>

            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget as HTMLFormElement;
                const title = (
                  form.elements.namedItem("title") as HTMLInputElement | null
                )?.value.trim();
                const platform = (
                  form.elements.namedItem("platform") as HTMLSelectElement | null
                )?.value.trim();
                const category = (
                  form.elements.namedItem("category") as HTMLSelectElement | null
                )?.value.trim();
                const status = (
                  form.elements.namedItem("status") as HTMLSelectElement | null
                )?.value.trim();
                const content = (
                  form.elements.namedItem("content") as HTMLTextAreaElement | null
                )?.value.trim();

                if (!title) return;

                addDraft({
                  title,
                  platform: platform || "Instagram",
                  category: category || "Post",
                  status: status || "Draft",
                  content: content || "",
                  date: format(selectedDate, "yyyy-MM-dd") + "T08:00",
                });

                closeModal();
              }}
            >
              {/* Title Field */}
              <div className="grid gap-1">
                <label htmlFor="title" className="text-xs font-semibold text-muted-foreground">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  placeholder="e.g. Next.js Refactoring Reels"
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                />
              </div>

              {/* Grid for Platform and Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label htmlFor="platform" className="text-xs font-semibold text-muted-foreground">
                    Platform
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>

                <div className="grid gap-1">
                  <label htmlFor="category" className="text-xs font-semibold text-muted-foreground">
                    Format/Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Selector */}
              <div className="grid gap-1">
                <label htmlFor="status" className="text-xs font-semibold text-muted-foreground">
                  Workflow Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Script / Storyboard - Prep for Rich-Text Editor */}
              <div className="grid gap-1">
                <label htmlFor="content" className="text-xs font-semibold text-muted-foreground flex justify-between">
                  <span>Script & Outline</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(Rich text prep)</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  placeholder="Hook: Stop coding React state...&#10;Scene 1: Close up of laptop...&#10;Scene 2: Transition..."
                  className="rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary/50 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-border/60 pt-3 mt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-border bg-background hover:bg-muted px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Create & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
