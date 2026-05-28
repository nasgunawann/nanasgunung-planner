"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";
import { useDrafts } from "@/lib/drafts";

export default function QuickAddModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addDraft } = useDrafts();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-3">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border/60 bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">New draft</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close quick add"
          >
            <IconX className="size-5" />
          </button>
        </div>

        <form
          className="mt-4 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget as HTMLFormElement;
            const title = (form.elements[0] as HTMLInputElement).value;
            const platform = (form.elements[1] as HTMLInputElement).value;

            try {
              addDraft({ title, platform });
            } catch (e) {
              // ignore
            }

            onClose();
          }}
        >
          <input
            className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
            placeholder="Title"
            name="title"
          />
          <input
            className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
            placeholder="Platform (Instagram, TikTok)"
            name="platform"
          />
          <div className="flex justify-end">
            <Button type="submit">Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
