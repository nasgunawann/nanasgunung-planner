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
  content?: string; // Content brief, script, or storyboard details
};

export type Idea = {
  id: string;
  title: string;
  platform: string;
  hook: string;
  outline: string;
  createdAt: string;
};

export const seedDrafts: Draft[] = [
  {
    id: "mock-2026-05-03-1",
    title: "Teaser Reel",
    platform: "Instagram",
    category: "Reels",
    date: "2026-05-03",
    status: "Published",
    updatedAt: "May 03, 2026",
    content: "Hook: If you are still building state like it's 2018, stop!\n\nScene 1: Close up of keyboard with dynamic red overlay. text: 'Old Way'.\nScene 2: Transition to clean React context structure. text: 'Refactored!'.\nScene 3: CTA to read the bio for details.",
  },
  {
    id: "mock-2026-05-03-2",
    title: "Carousel Hook",
    platform: "TikTok",
    category: "Post",
    date: "2026-05-03",
    status: "In progress",
    updatedAt: "May 28, 2026",
    content: "Slide 1: Why Next.js 15 is a game changer for content creators.\nSlide 2: Speed metrics showing pnpm vs npm.\nSlide 3: Code snippets comparing Server Actions.\nSlide 4: Call to action to leave a comment.",
  },
  {
    id: "mock-2026-05-08-1",
    title: "Behind the scenes",
    platform: "Instagram",
    category: "Stories",
    date: "2026-05-08",
    status: "Published",
    updatedAt: "May 08, 2026",
    content: "Quick photo of the new physical planner layout on the desk.\nCaption: 'Designing the ultimate planner. What features do you want to see? Link in bio to vote!'",
  },
  {
    id: "mock-2026-05-08-2",
    title: "Promo caption",
    platform: "Instagram",
    category: "Post",
    date: "2026-05-08",
    status: "Draft",
    updatedAt: "May 28, 2026",
    content: "Drafting the launch post script. Focus on solving the creator burnout problem through better planning.",
  },
  {
    id: "mock-2026-05-08-3",
    title: "Story sequence",
    platform: "Instagram",
    category: "Stories",
    date: "2026-05-08",
    status: "In progress",
    updatedAt: "May 28, 2026",
    content: "Sequence of 3 stories:\nStory 1: Interactive poll: 'Do you schedule your posts?'\nStory 2: Responding to results showing that 80% don't.\nStory 3: Introduction of Nanasgunung Planner.",
  },
  {
    id: "mock-2026-05-14-1",
    title: "Launch post",
    platform: "LinkedIn",
    category: "Post",
    date: "2026-05-14",
    status: "Published",
    updatedAt: "May 14, 2026",
    content: "Today we are officially launching Nanasgunung Planner! 🎉\n\nBuilt for content creators who are tired of heavy project management software. Designed to be lightweight, instant, and offline-first.\n\nRead the full developer journey below 👇",
  },
  {
    id: "mock-2026-05-14-2",
    title: "Short-form cut",
    platform: "TikTok",
    category: "Reels",
    date: "2026-05-14",
    status: "Draft",
    updatedAt: "May 28, 2026",
    content: "A short 15-second teaser showing the drag & drop interface in action. Upbeat lofi track in the background.",
  },
  {
    id: "mock-2026-05-20-1",
    title: "Q&A prompt",
    platform: "Instagram",
    category: "Stories",
    date: "2026-05-20",
    status: "Published",
    updatedAt: "May 20, 2026",
    content: "Using the Q&A sticker to ask followers about their biggest content organization struggle.",
  },
  {
    id: "mock-2026-05-26-1",
    title: "Monthly recap",
    platform: "YouTube",
    category: "Post",
    date: "2026-05-26",
    status: "Draft",
    updatedAt: "May 28, 2026",
    content: "Community post script for the monthly wrap up. Announcing the top 3 tools that saved our workflow.",
  },
  {
    id: "mock-2026-05-26-2",
    title: "Thumbnail idea",
    platform: "YouTube",
    category: "Post",
    date: "2026-05-26",
    status: "In progress",
    updatedAt: "May 28, 2026",
    content: "A layout containing a side-by-side comparison of a chaotic Google Calendar vs the clean Nanasgunung Planner grid. Highlight with bright green arrows.",
  },
];

export const seedIdeas: Idea[] = [
  {
    id: "idea-1",
    title: "10x Productivity Tips for Creators",
    platform: "Instagram",
    hook: "You are not lazy, your tools are just slowing you down.",
    outline: "1. Batching visual design\n2. Automating file transfers\n3. Restricting notifications to 2 specific slots a day.",
    createdAt: "May 28, 2026",
  },
  {
    id: "idea-2",
    title: "Why I Avoid Heavy Databases for Side-Projects",
    platform: "LinkedIn",
    hook: "Stop setting up PostgreSQL for an app with 5 users.",
    outline: "Explain how SQLite or browser LocalStorage is more than enough for building initial MVPs, boosting launch speeds by 2 weeks.",
    createdAt: "May 28, 2026",
  },
];

type DraftsContextValue = {
  drafts: Draft[];
  addDraft: (d: Omit<Draft, "id" | "updatedAt">) => void;
  updateDraft: (id: string, patch: Omit<Partial<Draft>, "id">) => void;
  deleteDraft: (id: string) => void;
  ideas: Idea[];
  addIdea: (idea: Omit<Idea, "id" | "createdAt">) => void;
  deleteIdea: (id: string) => void;
};

const DraftsContext = createContext<DraftsContextValue | undefined>(undefined);

export function DraftsProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<Draft[]>(seedDrafts);
  const [ideas, setIdeas] = useState<Idea[]>(seedIdeas);

  // Hydrate from localStorage on first mount (client-only)
  useEffect(() => {
    try {
      const rawDrafts = localStorage.getItem("nanas_drafts");
      if (rawDrafts) {
        const parsed = JSON.parse(rawDrafts) as Draft[];
        setDrafts(parsed);
      }
    } catch (e) {
      // ignore
    }

    try {
      const rawIdeas = localStorage.getItem("nanas_ideas");
      if (rawIdeas) {
        const parsed = JSON.parse(rawIdeas) as Idea[];
        setIdeas(parsed);
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

  // Persist ideas to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("nanas_ideas", JSON.stringify(ideas));
    } catch (e) {
      // ignore quota / serialization errors
    }
  }, [ideas]);

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
      content: d.content ?? "",
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

  function deleteDraft(id: string) {
    setDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== id));
  }

  function addIdea(idea: Omit<Idea, "id" | "createdAt">) {
    const now = new Date();
    const newIdea: Idea = {
      id: `idea-${now.getTime()}`,
      createdAt: format(now, "PP"),
      title: idea.title,
      platform: idea.platform,
      hook: idea.hook,
      outline: idea.outline,
    };

    setIdeas((currentIdeas) => [newIdea, ...currentIdeas]);
  }

  function deleteIdea(id: string) {
    setIdeas((currentIdeas) => currentIdeas.filter((idea) => idea.id !== id));
  }

  return (
    <DraftsContext.Provider
      value={{
        drafts,
        addDraft,
        updateDraft,
        deleteDraft,
        ideas,
        addIdea,
        deleteIdea,
      }}
    >
      {children}
    </DraftsContext.Provider>
  );
}

export function useDrafts() {
  const ctx = useContext(DraftsContext);
  if (!ctx) throw new Error("useDrafts must be used within DraftsProvider");
  return ctx;
}
