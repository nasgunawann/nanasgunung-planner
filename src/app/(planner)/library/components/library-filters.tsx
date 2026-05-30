"use client";

import { useState } from "react";
import { IconSearch } from "@tabler/icons-react";

type Props = {
  categories: string[];
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
};

export default function LibraryFilters({
  categories,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  searchQuery,
  setSearchQuery,
}: Props) {
  return (
    <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-4 select-none">
      {/* Search Input Bar */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
        <input
          type="text"
          placeholder="Cari aset berdasarkan judul, konten, atau kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-lg border border-border/80 bg-background text-xs outline-none focus:border-primary/60 transition-all placeholder:text-muted-foreground/50"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground font-bold cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Filter Badges */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <span className="font-bold text-muted-foreground uppercase text-[10px] mr-1.5">
          Filter Kategori:
        </span>
        <button
          type="button"
          onClick={() => setSelectedCategoryFilter("All")}
          className={[
            "px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all",
            selectedCategoryFilter === "All"
              ? "bg-primary text-primary-foreground font-bold shadow-sm"
              : "bg-muted/50 hover:bg-muted text-muted-foreground",
          ].join(" ")}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategoryFilter(cat)}
            className={[
              "px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all",
              selectedCategoryFilter === cat
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "bg-muted/50 hover:bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
