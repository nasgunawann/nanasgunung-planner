"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import ThemeToggle from "@/components/theme-toggle";
import QuickAddModal from "@/components/quick-add-modal";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
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

            <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden lg:block">
              <Button
                variant="default"
                size="icon-lg"
                onClick={() => setIsQuickAddOpen(true)}
                aria-label="Quick add content"
                className="pointer-events-auto size-14 rounded-full shadow-lg ring-2 ring-border/20"
              >
                <IconPlus className="size-6" />
              </Button>
            </div>
          </div>
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
