"use client";

import { m } from "motion/react";
import { IconCopy, IconEdit, IconTrash, IconCheck } from "@tabler/icons-react";
import type { Snippet } from "@/lib/library-seed";

type Props = {
  snip: Snippet;
  isEditing: boolean;
  categories: string[];
  editTitle: string;
  editContent: string;
  editCategory: string;
  editTagsInput: string;
  onChangeEditTitle: (v: string) => void;
  onChangeEditContent: (v: string) => void;
  onChangeEditCategory: (v: string) => void;
  onChangeEditTagsInput: (v: string) => void;
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
  editTagsInput,
  onChangeEditTitle,
  onChangeEditContent,
  onChangeEditCategory,
  onChangeEditTagsInput,
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
                  className="h-8 rounded border border-border bg-background px-2.5 text-xs outline-none"
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
                  className="h-8 rounded border border-border bg-background px-2 text-xs outline-none"
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
              <textarea
                value={editContent}
                onChange={(e) => onChangeEditContent(e.target.value)}
                className="min-h-[84px] rounded border border-border bg-background p-2.5 text-xs outline-none resize-vertical"
              />
            </div>

            <div className="grid gap-0.5">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">
                Tags (Pisahkan dengan koma)
              </span>
              <input
                value={editTagsInput}
                onChange={(e) => onChangeEditTagsInput(e.target.value)}
                className="h-8 rounded border border-border bg-background px-2.5 text-xs outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onCancelEdit}
                className="h-8 px-3 rounded border text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => onSaveEdit(snip.id)}
                className="h-8 px-3 rounded bg-primary text-primary-foreground text-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-foreground text-sm">
                  {snip.title}
                </h4>
                <div className="text-[11px] text-muted-foreground">
                  {snip.category}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCopy(snip.id, snip.content)}
                  className="p-1 rounded text-muted-foreground/50 hover:text-foreground"
                >
                  <IconCopy className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onStartEdit(snip)}
                  className="p-1 rounded text-muted-foreground/50 hover:text-foreground"
                >
                  <IconEdit className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(snip.id)}
                  className="p-1 rounded text-muted-foreground/50 hover:text-red-500"
                >
                  <IconTrash className="size-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {snip.content}
            </p>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>#{snip.tags?.join(" #")}</span>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
