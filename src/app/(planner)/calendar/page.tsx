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

  function openDay(date: Date) {
    setSelectedDate(date);
  }

  function closeModal() {
    setSelectedDate(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setCurrentMonth((date) => subMonths(date, 1))}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth((date) => addMonths(date, 1))}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          Next
        </button>
      </div>

      <div className="rounded-md border border-border/60 bg-card/75 p-3">
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
                    "min-h-24 rounded-md border p-2 text-left text-sm transition-colors",
                    activeMonth
                      ? "border-border/50 bg-background"
                      : "border-border/30 bg-muted/20 text-muted-foreground",
                    isToday(date) ? "ring-1 ring-primary" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{format(date, "d")}</span>
                    {items.length > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {items.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 space-y-1">
                    {items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-md bg-muted/40 px-2 py-1 text-xs"
                      >
                        <div className="font-medium">{item.title}</div>
                        <div className="text-muted-foreground">
                          {item.platform} • {item.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
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
