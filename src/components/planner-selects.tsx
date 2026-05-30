"use client";

import React, { useState } from "react";
import { useDrafts } from "@/lib/drafts";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// --- Shared Reusable Dialog for Dynamic Custom Addition ---
interface AddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  placeholder: string;
  onSubmit: (name: string) => void;
}

export function AddCustomItemDialog({
  isOpen,
  onClose,
  title,
  placeholder,
  onSubmit,
}: AddDialogProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setInputValue("");
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm p-5 rounded-xl border border-border bg-background shadow-lg outline-none select-none">
        <DialogHeader>
          <DialogTitle className="font-heading text-sm font-bold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="h-10 text-xs sm:text-sm bg-background outline-none border border-border/80 rounded-md p-3"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-border bg-background hover:bg-muted text-xs sm:text-sm font-bold transition-all cursor-pointer select-none"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-primary hover:bg-primary/95 text-primary-foreground text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm select-none"
            >
              Tambah
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Platform Selector Component ---
interface PlatformSelectProps {
  value: string;
  onValueChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
}

export function PlatformSelect({
  value,
  onValueChange,
  className,
  placeholder = "Pilih Platform",
  id,
  name,
}: PlatformSelectProps) {
  const { platforms, addCustomPlatform } = useDrafts();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSelectChange = (val: string) => {
    if (val === "_custom_") {
      setIsAddOpen(true);
    } else {
      onValueChange(val);
    }
  };

  return (
    <>
      <Select value={value} onValueChange={handleSelectChange} name={name}>
        <SelectTrigger id={id} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {platforms.map((plat) => (
            <SelectItem key={plat} value={plat}>
              {plat}
            </SelectItem>
          ))}
          <SelectItem
            value="_custom_"
            className="text-primary font-bold border-t border-border/40 mt-1 cursor-pointer focus:bg-primary/5 focus:text-primary"
          >
            + Platform Baru...
          </SelectItem>
        </SelectContent>
      </Select>

      <AddCustomItemDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Platform Kustom Baru"
        placeholder="Masukkan nama platform (misal: Pinterest, Threads)..."
        onSubmit={(platName) => {
          addCustomPlatform(platName);
          onValueChange(platName);
        }}
      />
    </>
  );
}

// --- Category Selector Component ---
interface CategorySelectProps {
  value: string;
  onValueChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  includeNone?: boolean;
}

export function CategorySelect({
  value,
  onValueChange,
  className,
  placeholder = "Pilih Format",
  id,
  name,
  includeNone = true,
}: CategorySelectProps) {
  const { categories, addCustomCategory } = useDrafts();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSelectChange = (val: string) => {
    if (val === "_custom_") {
      setIsAddOpen(true);
    } else {
      onValueChange(val === "none" ? "" : val);
    }
  };

  // Maps internal empty string to Radix item value "none"
  const selectVal = value === "" && includeNone ? "none" : value;

  return (
    <>
      <Select value={selectVal} onValueChange={handleSelectChange} name={name}>
        <SelectTrigger id={id} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeNone && <SelectItem value="none">No Category</SelectItem>}
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
          <SelectItem
            value="_custom_"
            className="text-primary font-bold border-t border-border/40 mt-1 cursor-pointer focus:bg-primary/5 focus:text-primary"
          >
            + Kategori Baru...
          </SelectItem>
        </SelectContent>
      </Select>

      <AddCustomItemDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Format / Kategori Kustom Baru"
        placeholder="Masukkan nama format (misal: Newsletter, Podcast)..."
        onSubmit={(catName) => {
          addCustomCategory(catName);
          onValueChange(catName);
        }}
      />
    </>
  );
}

// --- Tone Selector Component ---
interface ToneSelectProps {
  value: string;
  onValueChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
}

export function ToneSelect({
  value,
  onValueChange,
  className,
  placeholder = "Pilih Gaya Bicara",
  id,
  name,
}: ToneSelectProps) {
  const { tones, addCustomTone } = useDrafts();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSelectChange = (val: string) => {
    if (val === "_custom_") {
      setIsAddOpen(true);
    } else {
      onValueChange(val);
    }
  };

  return (
    <>
      <Select value={value} onValueChange={handleSelectChange} name={name}>
        <SelectTrigger id={id} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {tones.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
          <SelectItem
            value="_custom_"
            className="text-primary font-bold border-t border-border/40 mt-1 cursor-pointer focus:bg-primary/5 focus:text-primary"
          >
            + Gaya Bicara Baru...
          </SelectItem>
        </SelectContent>
      </Select>

      <AddCustomItemDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Gaya Bicara Kustom Baru"
        placeholder="Masukkan gaya bicara... (cth. Sarkas, Berita...)"
        onSubmit={(toneName) => {
          addCustomTone(toneName);
          onValueChange(toneName);
        }}
      />
    </>
  );
}

// --- Status Selector Component ---
interface StatusSelectProps {
  value: string;
  onValueChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
}

export function StatusSelect({
  value,
  onValueChange,
  className,
  placeholder = "Pilih Status",
  id,
  name,
}: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} name={name}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Draft">Draft</SelectItem>
        <SelectItem value="In progress">In progress</SelectItem>
        <SelectItem value="Published">Published</SelectItem>
      </SelectContent>
    </Select>
  );
}
