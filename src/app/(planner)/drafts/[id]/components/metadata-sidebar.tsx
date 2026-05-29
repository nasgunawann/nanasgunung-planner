"use client";

import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";

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
  return (
    <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-4">
      <div className="border-b border-border/60 pb-3 space-y-2">
        <Link
          href="/drafts"
          className="w-full flex items-center justify-center gap-2 h-9 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold transition-all shadow-sm"
        >
          <IconArrowLeft className="size-4" />
          Kembali ke Drafts
        </Link>

        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 h-9 rounded-md border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all cursor-pointer"
        >
          <IconTrash className="size-4" />
          Delete Draft
        </button>
      </div>

      <div className="grid gap-1">
        <label
          htmlFor="ws-title"
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          Title
        </label>
        <Input
          id="ws-title"
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          className="h-9 text-xs bg-background"
        />
      </div>

      <div className="grid gap-1">
        <label
          htmlFor="ws-platform"
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          Platform
        </label>
        <Select
          value={draft.platform ?? "Instagram"}
          onValueChange={(val) => handleDropdownChange("platform", val)}
        >
          <SelectTrigger
            id="ws-platform"
            className="h-9 text-xs bg-background cursor-pointer"
          >
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="TikTok">TikTok</SelectItem>
            <SelectItem value="YouTube">YouTube</SelectItem>
            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <label
          htmlFor="ws-category"
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          Format / Category
        </label>
        <Select
          value={draft.category ?? "none"}
          onValueChange={(val) =>
            handleDropdownChange("category", val === "none" ? "" : val)
          }
        >
          <SelectTrigger
            id="ws-category"
            className="h-9 text-xs bg-background cursor-pointer"
          >
            <SelectValue placeholder="No Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Category</SelectItem>
            <SelectItem value="Stories">Stories</SelectItem>
            <SelectItem value="Reels">Reels</SelectItem>
            <SelectItem value="Post">Post</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <label
          htmlFor="ws-status"
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          Workflow Status
        </label>
        <Select
          value={draft.status ?? "Draft"}
          onValueChange={(val) => handleDropdownChange("status", val)}
        >
          <SelectTrigger
            id="ws-status"
            className="h-9 text-xs bg-background cursor-pointer"
          >
            <SelectValue placeholder="Workflow Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="In progress">In progress</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <label
          htmlFor="ws-date"
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          Schedule Date & Time
        </label>
        <Input
          id="ws-date"
          type="datetime-local"
          value={draft.date ?? ""}
          onChange={(e) => handleDropdownChange("date", e.target.value)}
          className="h-9 text-xs bg-background"
        />
      </div>
    </div>
  );
}
