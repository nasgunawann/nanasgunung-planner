"use client";

import type { Snippet } from "@/lib/library-seed";

type Props = {
  snippetTitle: string;
  setSnippetTitle: (v: string) => void;
  snippetContent: string;
  setSnippetContent: (v: string) => void;
  snippetCategory: string;
  setSnippetCategory: (v: string) => void;
  snippetTagsInput: string;
  setSnippetTagsInput: (v: string) => void;
  categories: string[];
  isAddingNewCategory: boolean;
  setIsAddingNewCategory: (v: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (v: string) => void;
  onAddCategory: (e: React.MouseEvent) => void;
  onAddSnippet: (e: React.FormEvent) => void;
};

export default function SnippetForm({
  snippetTitle,
  setSnippetTitle,
  snippetContent,
  setSnippetContent,
  snippetCategory,
  setSnippetCategory,
  snippetTagsInput,
  setSnippetTagsInput,
  categories,
  isAddingNewCategory,
  setIsAddingNewCategory,
  newCategoryName,
  setNewCategoryName,
  onAddCategory,
  onAddSnippet,
}: Props) {
  return (
    <form
      onSubmit={onAddSnippet}
      className="space-y-3 bg-card border border-border/60 p-4 rounded-xl shadow-sm"
    >
      <h3 className="text-sm font-bold">Tambah Aset Siap Pakai</h3>
      <div className="grid gap-2">
        <input
          placeholder="Judul singkat"
          value={snippetTitle}
          onChange={(e) => setSnippetTitle(e.target.value)}
          className="h-9 rounded border border-border bg-background px-2.5 text-xs outline-none"
        />
        <textarea
          placeholder="Konten snippet..."
          value={snippetContent}
          onChange={(e) => setSnippetContent(e.target.value)}
          className="min-h-[84px] rounded border border-border bg-background p-2.5 text-xs outline-none resize-vertical"
        />
        <div className="flex gap-2">
          <select
            value={snippetCategory}
            onChange={(e) => setSnippetCategory(e.target.value)}
            className="h-9 rounded border border-border bg-background px-2 text-xs outline-none flex-1"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            placeholder="Tags (pisah koma)"
            value={snippetTagsInput}
            onChange={(e) => setSnippetTagsInput(e.target.value)}
            className="h-9 rounded border border-border bg-background px-2.5 text-xs outline-none flex-1"
          />
        </div>

        {isAddingNewCategory ? (
          <div className="flex gap-2">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nama kategori baru"
              className="h-9 rounded border border-border bg-background px-2.5 text-xs outline-none flex-1"
            />
            <button
              onClick={onAddCategory}
              className="h-9 px-3 rounded bg-primary text-primary-foreground"
            >
              Tambahkan
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingNewCategory(true)}
            className="text-xs text-primary hover:underline"
          >
            + Tambah kategori baru
          </button>
        )}

        <div className="flex gap-2 justify-end">
          <button
            type="submit"
            className="h-9 px-3 rounded bg-primary text-primary-foreground"
          >
            Simpan Aset
          </button>
        </div>
      </div>
    </form>
  );
}
