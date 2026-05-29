"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getRevisions, saveRevision, type DraftRevision } from "@/lib/drafts";
import { useDrafts } from "@/lib/drafts";

export function useDraftWorkspace(draftId?: string) {
  const { drafts, updateDraft } = useDrafts();
  const draft = drafts.find((d) => d.id === draftId);

  const [localTitle, setLocalTitle] = useState("");
  const [localContent, setLocalContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [snippets, setSnippets] = useState<Array<any>>([]);
  const [snippetSearchQuery, setSnippetSearchQuery] = useState("");
  const [selectedSnippetCategory, setSelectedSnippetCategory] = useState("All");
  const [insertTrigger, setInsertTrigger] = useState<{
    text: string;
    time: number;
  } | null>(null);
  const [revisions, setRevisions] = useState<DraftRevision[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nanas_snippets");
      if (stored) {
        setSnippets(JSON.parse(stored));
      } else {
        const defaultSnippets = [
          {
            id: "snip-1",
            title: "CTA Follow Standard",
            content:
              "Jangan lupa untuk follow @nanasgunung untuk tips menarik seputar Web Development & Design setiap hari! 🚀",
          },
          {
            id: "snip-2",
            title: "Kumpulan Hashtag Tech",
            content:
              "#nextjs #typescript #programmerindonesia #webdev #codinglife #belajarcoding",
          },
          {
            id: "snip-3",
            title: "Closing Post LinkedIn",
            content:
              "Bagaimana dengan workflow tim Anda saat membangun MVP? Mari diskusi di kolom komentar! 👇",
          },
        ];
        setSnippets(defaultSnippets);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Initial sync
  useEffect(() => {
    if (draft) {
      setLocalTitle(draft.title);
      setLocalContent(draft.content ?? "");
    }
  }, [draft?.id]);

  // Load revisions and create initial snapshot
  useEffect(() => {
    if (!draft) return;
    const existing = getRevisions(draft.id);
    setRevisions(existing);
    if (draft.content) {
      const updated = saveRevision(draft.id, draft.title, draft.content);
      setRevisions(updated);
    }
  }, [draft?.id]);

  // Auto-save content (debounced)
  useEffect(() => {
    if (!draft || localContent === (draft.content ?? "")) return;
    setSaveStatus("saving");
    const t = setTimeout(() => {
      updateDraft(draft.id, { content: localContent });
      setSaveStatus("saved");
    }, 600);
    return () => clearTimeout(t);
  }, [localContent, draft?.id]);

  // Auto-save title (debounced)
  useEffect(() => {
    if (!draft || localTitle === draft.title) return;
    setSaveStatus("saving");
    const t = setTimeout(() => {
      updateDraft(draft.id, { title: localTitle });
      setSaveStatus("saved");
    }, 600);
    return () => clearTimeout(t);
  }, [localTitle, draft?.id]);

  const handleCreateManualBackup = () => {
    if (!draft) return;
    const updated = saveRevision(draft.id, draft.title, localContent);
    setRevisions(updated);
    toast.success("Cadangan versi draf berhasil dibuat!");
  };

  const handleRestoreRevision = (rev: DraftRevision) => {
    if (!draft) return;
    saveRevision(draft.id, draft.title, localContent);
    setLocalContent(rev.content);
    updateDraft(draft.id, { content: rev.content });
    const updated = getRevisions(draft.id);
    setRevisions(updated);
    toast.success(
      `Draf dipulihkan ke versi (${new Date(rev.timestamp).toLocaleTimeString()})!`,
    );
  };

  const snippetCategories = Array.from(
    new Set(snippets.map((s) => s.category).filter(Boolean)),
  );

  const filteredSnippets = snippets.filter((s) => {
    const matchesCategory =
      selectedSnippetCategory === "All" ||
      s.category === selectedSnippetCategory;
    const q = snippetSearchQuery.toLowerCase();
    const matchesSearch =
      s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleDropdownChange = (field: string, value: string) => {
    if (!draft) return;
    setSaveStatus("saving");
    updateDraft(draft.id, { [field]: value } as any);
    setTimeout(() => setSaveStatus("saved"), 400);
  };

  return {
    draft,
    localTitle,
    setLocalTitle,
    localContent,
    setLocalContent,
    saveStatus,
    isLibraryOpen,
    setIsLibraryOpen,
    isHistoryOpen,
    setIsHistoryOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    snippets,
    snippetSearchQuery,
    setSnippetSearchQuery,
    selectedSnippetCategory,
    setSelectedSnippetCategory,
    snippetCategories,
    filteredSnippets,
    insertTrigger,
    setInsertTrigger,
    revisions,
    handleCreateManualBackup,
    handleRestoreRevision,
    handleDropdownChange,
  };
}

export default useDraftWorkspace;
