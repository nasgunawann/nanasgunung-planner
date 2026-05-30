"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav";
import { iconMap } from "@/lib/icon-map";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <aside className="sticky top-0 hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen h-screen w-[220px] shrink-0 border-r border-border/70 bg-card px-4 py-6 lg:flex lg:flex-col">
      <Link href="/" className="flex w-full justify-center transition-opacity">
        <Image
          src="/logo-black.svg"
          alt="Nanasgunung Planner"
          width={180}
          height={82}
          priority
          className="h-14 w-auto dark:invert"
        />
      </Link>

      <nav className="mt-6 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = iconMap[item.iconName as keyof typeof iconMap];

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
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
