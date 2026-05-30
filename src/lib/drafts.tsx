"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import parseAngles from "@/lib/ai-parser";

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

export type RawIdea = {
  id: string;
  title: string;
  platform: string;
  createdAt: string;
};

// Database Preset Schemas
export const presetPlatforms = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Facebook", "Twitter / X"];
export const presetCategories = ["Stories", "Reels", "Post"];
export const presetTones = ["Informative", "Hype", "Storytelling", "Professional"];

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
    platform: "LinkedIn",
    category: "Post",
    date: "2026-05-08",
    status: "Draft",
    updatedAt: "May 28, 2026",
    content: "Explain how our team modularized a 1000 line tip-tap editor into 3 clean sub-components in less than an hour, keeping LocalStorage features 100% active.",
  },
  {
    id: "mock-2026-05-15-1",
    title: "Vlog outline",
    platform: "YouTube",
    category: "Reels",
    date: "2026-05-15",
    status: "Published",
    updatedAt: "May 28, 2026",
    content: "Scene 1: Waking up in a modern apartment, coffee brewing. Overlay text: 'DeepMind pair programming session starts'.\nScene 2: Over the shoulder shot of standard Next.js directory tree.\nScene 3: Quick time lapse showing clean git diffs.\nScene 4: Happy coding face.",
  },
  {
    id: "mock-2026-05-22-1",
    title: "Productivity stats",
    platform: "Instagram",
    category: "Stories",
    date: "2026-05-22",
    status: "Draft",
    updatedAt: "May 28, 2026",
    content: "A quick infographic comparing raw coding hours versus pair programming with Antigravity AI CLI. Highlighting an 83% speed increment.",
  },
  {
    id: "mock-2026-05-26-1",
    title: "Community wrap up",
    platform: "LinkedIn",
    category: "Post",
    date: "2026-05-26",
    status: "Published",
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
  addDraft: (d: Omit<Draft, "id" | "updatedAt">, silent?: boolean) => string;
  updateDraft: (id: string, patch: Omit<Partial<Draft>, "id">) => void;
  deleteDraft: (id: string) => void;
  deleteDrafts: (ids: string[]) => void;
  saveDraftAsTemplate: (draftId: string) => void;
  ideas: Idea[];
  addIdea: (idea: Omit<Idea, "id" | "createdAt">, silent?: boolean) => void;
  deleteIdea: (id: string, silent?: boolean) => void;
  clearAllIdeas: () => void;
  
  // Raw Ideas (stored in Pustaka and sent to brainstorm)
  rawIdeas: RawIdea[];
  addRawIdea: (title: string, platform?: string) => void;
  deleteRawIdea: (id: string) => void;

  // Relational custom states combined
  platforms: string[];
  categories: string[];
  tones: string[];
  addCustomPlatform: (name: string) => void;
  addCustomCategory: (name: string) => void;
  addCustomTone: (name: string) => void;

  // Centralized AI Brainstorm Streaming lifecycle states
  isGenerating: boolean;
  generationStep: 1 | 2 | 3 | 4 | 5;
  displayProgress: number;
  brainstormTopic: string;
  setBrainstormTopic: (v: string) => void;
  brainstormPlatform: string;
  setBrainstormPlatform: (v: string) => void;
  brainstormTone: string;
  setBrainstormTone: (v: string) => void;
  generateBrainstormIdeas: (topic: string, platform: string, tone: string) => Promise<void>;
};

const DraftsContext = createContext<DraftsContextValue | undefined>(undefined);

export function DraftsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  const [drafts, setDrafts] = useState<Draft[]>(seedDrafts);
  const [ideas, setIdeas] = useState<Idea[]>(seedIdeas);
  const [rawIdeas, setRawIdeas] = useState<RawIdea[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Relational Local collections
  const [customPlatforms, setCustomPlatforms] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customTones, setCustomTones] = useState<string[]>([]);

  // Centralized AI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [brainstormTopic, setBrainstormTopic] = useState("");
  const [brainstormPlatform, setBrainstormPlatform] = useState("Instagram");
  const [brainstormTone, setBrainstormTone] = useState("Informative");

  // Hydrate from localStorage on first mount (client-only)
  useEffect(() => {
    try {
      const rawDrafts = localStorage.getItem("nanas_drafts");
      if (rawDrafts) {
        const parsed = JSON.parse(rawDrafts) as Draft[];
        setDrafts(parsed);
      } else {
        localStorage.setItem("nanas_drafts", JSON.stringify(seedDrafts));
      }
    } catch (e) {
      // ignore
    }

    try {
      const rawIdeas = localStorage.getItem("nanas_ideas");
      if (rawIdeas) {
        const parsed = JSON.parse(rawIdeas) as Idea[];
        setIdeas(parsed);
      } else {
        localStorage.setItem("nanas_ideas", JSON.stringify(seedIdeas));
      }
    } catch (e) {
      // ignore
    }

    try {
      const storedRaw = localStorage.getItem("nanas_raw_ideas");
      if (storedRaw) {
        const parsed = JSON.parse(storedRaw);
        const mapped = parsed.map((item: any) => ({
          id: item.id,
          title: item.title || item.content || "",
          platform: item.platform || "Instagram",
          createdAt: item.createdAt,
        })) as RawIdea[];
        setRawIdeas(mapped);
      } else {
        const initialRaw: RawIdea[] = [
          {
            id: "raw-seed-1",
            title: "5 Tips Optimasi Reels yang Jarang Diketahui",
            platform: "Instagram",
            createdAt: new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          },
          {
            id: "raw-seed-2",
            title: "Mengapa Setup Database Postgres Terlalu Dini Bisa Membunuh Side-Project",
            platform: "LinkedIn",
            createdAt: new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          }
        ];
        setRawIdeas(initialRaw);
        localStorage.setItem("nanas_raw_ideas", JSON.stringify(initialRaw));
      }
    } catch (e) {
      // ignore
    }

    // Hydrate relational dynamic customizations
    try {
      const rawCustomPlat = localStorage.getItem("nanas_custom_platforms");
      if (rawCustomPlat) setCustomPlatforms(JSON.parse(rawCustomPlat));
      
      const rawCustomCat = localStorage.getItem("nanas_custom_categories");
      if (rawCustomCat) setCustomCategories(JSON.parse(rawCustomCat));

      const rawCustomTone = localStorage.getItem("nanas_custom_tones");
      if (rawCustomTone) setCustomTones(JSON.parse(rawCustomTone));
    } catch (e) {
      // ignore
    }

    setIsHydrated(true);
  }, []);

  // Persist drafts to localStorage whenever they change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("nanas_drafts", JSON.stringify(drafts));
    } catch (e) {
      // ignore quota / serialization errors
    }
  }, [drafts, isHydrated]);

  // Persist raw ideas to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("nanas_raw_ideas", JSON.stringify(rawIdeas));
    } catch (e) {
      // ignore
    }
  }, [rawIdeas, isHydrated]);

  // Persist ideas to localStorage whenever they change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("nanas_ideas", JSON.stringify(ideas));
    } catch (e) {
      // ignore quota / serialization errors
    }
  }, [ideas, isHydrated]);

  // Centralized smooth AI timer RequestAnimationFrame lifecycle
  useEffect(() => {
    if (!isGenerating) {
      setDisplayProgress(0);
      return;
    }
    const targetProgress =
      generationStep === 1
        ? 0
        : generationStep === 2
          ? 35
          : generationStep === 3
            ? 65
            : generationStep === 4
              ? 90
              : 100;

    let raf = 0;

    const animate = () => {
      setDisplayProgress((prev) => {
        const diff = targetProgress - prev;
        const nextVal = prev + diff * 0.08;
        if (Math.abs(diff) < 0.2) return targetProgress;
        raf = requestAnimationFrame(animate);
        return nextVal;
      });
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, [generationStep, isGenerating]);

  // Relational Custom additions with async-ready handlers
  const addCustomPlatform = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomPlatforms((prev) => {
      if (prev.includes(trimmed) || presetPlatforms.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      localStorage.setItem("nanas_custom_platforms", JSON.stringify(updated));
      return updated;
    });
  };

  const addCustomCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomCategories((prev) => {
      if (prev.includes(trimmed) || presetCategories.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      localStorage.setItem("nanas_custom_categories", JSON.stringify(updated));
      return updated;
    });
  };

  const addCustomTone = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomTones((prev) => {
      if (prev.includes(trimmed) || presetTones.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      localStorage.setItem("nanas_custom_tones", JSON.stringify(updated));
      return updated;
    });
  };

  async function generateBrainstormIdeas(topic: string, platform: string, tone: string) {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGenerationStep(1);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: topic,
          commandType: "brainstorm",
          draftMeta: { platform, status: tone },
        }),
      });

      if (!response.ok || !response.body)
        throw new Error("Gagal memanggil AI Agent.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedText += decoder.decode(value, { stream: true });

        if (
          accumulatedText.length > 0 &&
          !accumulatedText.includes("=== ANGLE 2 ===")
        ) {
          setGenerationStep(2);
        } else if (
          accumulatedText.includes("=== ANGLE 2 ===") &&
          !accumulatedText.includes("=== ANGLE 3 ===")
        ) {
          setGenerationStep(3);
        } else if (accumulatedText.includes("=== ANGLE 3 ===")) {
          setGenerationStep(4);
        }
      }

      setGenerationStep(5);

      const parsedAngles = parseAngles(accumulatedText);
      if (parsedAngles.length === 0)
        throw new Error(
          "Format respons AI tidak sesuai. Pastikan API mengembalikan struktur ANGLE.",
        );

      for (let i = parsedAngles.length - 1; i >= 0; i--) {
        addIdea({
          title: parsedAngles[i].title,
          platform,
          hook: parsedAngles[i].hook,
          outline: parsedAngles[i].outline,
        }, true);
      }

      setBrainstormTopic(""); // Clear topic upon completion
      toast.success("AI berhasil merancang 3 sudut pandang kreatif!");
    } catch (err: any) {
      console.error("Brainstorm AI Error:", err);
      toast.error(err.message || "Terjadi kesalahan saat menghubungi AI.");
    } finally {
      setIsGenerating(false);
      setGenerationStep(1);
    }
  }

  function addDraft(d: Omit<Draft, "id" | "updatedAt">, silent = false): string {
    const now = new Date();
    const newId = `${now.getTime()}`;
    const newDraft: Draft = {
      id: newId,
      updatedAt: format(now, "PP"),
      title: d.title,
      platform: d.platform,
      category: d.category,
      date: d.date,
      status: d.status ?? "Draft",
      content: d.content ?? "",
    };

    setDrafts((s) => [newDraft, ...s]);
    if (!silent) {
      toast.success(`Draft "${d.title}" berhasil ditambahkan!`, {
        action: {
          label: "Lihat Draft",
          onClick: () => router.push(`/drafts/${newId}`),
        },
      });
    }
    return newId;
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
    const found = drafts.find((d) => d.id === id);
    if (!found) return;

    setDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== id));

    // Show single Undo toast
    toast.error(`Draft "${found.title}" telah dihapus.`, {
      action: {
        label: "Undo",
        onClick: () => {
          setDrafts((currentDrafts) => {
            if (currentDrafts.some((d) => d.id === found.id)) return currentDrafts;
            return [found, ...currentDrafts];
          });
          toast.success(`Draft "${found.title}" berhasil dipulihkan!`);
        },
      },
    });
  }

  function deleteDrafts(ids: string[]) {
    const found = drafts.filter((d) => ids.includes(d.id));
    if (found.length === 0) return;

    setDrafts((currentDrafts) => currentDrafts.filter((draft) => !ids.includes(draft.id)));

    // Show single bulk Undo toast
    toast.error(`${found.length} draft telah dihapus.`, {
      action: {
        label: "Undo",
        onClick: () => {
          setDrafts((currentDrafts) => {
            const toAdd = found.filter((f) => !currentDrafts.some((d) => d.id === f.id));
            return [...toAdd, ...currentDrafts];
          });
          toast.success(`${found.length} draf berhasil dipulihkan!`);
        },
      },
    });
  }

  function addIdea(idea: Omit<Idea, "id" | "createdAt">, silent = false) {
    const now = new Date();
    const newIdea: Idea = {
      id: `idea-${now.getTime()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: format(now, "PP"),
      title: idea.title,
      platform: idea.platform,
      hook: idea.hook,
      outline: idea.outline,
    };

    setIdeas((currentIdeas) => [newIdea, ...currentIdeas]);
    if (!silent) {
      toast.success(`Ide "${idea.title}" disimpan ke Funnel!`);
    }
  }

  function deleteIdea(id: string, silent = false) {
    const index = ideas.findIndex((i) => i.id === id);
    if (index === -1) return;
    const found = ideas[index];

    setIdeas((currentIdeas) => currentIdeas.filter((idea) => idea.id !== id));

    if (!silent) {
      toast.error(`Ide "${found.title}" telah dihapus.`, {
        action: {
          label: "Undo",
          onClick: () => {
            setIdeas((currentIdeas) => {
              if (currentIdeas.some((i) => i.id === found.id)) return currentIdeas;
              const updated = [...currentIdeas];
              updated.splice(index, 0, found);
              return updated;
            });
            toast.success(`Ide "${found.title}" berhasil dipulihkan!`);
          },
        },
      });
    }
  }

  function clearAllIdeas() {
    if (ideas.length === 0) return;
    const previousIdeas = [...ideas];
    setIdeas([]);
    toast.error("Semua ide brainstorming telah dihapus.", {
      action: {
        label: "Undo",
        onClick: () => {
          setIdeas(previousIdeas);
          toast.success("Semua ide brainstorming berhasil dipulihkan!");
        },
      },
    });
  }

  function saveDraftAsTemplate(draftId: string) {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    try {
      const stored = localStorage.getItem("nanas_custom_templates");
      const currentTemplates = stored ? JSON.parse(stored) : [];

      const blueprintHtml = `<h3><strong>[TEMPLAT KONSEP REUSE]</strong></h3>\n<p>Outline/Skrip yang disimpan dari draf: "${draft.title}"</p>\n<pre><code>${draft.content || ""}</code></pre>`;

      const newTemplate = {
        title: `${draft.title} (Reused)`,
        type: "Draft Backup",
        usage: "0 kali digunakan",
        platform: draft.platform || "Instagram",
        category: draft.category || "Post",
        description: `Templat buatan sendiri yang di-reuse dari draf konten: "${draft.title}"`,
        blueprint: blueprintHtml,
        isCustom: true,
      };

      if (currentTemplates.some((t: any) => t.title === newTemplate.title)) {
        toast.error("Templat dengan nama yang sama sudah ada di Library!");
        return;
      }

      const updated = [newTemplate, ...currentTemplates];
      localStorage.setItem("nanas_custom_templates", JSON.stringify(updated));

      toast.success(
        `Draf "${draft.title}" berhasil disimpan sebagai Templat Kustom di Pustaka!`,
        {
          action: {
            label: "Buka Pustaka",
            onClick: () => router.push("/library?tab=templates"),
          },
        },
      );
    } catch (e) {
      toast.error("Gagal menyimpan sebagai templat.");
    }
  }

  function addRawIdea(title: string, platform = "Instagram") {
    const now = new Date();
    const newIdea: RawIdea = {
      id: `raw-${now.getTime()}-${Math.random().toString(36).substring(2, 9)}`,
      title: title.trim(),
      platform,
      createdAt: now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    setRawIdeas((prev) => [newIdea, ...prev]);
    toast.success(`Ide mentah "${title}" berhasil disimpan di Pustaka!`, {
      action: {
        label: "Buka Pustaka",
        onClick: () => router.push("/library?tab=raw_ideas"),
      },
    });
  }

  function deleteRawIdea(id: string) {
    const index = rawIdeas.findIndex((i) => i.id === id);
    if (index === -1) return;
    const found = rawIdeas[index];

    setRawIdeas((prev) => prev.filter((i) => i.id !== id));
    toast.error(`Ide mentah "${found.title}" telah dihapus.`, {
      action: {
        label: "Undo",
        onClick: () => {
          setRawIdeas((prev) => {
            if (prev.some((i) => i.id === found.id)) return prev;
            const updated = [...prev];
            updated.splice(index, 0, found);
            return updated;
          });
          toast.success(`Ide mentah "${found.title}" berhasil dipulihkan!`);
        },
      },
    });
  }

  return (
    <DraftsContext.Provider
      value={{
        drafts,
        addDraft,
        updateDraft,
        deleteDraft,
        deleteDrafts,
        saveDraftAsTemplate,
        ideas,
        addIdea,
        deleteIdea,
        clearAllIdeas,

        // Raw ideas state & operations
        rawIdeas,
        addRawIdea,
        deleteRawIdea,
        
        // Relational custom states combined
        platforms: [...presetPlatforms, ...customPlatforms],
        categories: [...presetCategories, ...customCategories],
        tones: [...presetTones, ...customTones],
        addCustomPlatform,
        addCustomCategory,
        addCustomTone,

        // Centralized AI states
        isGenerating,
        generationStep,
        displayProgress,
        brainstormTopic,
        setBrainstormTopic,
        brainstormPlatform,
        setBrainstormPlatform,
        brainstormTone,
        setBrainstormTone,
        generateBrainstormIdeas,
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

export type DraftRevision = {
  id: string;
  draftId: string;
  title: string;
  content: string;
  timestamp: number;
};

export function getRevisions(draftId: string): DraftRevision[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("nanas_draft_revisions");
    if (!stored) return [];
    const allRevisions: DraftRevision[] = JSON.parse(stored);
    return allRevisions
      .filter((rev) => rev.draftId === draftId)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    return [];
  }
}

export function saveRevision(draftId: string, title: string, content: string): DraftRevision[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("nanas_draft_revisions");
    const allRevisions: DraftRevision[] = stored ? JSON.parse(stored) : [];

    // Check if the exact same content is already the latest revision for this draft to avoid duplicates
    const draftRevisions = allRevisions
      .filter((rev) => rev.draftId === draftId)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (draftRevisions.length > 0 && draftRevisions[0].content === content) {
      return draftRevisions; // No need to save a duplicate revision
    }

    const newRevision: DraftRevision = {
      id: `rev-${Date.now()}`,
      draftId,
      title,
      content,
      timestamp: Date.now(),
    };

    const updatedAll = [newRevision, ...allRevisions];

    // Limit to 5 revisions per draft to optimize localStorage usage
    const filteredDraftRevisions = updatedAll.filter((rev) => rev.draftId === draftId).slice(0, 5);
    const otherDraftsRevisions = updatedAll.filter((rev) => rev.draftId !== draftId);
    const finalRevisions = [...filteredDraftRevisions, ...otherDraftsRevisions];

    localStorage.setItem("nanas_draft_revisions", JSON.stringify(finalRevisions));
    return filteredDraftRevisions;
  } catch (e) {
    return [];
  }
}
