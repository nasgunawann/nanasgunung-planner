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
  BrandInstagramIcon,
  BrandTiktokIcon,
  BrandYoutubeIcon,
  BrandLinkedinIcon,
} from "@/components/brand-icons";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import QuickAddModal from "@/components/quick-add-modal";
import PageTransition from "@/components/page-transition";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      ? drafts.filter((draft) => draft.date && draft.date.startsWith(key))
      : [];
  }

  const platformIconMap: Record<string, any> = {
    Instagram: BrandInstagramIcon,
    TikTok: BrandTiktokIcon,
    YouTube: BrandYoutubeIcon,
    LinkedIn: BrandLinkedinIcon,
  };

  const categoryOptions = ["Stories", "Reels", "Post"];
  const statusOptions = ["Draft", "In progress", "Published"];

  function openDay(date: Date) {
    setSelectedDate(date);
  }

  function closeModal() {
    setSelectedDate(null);
  }

  function renderDraftTooltip(item: (typeof drafts)[number]) {
    const status = normalizeStatus(item.status);
    const statusTheme = statusAccentMap[status] ?? statusAccentMap.Default;

    return (
      <div className="space-y-1.5 text-left">
        <div className="space-y-0.5">
          <p className="font-semibold leading-tight text-sm">{item.title}</p>
          <p className="text-[11px] leading-tight opacity-80">
            {item.platform ?? "Platform belum ditentukan"}
            {item.category ? ` · ${item.category}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          {item.status ? (
            <span
              className={[
                "rounded-full border px-1.5 py-0.5 font-semibold",
                statusTheme.bg,
                statusTheme.chipText,
                statusTheme.border,
              ].join(" ")}
            >
              {item.status}
            </span>
          ) : null}
          {item.date ? (
            <span className="rounded-full border border-current/20 px-1.5 py-0.5 opacity-80">
              {format(new Date(`${item.date}T00:00:00`), "d MMM yyyy", {
                locale: id,
              })}
            </span>
          ) : null}
          {item.updatedAt ? (
            <span className="rounded-full border border-current/20 px-1.5 py-0.5 opacity-80">
              Updated {item.updatedAt}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
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
                  setCurrentMonth(
                    new Date(now.getFullYear(), now.getMonth(), 1),
                  );
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
                        <Tooltip key={item.id} delayDuration={120}>
                          <TooltipTrigger asChild>
                            <Link
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
                              <div className="flex items-center gap-1 min-w-0">
                                {Icon ? (
                                  <Icon
                                    className="size-3.5 shrink-0"
                                    aria-hidden
                                  />
                                ) : null}
                                <span className="truncate flex-1">
                                  {item.title}
                                </span>
                              </div>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={8}>
                            {renderDraftTooltip(item)}
                          </TooltipContent>
                        </Tooltip>
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

        {/* Premium Unified Scheduling Modal */}
        <QuickAddModal
          isOpen={!!selectedDate}
          onClose={closeModal}
          defaultDate={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
        />
      </div>
    </PageTransition>
  );
}
