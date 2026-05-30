"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SnippetCategorySelect } from "@/components/snippet-category-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HashtagTextarea } from "@/components/ui/hashtag-textarea";
import { toast } from "sonner";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";

interface AddSnippetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (snippet: {
    title: string;
    content: string;
    category: string;
  }) => void;
  initialCategory?: string;
}

export default function AddSnippetDialog({
  isOpen,
  onClose,
  onSave,
  initialCategory = "CTA",
}: AddSnippetDialogProps) {
  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [content, setContent] = useState("");

  // AI assistant states
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const parseAiSnippet = (responseText: string) => {
    const categoryMatch = responseText.match(/CATEGORY:\s*(.*)/i);
    const contentIndex = responseText.indexOf("CONTENT:");

    let parsedCategory = "CTA";
    let parsedContent = responseText;

    if (categoryMatch) {
      parsedCategory = categoryMatch[1].trim();
    }
    if (contentIndex !== -1) {
      parsedContent = responseText.substring(contentIndex + 8).trim();
    } else if (categoryMatch) {
      parsedContent = responseText.replace(/CATEGORY:\s*.*/i, "").trim();
    }

    return { category: parsedCategory, content: parsedContent };
  };

  const handleAiGenerate = async () => {
    if (!aiInstruction.trim()) return;
    setIsAiGenerating(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiInstruction.trim(),
          commandType: "snippet-generate",
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Gagal merancang aset dengan AI.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedText += decoder.decode(value, { stream: true });
      }

      const parsed = parseAiSnippet(accumulatedText);
      setContent(parsed.content);

      // Auto-validate and set category if valid
      if (parsed.category) {
        setCategory(parsed.category);
      }

      toast.success("AI berhasil merancang aset siap pakai untuk Anda!");
      setShowAiHelper(false);
      setAiInstruction("");
    } catch (e: any) {
      toast.error(e.message || "Gagal menghubungi AI Agent.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Judul dan konten aset wajib diisi.");
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      category,
    });

    // Reset local states
    setTitle("");
    setCategory(initialCategory);
    setContent("");
    setShowAiHelper(false);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md overflow-hidden">
        <DialogHeader className="pb-1.5">
          <DialogTitle className="font-heading text-sm font-bold text-foreground">
            Tambah Aset Siap Pakai Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Simpan kalimat CTA, hashtags, intro, atau outro siap pakai ke
            Pustaka luring Anda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {/* Judul Aset */}
          <div className="grid gap-1">
            <label
              htmlFor="snip-title"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Judul Aset
            </label>
            <Input
              id="snip-title"
              placeholder="Contoh: CTA Promo Akhir Bulan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs bg-background"
              required
            />
          </div>

          {/* Kategori */}
          <div className="grid gap-1">
            <label
              htmlFor="snip-category"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Kategori
            </label>
            <SnippetCategorySelect
              id="snip-category"
              value={category}
              onValueChange={setCategory}
              className="h-9 text-xs bg-background cursor-pointer"
            />
          </div>

          {/* Konten Aset */}
          <div className="grid gap-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="snip-content"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Konten Aset
              </label>
              <button
                type="button"
                onClick={() => setShowAiHelper(!showAiHelper)}
                className="text-[10px] ai-accent-text hover:underline font-bold flex items-center gap-1 select-none cursor-pointer"
              >
                <IconSparkles className="size-3 ai-accent-text animate-pulse" />
                {showAiHelper ? "Tulis Manual" : "Tulis dengan AI"}
              </button>
            </div>

            {/* AI Assistant expandable block */}
            {showAiHelper && (
              <div className="ai-accent-surface rounded-lg p-3 space-y-2 mt-1 mb-1.5 animate-in slide-in-from-top-3 duration-200">
                <p className="text-[10px] font-bold ai-accent-text">
                  AI Content Generator
                </p>
                <Input
                  placeholder="Contoh: Buat penutup video Reels edukasi mengajak follow..."
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  className="ai-accent-field h-8 text-xs bg-background"
                  disabled={isAiGenerating}
                />
                <Button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isAiGenerating || !aiInstruction.trim()}
                  className="ai-accent w-full font-bold text-[10px] h-7 cursor-pointer shadow-sm"
                >
                  {isAiGenerating ? (
                    <>
                      <IconLoader2 className="size-3 animate-spin mr-1.5" />
                      Rancang Aset...
                    </>
                  ) : (
                    <>
                      <IconSparkles className="size-3 mr-1.5" />
                      Rancang Aset dengan AI
                    </>
                  )}
                </Button>
              </div>
            )}

            <HashtagTextarea
              placeholder="Masukkan teks siap pakai Anda di sini..."
              value={content}
              onChange={setContent}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 border-t border-border/40 pt-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-3 h-9 text-xs font-bold cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="px-4 h-9 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold cursor-pointer shadow-sm"
            >
              Simpan Aset
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
