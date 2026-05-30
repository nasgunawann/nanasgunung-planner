"use client";

import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PlatformSelect,
  CategorySelect,
  StatusSelect,
} from "@/components/planner-selects";
import { IconArrowLeft, IconTrash, IconBooks } from "@tabler/icons-react";
import { useDrafts } from "@/lib/drafts";

type Props = {
  draft: any;
  localTitle: string;
  setLocalTitle: (v: string) => void;
  setIsDeleteOpen: (v: boolean) => void;
  handleDropdownChange: (field: string, value: string) => void;
};

export default function MetadataSidebar({
  draft,
  localTitle,
  setLocalTitle,
  setIsDeleteOpen,
  handleDropdownChange,
}: Props) {
  const { saveDraftAsTemplate } = useDrafts();

  return (
    <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-4">
      {/* Action Header */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-3 w-full">
        {/* Row 1: Kembali (Left) & Trash Icon (Right) */}
        <div className="flex items-center justify-between w-full gap-2">
          <Link
            href="/drafts"
            className="flex w-full items-center justify-center gap-2 h-9 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm font-medium transition-all shadow-sm"
            title="Kembali ke Drafts"
          >
            <IconArrowLeft className="size-4" />
            <span>Simpan dan Kembali</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center justify-center size-9 rounded-md border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
            title="Delete Draft"
          >
            <IconTrash className="size-4" />
          </button>
        </div>

        {/* Row 2: Simpan Sebagai Template (Full Width Bottom) */}
        <button
          type="button"
          onClick={() => saveDraftAsTemplate(draft.id)}
          className="w-full flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
        >
          <IconBooks className="size-4" />
          Simpan sebagai Templat
        </button>
      </div>

      {/* Form Body */}
      <div className="grid gap-1">
        <label
          htmlFor="ws-title"
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          Title
        </label>
        <textarea
          id="ws-title"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          className="min-h-[80px] p-2 w-full resize-y rounded-md bg-muted text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        />
      </div>

      {/* Metadata Row 1 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1">
          <label
            htmlFor="ws-platform"
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Platform
          </label>
          <PlatformSelect
            value={draft.platform ?? "Instagram"}
            onValueChange={(val) => handleDropdownChange("platform", val)}
            id="ws-platform"
            className="h-9 text-xs sm:text-sm bg-background cursor-pointer"
          />
        </div>

        <div className="grid gap-1">
          <label
            htmlFor="ws-category"
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Format
          </label>
          <CategorySelect
            value={draft.category ?? ""}
            onValueChange={(val) => handleDropdownChange("category", val)}
            id="ws-category"
            className="h-9 text-xs sm:text-sm bg-background cursor-pointer"
          />
        </div>
      </div>

      {/* Metadata Row 2 (Consolidated for better layout balance) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1">
          <label
            htmlFor="ws-status"
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Status Konten
          </label>
          <StatusSelect
            value={draft.status ?? "Draft"}
            onValueChange={(val) => handleDropdownChange("status", val)}
            id="ws-status"
            className="h-9 text-xs sm:text-sm bg-background cursor-pointer"
          />
        </div>

        <div className="grid gap-1">
          <label
            htmlFor="ws-date"
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Jadwal Konten
          </label>
          <Input
            id="ws-date"
            type="datetime-local"
            value={draft.date ?? ""}
            onChange={(e) => handleDropdownChange("date", e.target.value)}
            className="h-9 text-xs sm:text-sm bg-background"
          />
        </div>
      </div>
    </div>
  );
}
