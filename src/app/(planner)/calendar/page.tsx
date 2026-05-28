"use client";

import { useMemo, useState } from "react";
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

  const monthHasItems = useMemo(() => {
    return days.some(
      (d) => isSameMonth(d, currentMonth) && itemsForDate(d).length > 0,
    );
  }, [days, currentMonth, drafts]);

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

  function openDay(date: Date) {
    setSelectedDate(date);
  }

  function closeModal() {
    setSelectedDate(null);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/60 bg-card/75 p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{monthLabel}</h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCurrentMonth((date) => subMonths(date, 1))}
              className="rounded-md border border-border px-2 py-1 text-sm"
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
              className="rounded-md border border-border px-3 py-1 text-sm"
            >
              Today
            </button>

            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCurrentMonth((date) => addMonths(date, 1))}
              className="rounded-md border border-border px-2 py-1 text-sm"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-2 py-1 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {monthHasItems ? (
          <div className="mt-3 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-7 gap-2">
              {days.map((date) => {
                const activeMonth = isSameMonth(date, currentMonth);
                const dateKey = format(date, "yyyy-MM-dd");
                const items = itemsForDate(date);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => openDay(date)}
                    className={[
                      "relative min-h-28 overflow-hidden rounded-md border p-2 pt-8 text-left text-sm transition-colors",
                      activeMonth
                        ? "border-border/50 bg-background"
                        : "border-border/10 bg-muted/5 dark:bg-muted/5 text-muted-foreground/60 dark:text-muted-foreground/60 opacity-70",
                      isToday(date)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "absolute left-1/2 top-2 -translate-x-1/2 rounded-full px-2 py-0.5 text-xs font-semibold",
                        isToday(date)
                          ? "bg-background/15 text-primary-foreground"
                          : "bg-muted/70 text-foreground",
                      ].join(" ")}
                    >
                      {format(date, "d")}
                    </div>

                    <div className="space-y-1">
                      {items.slice(0, 1).map((item) => {
                        const status = normalizeStatus(item.status);
                        const statusTheme =
                          statusAccentMap[status] ?? statusAccentMap.Default;
                        const Icon = platformIconMap[item.platform ?? ""];

                        return (
                          <div
                            key={item.id}
                            className={[
                              "rounded-md px-2 py-1 text-[11px] leading-tight",
                              statusTheme.bg,
                              statusTheme.chipText,
                            ].join(" ")}
                          >
                            <div className="flex items-center gap-2">
                              {Icon ? (
                                <span
                                  className={[
                                    "inline-flex items-center justify-center rounded-full p-1",
                                    platformColorMap[
                                      item.platform ?? "Default"
                                    ],
                                  ].join(" ")}
                                  aria-hidden
                                >
                                  <Icon className="h-4 w-4" />
                                </span>
                              ) : null}

                              <div className="min-w-0 flex-1">
                                <div className="truncate whitespace-nowrap font-medium">
                                  {item.title}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {items.length > 1 ? (
                        <div className="px-2 text-[10px] font-medium text-muted-foreground md:hidden">
                          +{items.length - 1} more
                        </div>
                      ) : null}

                      {items.slice(1, 2).map((item) => {
                        const status = normalizeStatus(item.status);
                        const statusTheme =
                          statusAccentMap[status] ?? statusAccentMap.Default;
                        const Icon = platformIconMap[item.platform ?? ""];

                        return (
                          <div
                            key={item.id}
                            className={[
                              "hidden rounded-md px-2 py-1 text-[11px] leading-tight md:block",
                              statusTheme.bg,
                              statusTheme.chipText,
                            ].join(" ")}
                          >
                            <div className="flex items-center gap-2">
                              {Icon ? (
                                <span
                                  className={[
                                    "inline-flex items-center justify-center rounded-full p-1",
                                    platformColorMap[
                                      item.platform ?? "Default"
                                    ],
                                  ].join(" ")}
                                  aria-hidden
                                >
                                  <Icon className="h-4 w-4" />
                                </span>
                              ) : null}

                              <div className="min-w-0 flex-1">
                                <div className="truncate whitespace-nowrap font-medium">
                                  {item.title}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {items.length > 2 ? (
                        <div className="hidden px-2 text-[10px] font-medium text-muted-foreground md:block">
                          +{items.length - 2} more
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-center rounded-md border border-border/60 bg-muted/10 p-6">
            <div className="max-w-xl text-center">
              <p className="mb-2 text-lg font-semibold">
                No items scheduled this month.
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                Add your first draft to get started.
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        1,
                      ),
                    )
                  }
                  className="rounded bg-primary px-4 py-2 text-white"
                >
                  Add event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-3">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-border/60 bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-semibold">
                  New draft
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, "PP")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-border px-3 py-2 text-sm"
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
                  form.elements.namedItem("platform") as HTMLInputElement | null
                )?.value.trim();

                if (!title) return;

                addDraft({
                  title,
                  platform,
                  date: format(selectedDate, "yyyy-MM-dd"),
                });

                closeModal();
              }}
            >
              <input
                name="title"
                placeholder="Title"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
              />
              <input
                name="platform"
                placeholder="Platform"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded bg-primary px-3 py-2 text-white"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
