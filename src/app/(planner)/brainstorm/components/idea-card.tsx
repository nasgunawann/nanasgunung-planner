"use client";

import React from "react";
import { m } from "motion/react";
import { IconTrash, IconBulb, IconArrowRight } from "@tabler/icons-react";
import {
  BrandInstagramIcon,
  BrandTiktokIcon,
  BrandYoutubeIcon,
  BrandLinkedinIcon,
} from "@/components/brand-icons";
import { type Idea } from "@/lib/drafts";

const platformIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Instagram: BrandInstagramIcon,
  TikTok: BrandTiktokIcon,
  YouTube: BrandYoutubeIcon,
  LinkedIn: BrandLinkedinIcon,
};

interface Props {
  idea: Idea;
  onDelete: (id: string) => void;
  onSaveAsRawIdea: (idea: Idea) => void;
  onPromote: (idea: Idea) => void;
}

export default function IdeaCard({
  idea,
  onDelete,
  onSaveAsRawIdea,
  onPromote,
}: Props) {
  const PlatformIcon = platformIconMap[idea.platform];

  return (
    <m.div
      initial={{ height: 0, opacity: 0, scale: 0.98, y: 6 }}
      animate={{ height: "auto", opacity: 1, scale: 1, y: 0 }}
      exit={{ height: 0, opacity: 0, scale: 0.98, y: -6 }}
      transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.22 }}
      className="w-full max-w-full overflow-hidden"
    >
      <div className="pb-4 max-w-full min-w-0">
        <article className="max-w-full min-w-0 rounded-lg border border-border/60 bg-background p-4 space-y-3 shadow-sm transition-all hover:border-border/100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {PlatformIcon ? (
                <PlatformIcon className="size-5 shrink-0" />
              ) : null}
              <h4 className="font-heading font-bold text-sm truncate text-foreground">
                {idea.title}
              </h4>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              {idea.createdAt}
            </span>
          </div>

          <div className="bg-muted/15 border-l-2 border-primary/50 p-1.5 text-xs rounded-r-md">
            <span className="text-[9px] uppercase tracking-wider font-bold text-primary block mb-0.5">
              Suggested Hook:
            </span>
            <p className="italic text-foreground/90 font-medium break-words whitespace-pre-wrap text-[11px] sm:text-xs">
              &quot;{idea.hook}&quot;
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground block">
              AI Structured Script Outline:
            </span>
            <div className="bg-muted/30 border border-border/40 p-1.5 sm:p-2 text-[10px] sm:text-[11px] font-mono text-muted-foreground rounded whitespace-pre-wrap break-words leading-relaxed max-h-[140px] overflow-y-auto">
              {idea.outline}
            </div>
          </div>

          <div className="grid gap-2 border-t border-border/40 pt-2.5 sm:flex sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={() => onDelete(idea.id)}
              className="flex w-full items-center justify-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold text-red-500 transition-all hover:bg-red-500/5 sm:w-auto"
            >
              <IconTrash className="size-3.5" />
              Hapus Ide
            </button>
            <button
              type="button"
              onClick={() => onSaveAsRawIdea(idea)}
              className="flex w-full items-center justify-center gap-1 rounded border border-border bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground transition-all cursor-pointer hover:bg-muted/80 sm:w-auto"
            >
              <IconBulb className="size-3.5 text-amber-500 animate-pulse" />
              Simpan Sebagai Ide
            </button>
            <button
              type="button"
              onClick={() => onPromote(idea)}
              className="flex w-full items-center justify-center gap-1 rounded bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20 sm:w-auto"
            >
              Tambahkan ke Draft <IconArrowRight className="size-3.5" />
            </button>
          </div>
        </article>
      </div>
    </m.div>
  );
}
