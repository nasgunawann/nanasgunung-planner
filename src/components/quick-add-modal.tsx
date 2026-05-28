"use client";

  import React from "react";
  import { Button } from "@/components/ui/button";
  import { useDrafts } from "@/lib/drafts";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";

  export default function QuickAddModal({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) {
    const { addDraft } = useDrafts();

    return (
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="w-full max-w-xl p-6 rounded-xl border border-border bg-background shadow-lg outline-none sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold">New draft</DialogTitle>
          </DialogHeader>

          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget as HTMLFormElement;
              const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
              const platform = (form.elements.namedItem("platform") as HTMLInputElement).value.trim();

              if (!title) return;

              try {
                addDraft({ title, platform });
              } catch (e) {
                // ignore
              }

              onClose();
            }}
          >
            <input
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
              placeholder="Title"
              name="title"
              required
            />
            <input
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
              placeholder="Platform (Instagram, TikTok)"
              name="platform"
              required
            />
            <div className="flex justify-end mt-2">
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
