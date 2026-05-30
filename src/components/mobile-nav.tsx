"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav";
import { iconMap } from "@/lib/icon-map";

export default function MobileNav({ onQuickAdd }: { onQuickAdd?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card lg:hidden">
      <div className="relative mx-auto max-w-[820px] px-2 pb-2 pt-2">
        <div className="grid grid-cols-5 items-end gap-1 rounded-xl bg-card px-1 py-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.iconName as keyof typeof iconMap];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-1 text-[11px] font-medium",
                  isActive(item.href)
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
