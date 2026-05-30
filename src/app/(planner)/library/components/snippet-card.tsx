"use client";

import React, { useState } from "react";
import { m } from "motion/react";
import {
  IconCopy,
  IconEdit,
  IconTrash,
  IconCheck,
  IconDeviceFloppy,
  IconX,
} from "@tabler/icons-react";
import type { Snippet } from "@/lib/library-seed";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HashtagTextarea } from "@/components/ui/hashtag-textarea";

type Props = {
  snip: Snippet;
  isEditing: boolean;
  categories: string[];
  editTitle: string;
  editContent: string;
  editCategory: string;
  onChangeEditTitle: (v: string) => void;
  onChangeEditContent: (v: string) => void;
  onChangeEditCategory: (v: string) => void;
  onStartEdit: (s: Snippet) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onCopy: (id: string, text: string) => void;
  copiedId: string | null;
};

export default function SnippetCard({
  snip,
  isEditing,
  categories,
  editTitle,
  editContent,
  editCategory,
  onChangeEditTitle,
  onChangeEditContent,
  onChangeEditCategory,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onCopy,
  copiedId,
}: Props) {
  return (
    <div className="pb-3">
      <article className="rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-sm transition-all hover:border-border/100">
        {isEditing ? (
          <div className="space-y-3 text-xs animate-in fade-in duration-100">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-0.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">
                  Judul Klip
                </span>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => onChangeEditTitle(e.target.value)}
                  className="h-8.5 rounded border border-border bg-background px-2.5 text-xs outline-none focus:border-primary/55 transition-all"
                  required
                />
              </div>
              <div className="grid gap-0.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">
                  Kategori
                </span>
                <select
                  value={editCategory}
                  onChange={(e) => onChangeEditCategory(e.target.value)}
                  className="h-8.5 rounded border border-border bg-background px-2 text-xs outline-none focus:border-primary/55 transition-all cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-0.5">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">
                Konten
              </span>
              <HashtagTextarea
                value={editContent}
                onChange={onChangeEditContent}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onCancelEdit}
                className="inline-flex h-8 items-center justify-center rounded border border-border bg-background hover:bg-muted text-xs px-3 font-semibold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => onSaveEdit(snip.id)}
                className="inline-flex h-8 items-center justify-center rounded bg-primary hover:bg-primary/95 text-primary-foreground text-xs px-3.5 font-bold transition-all shadow-sm cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-foreground text-sm leading-snug">
                  {snip.title}
                </h4>
                <div className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border/40 select-none">
                  {snip.category}
                </div>
              </div>
              
              <TooltipProvider>
                <div className="flex items-center gap-1 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onCopy(snip.id, snip.content)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-all cursor-pointer"
                      >
                        {copiedId === snip.id ? (
                          <IconCheck className="size-4 text-green-500" />
                        ) : (
                          <IconCopy className="size-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-[10px] font-medium">Salin Konten</span>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onStartEdit(snip)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-all cursor-pointer"
                      >
                        <IconEdit className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-[10px] font-medium">Edit Aset</span>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onDelete(snip.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground/60 hover:text-red-500 transition-all cursor-pointer"
                      >
                        <IconTrash className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-[10px] font-medium text-red-500">Hapus Aset</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap mt-2 select-text">
              {snip.content.split(/(\s+)/).map((token, idx) => {
                if (token.startsWith("#") && token.length > 1) {
                  return (
                    <span
                      key={`hash-static-${idx}-${token}`}
                      className="inline-flex items-baseline bg-secondary text-secondary-foreground border border-border/80 px-1.5 py-0.5 rounded text-[10px] font-bold select-none capitalize transition-all hover:bg-muted mx-0.5"
                    >
                      {token}
                    </span>
                  );
                }
                return token;
              })}
            </p>
          </div>
        )}
      </article>
    </div>
  );
}
