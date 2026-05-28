"use client";

import { useState, type ComponentType } from "react";

import { useDrafts } from "@/lib/drafts";
import {
  contentCategoryLabelMap,
  platformColorMap,
  normalizeStatus,
  statusAccentMap,
} from "@/lib/platform-map";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandYoutube,
} from "@tabler/icons-react";

const platformIconMap: Record<string, ComponentType<{ className?: string }>> = {
  Instagram: IconBrandInstagram,
  LinkedIn: IconBrandLinkedin,
  TikTok: IconBrandTiktok,
  YouTube: IconBrandYoutube,
};

export default function DraftsPage() {
  const { drafts, updateDraft } = useDrafts();
  const [editingDraft, setEditingDraft] = useState<
    (typeof drafts)[number] | null
  >(null);

  const categoryOptions = ["", "Stories", "Reels", "Post"];
  const statusOptions = ["Draft", "In progress", "Published"];

  function closeEditor() {
    setEditingDraft(null);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {drafts.map((d) => {
          const status = normalizeStatus(d.status);
          const statusTheme =
            statusAccentMap[status] ?? statusAccentMap.Default;
          const Icon = platformIconMap[d.platform ?? ""];

          return (
            <div
              key={d.id}
              className={[
                "rounded-md border border-border/60 bg-card/75 p-3",
                statusTheme.border,
                "border-l-4",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {Icon ? (
                      <span
                        className={[
                          "inline-flex items-center justify-center rounded-full p-1",
                          platformColorMap[d.platform ?? "Default"],
                        ].join(" ")}
                        aria-hidden
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    ) : null}

                    <p
                      className={[
                        "truncate font-medium",
                        statusTheme.title,
                      ].join(" ")}
                    >
                      {d.title}
                    </p>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{d.updatedAt}</span>
                    {d.category ? (
                      <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                        {contentCategoryLabelMap[d.category] ?? d.category}
                      </span>
                    ) : null}
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
                        statusTheme.bg,
                        statusTheme.chipText,
                      ].join(" ")}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingDraft(d)}
                  className="rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingDraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-3">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-border/60 bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-semibold">
                  Edit draft
                </h3>
                <p className="text-sm text-muted-foreground">
                  Changes save to localStorage
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>

            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget as HTMLFormElement;
                const title = (
                  form.elements.namedItem("title") as HTMLInputElement | null
                )?.value.trim();
                const platform = (
                  form.elements.namedItem("platform") as HTMLInputElement | null
                )?.value.trim();
                const category = (
                  form.elements.namedItem(
                    "category",
                  ) as HTMLSelectElement | null
                )?.value.trim();
                const status = (
                  form.elements.namedItem("status") as HTMLSelectElement | null
                )?.value.trim();
                const date = (
                  form.elements.namedItem("date") as HTMLInputElement | null
                )?.value.trim();

                if (!title) return;

                updateDraft(editingDraft.id, {
                  title,
                  platform,
                  category: category || undefined,
                  status,
                  date,
                });

                closeEditor();
              }}
            >
              <input
                name="title"
                defaultValue={editingDraft.title}
                placeholder="Title"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
              />
              <input
                name="platform"
                defaultValue={editingDraft.platform ?? ""}
                placeholder="Platform"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
              />
              <select
                name="category"
                defaultValue={editingDraft.category ?? ""}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option
                      ? (contentCategoryLabelMap[option] ?? option)
                      : "No category"}
                  </option>
                ))}
              </select>
              <select
                name="status"
                defaultValue={normalizeStatus(editingDraft.status)}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                name="date"
                defaultValue={editingDraft.date ?? ""}
                placeholder="yyyy-MM-dd"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded bg-primary px-3 py-2 text-white"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
