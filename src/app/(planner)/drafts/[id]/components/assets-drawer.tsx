"use client";

import React from "react";
import { IconSparkles, IconX } from "@tabler/icons-react";

type Props = {
  snippets: any[];
  snippetSearchQuery: string;
  setSnippetSearchQuery: (v: string) => void;
  snippetCategories: string[];
  selectedSnippetCategory: string;
  setSelectedSnippetCategory: (v: string) => void;
  filteredSnippets: any[];
  setInsertTrigger: (t: { text: string; time: number } | null) => void;
  setIsLibraryOpen: (v: boolean) => void;
  handleCreateManualBackup: () => void;
};

export default function AssetsDrawer({
  snippets,
  snippetSearchQuery,
  setSnippetSearchQuery,
  snippetCategories,
  selectedSnippetCategory,
  setSelectedSnippetCategory,
  filteredSnippets,
  setInsertTrigger,
  setIsLibraryOpen,
  handleCreateManualBackup,
}: Props) {
  return (
    <>
      <div className="p-3.5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/10">
        <span className="font-heading text-xs font-bold text-foreground flex items-center gap-1.5">
          Aset Siap Pakai
        </span>
        <button
          type="button"
          onClick={() => setIsLibraryOpen(false)}
          className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <IconX className="size-3.5" />
        </button>
      </div>

      <div className="p-3 border-b border-border/40 space-y-2 shrink-0 bg-background/50 select-none">
        <div className="relative">
          <input
            type="text"
            value={snippetSearchQuery}
            onChange={(e) => setSnippetSearchQuery(e.target.value)}
            placeholder="Cari aset..."
            className="w-full h-7 rounded border border-border bg-background px-2.5 pr-7 text-[11px] outline-none focus:border-primary/50"
          />
        </div>

        {snippetCategories.length > 0 && (
          <div className="flex gap-1 overflow-x-auto scrollbar-none flex-nowrap py-0.5 text-[9px]">
            <button
              type="button"
              onClick={() => setSelectedSnippetCategory("All")}
              className={[
                "px-1.5 py-0.5 rounded transition-all cursor-pointer whitespace-nowrap font-bold shrink-0",
                selectedSnippetCategory === "All"
                  ? "bg-primary/20 text-primary border border-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent",
              ].join(" ")}
            >
              Semua
            </button>
            {snippetCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedSnippetCategory(cat)}
                className={[
                  "px-1.5 py-0.5 rounded transition-all cursor-pointer whitespace-nowrap font-bold shrink-0",
                  selectedSnippetCategory === cat
                    ? "bg-primary/20 text-primary border border-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredSnippets.length > 0 ? (
          filteredSnippets.map((snip) => (
            <div
              key={snip.id}
              className="rounded-lg border border-border bg-background/50 p-2.5 space-y-2 text-[11px]"
            >
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-foreground truncate max-w-[130px]">
                  {snip.title}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleCreateManualBackup();
                    setInsertTrigger({ text: snip.content, time: Date.now() });
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-pointer select-none"
                >
                  <IconSparkles className="size-2.5 text-primary" />
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed bg-muted/15 p-2 rounded whitespace-pre-wrap select-all border border-border/20 max-h-[85px] overflow-y-auto font-mono">
                {snip.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground space-y-1">
            <p className="text-xs font-bold">Aset Tidak Ditemukan</p>
            <p className="text-[10px] max-w-[200px] mx-auto leading-relaxed font-sans mt-1">
              Coba ubah kata kunci pencarian atau bersihkan filter kategori
              Anda.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
