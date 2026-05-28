"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { format } from "date-fns";

export type Draft = {
  id: string;
  title: string;
  platform?: string;
  date?: string; // yyyy-MM-dd
  status?: string;
  updatedAt: string;
};

type DraftsContextValue = {
  drafts: Draft[];
  addDraft: (d: Omit<Draft, "id" | "updatedAt">) => void;
};

const DraftsContext = createContext<DraftsContextValue | undefined>(undefined);

export function DraftsProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);

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
      date: d.date,
      status: d.status ?? "Draft",
    };

    setDrafts((s) => [newDraft, ...s]);
  }

  return (
    <DraftsContext.Provider value={{ drafts, addDraft }}>
      {children}
    </DraftsContext.Provider>
  );
}

export function useDrafts() {
  const ctx = useContext(DraftsContext);
  if (!ctx) throw new Error("useDrafts must be used within DraftsProvider");
  return ctx;
}
