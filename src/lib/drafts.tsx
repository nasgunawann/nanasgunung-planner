"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { format } from "date-fns";

export type Draft = {
  id: string;
  title: string;
  platform?: string;
  category?: string;
  date?: string; // yyyy-MM-dd
  status?: string;
  updatedAt: string;
};

export const seedDrafts: Draft[] = [
  {
    id: "mock-2026-05-03-1",
    title: "Teaser Reel",
    platform: "Instagram",
    category: "Reels",
    date: "2026-05-03",
    status: "Published",
    updatedAt: "May 28, 2026",
  },
  {
    id: "mock-2026-05-03-2",
    title: "Carousel Hook",
    platform: "TikTok",
    category: "Post",
    date: "2026-05-03",
    status: "In progress",
    updatedAt: "May 28, 2026",
  },
  {
    id: "mock-2026-05-08-1",
    title: "Behind the scenes",
    platform: "Instagram",
    category: "Stories",
    date: "2026-05-08",
    status: "Published",
    updatedAt: "May 28, 2026",
  },
  {
    id: "mock-2026-05-08-2",
    title: "Promo caption",
    platform: "Instagram",
    category: "Post",
    date: "2026-05-08",
    status: "Draft",
    updatedAt: "May 28, 2026",
  },
  {
    id: "mock-2026-05-08-3",
    title: "Story sequence",
    platform: "Instagram",
    category: "Stories",
    date: "2026-05-08",
    status: "In progress",
    updatedAt: "May 28, 2026",
  },
  {
    id: "mock-2026-05-14-1",
    title: "Launch post",
    platform: "LinkedIn",
    category: "Post",
    date: "2026-05-14",
    status: "Published",
    updatedAt: "May 28, 2026",
  },
  {
    id: "mock-2026-05-14-2",
    title: "Short-form cut",
    platform: "TikTok",
    category: "Reels",
    date: "2026-05-14",
    status: "Draft",
    updatedAt: "May 28, 2026",
  },
  {
    id: "mock-2026-05-20-1",
    title: "Q&A prompt",
    platform: "Instagram",
    category: "Stories",
    date: "2026-05-20",
    status: "Published",
    updatedAt: "May 28, 2026",
  },
  {
    id: "mock-2026-05-26-1",
    title: "Monthly recap",
    platform: "YouTube",
    category: "Post",
    date: "2026-05-26",
    status: "Draft",
    updatedAt: "May 28, 2026",
  },
  {
    id: "mock-2026-05-26-2",
    title: "Thumbnail idea",
    platform: "YouTube",
    category: "Post",
    date: "2026-05-26",
    status: "In progress",
    updatedAt: "May 28, 2026",
  },
];

type DraftsContextValue = {
  drafts: Draft[];
  addDraft: (d: Omit<Draft, "id" | "updatedAt">) => void;
  updateDraft: (id: string, patch: Omit<Partial<Draft>, "id">) => void;
};

const DraftsContext = createContext<DraftsContextValue | undefined>(undefined);

export function DraftsProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<Draft[]>(seedDrafts);

  // Hydrate from localStorage on first mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nanas_drafts");
      if (raw) {
        const parsed = JSON.parse(raw) as Draft[];
        setDrafts(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist drafts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("nanas_drafts", JSON.stringify(drafts));
    } catch (e) {
      // ignore quota / serialization errors
    }
  }, [drafts]);

  function addDraft(d: Omit<Draft, "id" | "updatedAt">) {
    const now = new Date();
    const newDraft: Draft = {
      id: `${now.getTime()}`,
      updatedAt: format(now, "PP"),
      title: d.title,
      platform: d.platform,
      category: d.category,
      date: d.date,
      status: d.status ?? "Draft",
    };

    setDrafts((s) => [newDraft, ...s]);
  }

  function updateDraft(id: string, patch: Omit<Partial<Draft>, "id">) {
    const now = new Date();

    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === id
          ? {
              ...draft,
              ...patch,
              updatedAt: format(now, "PP"),
            }
          : draft,
      ),
    );
  }

  return (
    <DraftsContext.Provider value={{ drafts, addDraft, updateDraft }}>
      {children}
    </DraftsContext.Provider>
  );
}

export function useDrafts() {
  const ctx = useContext(DraftsContext);
  if (!ctx) throw new Error("useDrafts must be used within DraftsProvider");
  return ctx;
}
