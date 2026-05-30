"use client";

import React, { useState } from "react";
import { IconCalendarEvent, IconInfoCircle } from "@tabler/icons-react";
import { CategorySelect, StatusSelect } from "@/components/planner-selects";
import { Button } from "@/components/ui/button";

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
  const [selectedCategory, setSelectedCategory] = useState("Reels");
  const [selectedStatus, setSelectedStatus] = useState("Draft");

  if (!promotingIdea) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-3 select-none">
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
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setPromotingIdea(null)}
          >
            Close
          </Button>
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

          <div className="grid grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="grid gap-1">
              <label
                htmlFor="promote-category"
                className="text-xs font-semibold text-muted-foreground"
              >
                Format / Category
              </label>
              <CategorySelect
                name="category"
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                id="promote-category"
                className="h-10 text-xs sm:text-sm bg-background cursor-pointer"
                includeNone={false}
              />
            </div>

            {/* Status Select */}
            <div className="grid gap-1">
              <label
                htmlFor="promote-status"
                className="text-xs font-semibold text-muted-foreground"
              >
                Initial Status
              </label>
              <StatusSelect
                name="status"
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                id="promote-status"
                className="h-10 text-xs sm:text-sm bg-background cursor-pointer"
              />
            </div>
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
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setPromotingIdea(null)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Tambahkan ke Draft
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
