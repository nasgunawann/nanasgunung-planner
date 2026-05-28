"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconSparkles,
  IconCalendarEvent,
  IconPencil,
  IconBooks,
  IconPlus,
  IconLayoutDashboard,
  IconX,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDrafts } from "@/lib/drafts";

const navItems = [
  { href: "/calendar", label: "Calendar", icon: IconCalendarEvent },
  { href: "/drafts", label: "Drafts", icon: IconPencil },
  { href: "/brainstorm", label: "Brainstorm", icon: IconSparkles },
  { href: "/library", label: "Library", icon: IconBooks },
];

const pageHeaders: Record<string, { title: string; actionLabel?: string }> = {
  "/calendar": {
    title: "Calendar",
    actionLabel: "Today",
  },
  "/drafts": {
    title: "Drafts",
  },
  "/brainstorm": {
    title: "Brainstorm",
  },
  "/library": {
    title: "Library",
  },
};

export default function PlannerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const { addDraft } = useDrafts();

  const activePageHeader =
    Object.entries(pageHeaders).find(([route]) =>
      pathname?.startsWith(route),
    )?.[1] ?? pageHeaders["/calendar"];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="flex min-h-screen w-full gap-0 lg:gap-6">
        <aside className="sticky top-0 hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen h-screen w-[220px] shrink-0 border-r border-border/70 bg-background/80 px-4 py-6 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <IconLayoutDashboard className="size-4" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">Nanasgunung</p>
              <p className="text-xs text-muted-foreground">Planner</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            <Button variant="outline" onClick={() => setIsQuickAddOpen(true)}>
              <IconPlus className="size-4" />
              New
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0 lg:ml-[220px]">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-lg sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-heading text-lg font-semibold">
                {activePageHeader.title}
              </h1>

              <div className="hidden items-center gap-2 md:flex">
                {activePageHeader.actionLabel ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsQuickAddOpen(true)}
                  >
                    {activePageHeader.actionLabel}
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={() => setIsQuickAddOpen(true)}>
                  <IconPlus className="size-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/92 backdrop-blur-lg lg:hidden">
        <div className="relative mx-auto max-w-[820px] px-3 pb-3 pt-3">
          <div className="grid grid-cols-5 items-end gap-1 rounded-xl bg-card/85 px-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium",
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground p-3 shadow-lg"
            aria-label="Quick add content"
          >
            <IconPlus className="size-5" />
          </button>
        </div>
      </div>

      {isQuickAddOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-3">
          <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border/60 bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">New draft</h2>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                aria-label="Close quick add"
              >
                <IconX className="size-5" />
              </button>
            </div>

            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget as HTMLFormElement;
                const title = (form.elements[0] as HTMLInputElement).value;
                const platform = (form.elements[1] as HTMLInputElement).value;

                try {
                  addDraft({ title, platform });
                } catch (e) {
                  // ignore
                }

                setIsQuickAddOpen(false);
              }}
            >
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
                placeholder="Title"
                name="title"
              />
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
                placeholder="Platform (Instagram, TikTok)"
                name="platform"
              />
              <div className="flex justify-end">
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
