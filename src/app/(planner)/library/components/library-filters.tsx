"use client";

type Props = {
  categories: string[];
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (v: string) => void;
  allUniqueTags: string[];
  selectedTagFilter: string;
  setSelectedTagFilter: (v: string) => void;
};

export default function LibraryFilters({
  categories,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  allUniqueTags,
  selectedTagFilter,
  setSelectedTagFilter,
}: Props) {
  return (
    <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-3 select-none">
      <div className="flex items-center gap-2 flex-wrap text-[11px]">
        <span className="font-bold text-muted-foreground uppercase text-[10px]">
          Filter Kategori:
        </span>
        <button
          type="button"
          onClick={() => setSelectedCategoryFilter("All")}
          className={[
            "px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all",
            selectedCategoryFilter === "All"
              ? "bg-primary text-primary-foreground font-bold shadow-sm"
              : "bg-muted/50 hover:bg-muted text-muted-foreground",
          ].join(" ")}
        >
          Semua Kategori
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategoryFilter(cat)}
            className={[
              "px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all",
              selectedCategoryFilter === cat
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "bg-muted/50 hover:bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>

      {allUniqueTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-[10px] border-t border-border/40 pt-2.5">
          <span className="font-bold text-muted-foreground uppercase text-[9px]">
            Filter Tags Cloud:
          </span>
          <button
            type="button"
            onClick={() => setSelectedTagFilter("All")}
            className={[
              "px-2 py-0.5 rounded border cursor-pointer transition-all font-semibold",
              selectedTagFilter === "All"
                ? "bg-foreground border-foreground text-background font-bold"
                : "border-border bg-background hover:bg-muted text-muted-foreground",
            ].join(" ")}
          >
            Semua Tags
          </button>
          {allUniqueTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTagFilter(tag)}
              className={[
                "px-2 py-0.5 rounded border cursor-pointer transition-all font-semibold",
                selectedTagFilter === tag
                  ? "bg-foreground border-foreground text-background font-bold"
                  : "border-border bg-background hover:bg-muted text-muted-foreground",
              ].join(" ")}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
