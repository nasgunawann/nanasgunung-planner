"use client";

import React, { useState } from "react";
import { IconCalendarEvent, IconInfoCircle } from "@tabler/icons-react";
import { useDrafts } from "@/lib/drafts";

interface Props {
  promotingIdea: any | null;
  setPromotingIdea: (v: any | null) => void;
  handlePromoteSubmit: (e: React.FormEvent) => void;
}

export default function PromoteModal({
  promotingIdea,
  setPromotingIdea,
  handlePromoteSubmit,
}: Props) {
  const { categories, addCustomCategory } = useDrafts();
  const [selectedCategory, setSelectedCategory] = useState("Reels");

  if (!promotingIdea) return null;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "_custom_") {
      const name = prompt("Masukkan nama format/kategori baru:");
      if (name && name.trim()) {
        const formatted = name.trim();
        addCustomCategory(formatted);
        setSelectedCategory(formatted);
      }
    } else {
      setSelectedCategory(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-3">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="font-heading text-base font-bold flex items-center gap-1.5">
              <IconCalendarEvent className="size-4 text-primary" /> Promote
              Concept ke Draft
            </h3>
            <p className="text-xs text-muted-foreground">
              Move "{promotingIdea.title}" to active planner.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPromotingIdea(null)}
            className="rounded-md border border-border bg-background hover:bg-muted px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

        <form onSubmit={handlePromoteSubmit} className="mt-4 grid gap-3">
          <div className="grid gap-1">
            <label
              htmlFor="promote-date"
              className="text-xs font-semibold text-muted-foreground"
            >
              Tanggal Penjadwalan (Opsional)
            </label>
            <input
              id="promote-date"
              name="date"
              type="date"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
            />
          </div>

          <div className="grid gap-1">
            <label
              htmlFor="promote-category"
              className="text-xs font-semibold text-muted-foreground"
            >
              Format / Category
            </label>
            <select
              id="promote-category"
              name="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="_custom_" className="text-primary font-bold">
                + Kategori Baru...
              </option>
            </select>
          </div>

          <div className="grid gap-1">
            <label
              htmlFor="promote-status"
              className="text-xs font-semibold text-muted-foreground"
            >
              Initial Status
            </label>
            <select
              id="promote-status"
              name="status"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="Draft">Draft</option>
              <option value="In progress">In progress</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded p-2.5 text-[11px] text-muted-foreground flex gap-2">
            <IconInfoCircle className="size-4 text-blue-500 shrink-0" />
            <p>
              Promoting this idea will automatically convert the catchy hook and
              structured outline into a storyboard script, ready for rich-text
              writing inside Drafts!
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-3 mt-1">
            <button
              type="button"
              onClick={() => setPromotingIdea(null)}
              className="rounded-md border border-border bg-background hover:bg-muted px-4 py-2 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 text-sm font-semibold transition-colors"
            >
              Tambahkan ke Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
