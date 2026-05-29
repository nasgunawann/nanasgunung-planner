"use client";

import { m, AnimatePresence } from "motion/react";
import { IconTrash, IconArrowRight } from "@tabler/icons-react";
import { platformColorMap } from "@/lib/platform-map";

import type { Template } from "@/lib/library-seed";

type Props = {
  template: Template;
  isExpanded: boolean;
  onToggle: (title: string) => void;
  onDelete: (title: string) => void;
  onUse: (t: Template) => void;
};

export default function TemplateCard({
  template,
  isExpanded,
  onToggle,
  onDelete,
  onUse,
}: Props) {
  return (
    <article className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={[
                "px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider",
                platformColorMap[template.platform] ?? "bg-primary",
              ].join(" ")}
            >
              {template.platform}
            </span>
            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
              {template.type}
            </span>
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            {template.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 select-none">
          <span className="text-[11px] text-muted-foreground font-semibold bg-muted/40 border border-border/30 px-2 py-1 rounded">
            {template.usage}
          </span>
          <button
            type="button"
            onClick={() => onDelete(template.title)}
            className="p-1 rounded text-muted-foreground/35 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
            title="Hapus Templat"
          >
            <IconTrash className="size-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed pb-1">
        {template.description}
      </p>

      <div>
        <button
          type="button"
          onClick={() => onToggle(template.title)}
          className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer select-none"
        >
          <span>
            {isExpanded
              ? "Sembunyikan Skema Blueprint"
              : "Lihat Skema Blueprint Outline"}
          </span>
          <svg
            className={[
              "size-3.5 fill-none stroke-current stroke-[2.5px] transition-transform duration-200",
              isExpanded ? "rotate-180" : "",
            ].join(" ")}
            viewBox="0 0 24 24"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 8 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{
              type: "tween",
              ease: [0.16, 1, 0.3, 1],
              duration: 0.22,
            }}
            className="overflow-hidden w-full"
          >
            <div className="space-y-1.5 border-t border-border/40 pt-3">
              <span className="text-[9px] uppercase tracking-wider font-bold text-primary block">
                Blueprint Template Outline (HTML Rendered):
              </span>
              <div
                dangerouslySetInnerHTML={{ __html: template.blueprint }}
                className="bg-background border border-border/40 p-4 rounded-lg text-xs leading-relaxed text-muted-foreground/80 font-sans max-w-none space-y-2 prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4 select-all shadow-inner"
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end pt-2 border-t border-border/20">
        <button
          type="button"
          onClick={() => onUse(template)}
          className="flex h-8 items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm animate-in fade-in"
        >
          Gunakan Templat Konten
          <IconArrowRight className="size-3.5" />
        </button>
      </div>
    </article>
  );
}
