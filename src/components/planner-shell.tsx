"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";
import QuickAddModal from "@/components/quick-add-modal";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { pageHeaders } from "@/lib/nav";

export default function PlannerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const activePageHeader =
    Object.entries(pageHeaders).find(([route]) =>
      pathname?.startsWith(route),
    )?.[1] ?? pageHeaders["/calendar"];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="flex min-h-screen w-full gap-0 lg:gap-6">
        <Sidebar onQuickAdd={() => setIsQuickAddOpen(true)} />

        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0 lg:ml-[220px]">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-lg sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-heading text-lg font-semibold">
                {activePageHeader.title}
              </h1>

              <div className="hidden items-center gap-2 md:flex">
                <ThemeToggle />
                {activePageHeader.actionLabel ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsQuickAddOpen(true)}
                  >
                    {activePageHeader.actionLabel}
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={() => setIsQuickAddOpen(true)}>
                  <IconPlus className="size-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <ThemeToggle />
                <Button variant="ghost" onClick={() => setIsQuickAddOpen(true)}>
                  <IconPlus className="size-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>

      <MobileNav onQuickAdd={() => setIsQuickAddOpen(true)} />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
}
