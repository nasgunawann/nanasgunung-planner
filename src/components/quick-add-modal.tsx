"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDrafts } from "@/lib/drafts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlatformSelect, CategorySelect, StatusSelect } from "@/components/planner-selects";

export default function QuickAddModal({
  isOpen,
  onClose,
  defaultDate = "",
  defaultPlatform = "Instagram",
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultPlatform?: string;
}) {
  const { addDraft } = useDrafts();
  const router = useRouter();

  // Local Form States matching Draft data structure
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState(defaultPlatform);
  const [category, setCategory] = useState("Reels");
  const [status, setStatus] = useState("Draft");
  const [date, setDate] = useState(defaultDate);
  const [content, setContent] = useState(""); // Optional brief content/outline

  // Sync state values when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTitle("");
      setPlatform(defaultPlatform || "Instagram");
      setCategory("Reels");
      setStatus("Draft");
      
      // Auto-append time block (T08:00) to simple dates for datetime-local compliance
      let initialDate = defaultDate || "";
      if (initialDate && initialDate.length === 10) {
        initialDate = `${initialDate}T08:00`;
      }
      setDate(initialDate);
      
      setContent("");
    }
  }, [isOpen, defaultDate, defaultPlatform]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    let newId = "";
    try {
      newId = addDraft({
        title: title.trim(),
        platform,
        category: category === "none" ? "" : category,
        status,
        date: date || undefined,
        content: content.trim(),
      }, true);

      // Show high-end premium toast with direct link to new draft workspace
      toast.success("Draf berhasil ditambahkan!", {
        action: {
          label: "Buka Draf",
          onClick: () => router.push(`/drafts/${newId}`),
        },
      });
    } catch (e) {
      toast.error("Gagal menambahkan draf.");
    }

    // Reset local state fields
    setTitle("");
    setPlatform("Instagram");
    setCategory("Reels");
    setStatus("Draft");
    setDate("");
    setContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-md p-6 rounded-xl border border-border bg-background shadow-lg outline-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-sm font-bold text-foreground">
            Buat Draf Konten Baru
          </DialogTitle>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {/* Title Field */}
          <div className="grid gap-1.5">
            <label
              htmlFor="modal-title"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Judul Draf
            </label>
            <Input
              id="modal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul konten..."
              className="h-10 text-xs sm:text-sm bg-background"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Platform Select */}
            <div className="grid gap-1.5">
              <label
                htmlFor="modal-platform"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Platform
              </label>
              <PlatformSelect
                value={platform}
                onValueChange={setPlatform}
                id="modal-platform"
                className="h-10 text-xs sm:text-sm bg-background cursor-pointer"
              />
            </div>

            {/* Category Select */}
            <div className="grid gap-1.5">
              <label
                htmlFor="modal-category"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Format / Kategori
              </label>
              <CategorySelect
                value={category}
                onValueChange={setCategory}
                id="modal-category"
                className="h-10 text-xs sm:text-sm bg-background cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status Select */}
            <div className="grid gap-1.5">
              <label
                htmlFor="modal-status"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Workflow Status
              </label>
              <StatusSelect
                value={status}
                onValueChange={setStatus}
                id="modal-status"
                className="h-10 text-xs sm:text-sm bg-background cursor-pointer"
              />
            </div>

            {/* Publish Date & Time Field */}
            <div className="grid gap-1.5">
              <label
                htmlFor="modal-date"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Tanggal & Waktu Rilis
              </label>
              <Input
                id="modal-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-xs sm:text-sm bg-background cursor-pointer block"
              />
            </div>
          </div>

          {/* Script / Outline Textarea (Optional) */}
          <div className="grid gap-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="modal-content"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Catatan / Outline Naskah
              </label>
              <span className="text-[9px] text-muted-foreground/60 font-normal select-none">
                (Opsional)
              </span>
            </div>
            <textarea
              id="modal-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis hook awal, ide adegan, atau outline singkat konten di sini..."
              rows={3}
              className="w-full rounded-md border border-border bg-background p-3 text-xs sm:text-sm outline-none focus:border-primary/50 resize-none font-sans text-foreground"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md border border-border bg-background hover:bg-muted text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <Button
              type="submit"
              className="h-9 px-4 text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer"
            >
              Buat Draf
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
