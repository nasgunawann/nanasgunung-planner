"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav";
import { iconMap } from "@/lib/icon-map";

export default function MobileNav({ onQuickAdd }: { onQuickAdd: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/92 backdrop-blur-lg lg:hidden">
      <div className="relative mx-auto max-w-[820px] px-2 pb-2 pt-2">
        <div className="grid grid-cols-5 items-end gap-1 rounded-xl bg-card/85 px-1 py-1">
          {[0, 1, 2, 3, 4].map((slot) => {
            const placement =
              slot === 2
                ? null
                : slot < 2
                  ? navItems[slot]
                  : navItems[slot - 1];

            if (!placement) {
              return <div key={`slot-${slot}`} />;
            }

            const Icon = iconMap[placement.iconName as keyof typeof iconMap];

            return (
              <Link
                key={placement.href}
                href={placement.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-1 text-[11px] font-medium",
                  isActive(placement.href)
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {placement.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onQuickAdd}
          className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground w-14 h-14 shadow-lg ring-2 ring-border/20"
          aria-label="Quick add content"
        >
          <IconPlus className="size-6" />
        </button>
      </div>
    </div>
  );
}
