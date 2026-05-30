"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDrafts } from "@/lib/drafts";
import { toast } from "sonner";
import {
  defaultSnippetCategories,
  defaultSnippets,
  defaultTemplates,
  type Snippet,
  type Template,
} from "@/lib/library-seed";

export type LibraryDeleteItem = {
  id: string;
  title: string;
  type: "template" | "snippet";
} | null;

export function useLibraryData() {
  const { addDraft } = useDrafts();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "templates" | "snippets" | "raw_ideas" | "history"
  >("templates");
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetContent, setSnippetContent] = useState("");
  const [snippetCategory, setSnippetCategory] = useState("CTA");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(
    defaultSnippetCategories as unknown as string[]
  );
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSnippetId, setEditingSnippetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [isSnippetTipOpen, setIsSnippetTipOpen] = useState(true);
  const [expandedTemplates, setExpandedTemplates] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<LibraryDeleteItem>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        if (tabParam && ["templates", "snippets", "raw_ideas", "history"].includes(tabParam)) {
          setActiveTab(tabParam as any);
        }
      }

      const storedSnippets = localStorage.getItem("nanas_snippets");
      if (storedSnippets) {
        setSnippets(JSON.parse(storedSnippets));
      } else {
        setSnippets(defaultSnippets);
        localStorage.setItem("nanas_snippets", JSON.stringify(defaultSnippets));
      }

      const storedCategories = localStorage.getItem("nanas_snippet_categories");
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        localStorage.setItem(
          "nanas_snippet_categories",
          JSON.stringify(defaultSnippetCategories),
        );
      }

      const storedCustomTemplates = localStorage.getItem(
        "nanas_custom_templates",
      );
      if (storedCustomTemplates) {
        setTemplates(JSON.parse(storedCustomTemplates));
      } else {
        setTemplates(defaultTemplates);
        localStorage.setItem(
          "nanas_custom_templates",
          JSON.stringify(defaultTemplates),
        );
      }
    } catch {
      // ignore hydration errors
    }
  }, []);

  // Listen to cross-component sync event when adding snippets from FAB modal
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem("nanas_snippets");
        if (stored) {
          setSnippets(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Library sync error:", e);
      }
    };

    window.addEventListener("nanas-library-updated", handleSync);
    return () => window.removeEventListener("nanas-library-updated", handleSync);
  }, []);

  const saveSnippets = (newSnippets: Snippet[]) => {
    setSnippets(newSnippets);
    try {
      localStorage.setItem("nanas_snippets", JSON.stringify(newSnippets));
    } catch {
      // ignore storage errors
    }
  };

  const saveCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    try {
      localStorage.setItem(
        "nanas_snippet_categories",
        JSON.stringify(newCategories),
      );
    } catch {
      // ignore storage errors
    }
  };

  const saveCustomTemplates = (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    try {
      localStorage.setItem(
        "nanas_custom_templates",
        JSON.stringify(newTemplates),
      );
    } catch {
      // ignore storage errors
    }
  };

  const toggleTemplateExpand = (title: string) => {
    setExpandedTemplates((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  const handleAddCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const formatted = newCategoryName.trim();
    if (!categories.includes(formatted)) {
      const updated = [...categories, formatted];
      saveCategories(updated);
      setSnippetCategory(formatted);
    }
    setNewCategoryName("");
    setIsAddingNewCategory(false);
  };

  const handleAddSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetTitle.trim() || !snippetContent.trim()) return;

    const newSnippet: Snippet = {
      id: `snip-${Date.now()}`,
      title: snippetTitle.trim(),
      content: snippetContent.trim(),
      category: snippetCategory,
      tags: [],
    };

    saveSnippets([newSnippet, ...snippets]);
    setSnippetTitle("");
    setSnippetContent("");
  };

  const addSnippetDirect = (newSnippet: Omit<Snippet, "id" | "tags">) => {
    const updatedSnippet: Snippet = {
      id: `snip-${Date.now()}`,
      ...newSnippet,
      tags: [],
    };
    const updatedList = [updatedSnippet, ...snippets];
    saveSnippets(updatedList);
    
    // Trigger global sync event
    window.dispatchEvent(new Event("nanas-library-updated"));
    toast.success(`Aset "${newSnippet.title}" berhasil ditambahkan!`);
  };

  const confirmDelete = (
    id: string,
    title: string,
    type: "template" | "snippet",
  ) => {
    setItemToDelete({ id, title, type });
    setDeleteDialogOpen(true);
  };

  const handleUndo = (itemToRestore: {
    type: "template" | "snippet";
    data: any;
    index: number;
  }) => {
    const { type, data, index } = itemToRestore;

    if (type === "template") {
      setTemplates((prev) => {
        const updated = [...prev];
        updated.splice(index, 0, data);
        try {
          localStorage.setItem(
            "nanas_custom_templates",
            JSON.stringify(updated),
          );
        } catch {
          // ignore storage errors
        }
        return updated;
      });
      toast.success(`Templat "${data.title}" berhasil dipulihkan!`);
      return;
    }

    setSnippets((prev) => {
      const updated = [...prev];
      updated.splice(index, 0, data);
      try {
        localStorage.setItem("nanas_snippets", JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
    toast.success(`Snippet "${data.title}" berhasil dipulihkan!`);
  };

  const executeDelete = () => {
    if (!itemToDelete) return;

    const { id, title, type } = itemToDelete;

    if (type === "template") {
      const index = templates.findIndex((template) => template.title === id);
      if (index !== -1) {
        const deletedObj = templates[index];
        const updated = templates.filter((template) => template.title !== id);

        setTemplates(updated);
        try {
          localStorage.setItem(
            "nanas_custom_templates",
            JSON.stringify(updated),
          );
        } catch {
          // ignore storage errors
        }

        toast.success(`Templat "${title}" berhasil dihapus!`, {
          action: {
            label: "Undo",
            onClick: () => handleUndo({ type, data: deletedObj, index }),
          },
        });
      }
    } else {
      const index = snippets.findIndex((snippet) => snippet.id === id);
      if (index !== -1) {
        const deletedObj = snippets[index];
        const updated = snippets.filter((snippet) => snippet.id !== id);

        setSnippets(updated);
        try {
          localStorage.setItem("nanas_snippets", JSON.stringify(updated));
        } catch {
          // ignore storage errors
        }

        if (editingSnippetId === id) setEditingSnippetId(null);

        toast.success(`Snippet "${title}" berhasil dihapus!`, {
          action: {
            label: "Undo",
            onClick: () => handleUndo({ type, data: deletedObj, index }),
          },
        });
      }
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteTemplate = (title: string) => {
    confirmDelete(title, title, "template");
  };

  const handleDeleteSnippet = (id: string) => {
    const snippet = snippets.find((item) => item.id === id);
    if (!snippet) return;
    confirmDelete(id, snippet.title, "snippet");
  };

  const handleStartEdit = (snippet: Snippet) => {
    setEditingSnippetId(snippet.id);
    setEditTitle(snippet.title);
    setEditContent(snippet.content);
    setEditCategory(snippet.category ?? "CTA");
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;

    const updated = snippets.map((snippet) =>
      snippet.id === id
        ? {
            ...snippet,
            title: editTitle.trim(),
            content: editContent.trim(),
            category: editCategory,
          }
        : snippet,
    );

    saveSnippets(updated);
    setEditingSnippetId(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleUseTemplate = (template: Template) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T08:00`;
    const newId = addDraft({
      title: `Konsep ${template.title}`,
      platform: template.platform,
      category: template.category,
      status: "Draft",
      content: template.blueprint,
      date: dateStr,
    });

    router.push(`/drafts/${newId}`);
  };

  const filteredSnippets = useMemo(
    () =>
      snippets.filter((snippet) => {
        const matchesCategory =
          selectedCategoryFilter === "All" ||
          snippet.category === selectedCategoryFilter;
        
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          snippet.title.toLowerCase().includes(q) ||
          snippet.content.toLowerCase().includes(q) ||
          snippet.category.toLowerCase().includes(q);

        return matchesCategory && matchesQuery;
      }),
    [selectedCategoryFilter, searchQuery, snippets],
  );

  return {
    activeTab,
    setActiveTab,
    snippets,
    setSnippets: saveSnippets,
    snippetTitle,
    setSnippetTitle,
    snippetContent,
    setSnippetContent,
    snippetCategory,
    setSnippetCategory,
    copiedId,
    setCopiedId,
    categories,
    setCategories: saveCategories,
    isAddingNewCategory,
    setIsAddingNewCategory,
    newCategoryName,
    setNewCategoryName,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    searchQuery,
    setSearchQuery,
    editingSnippetId,
    setEditingSnippetId,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editCategory,
    setEditCategory,
    isSnippetTipOpen,
    setIsSnippetTipOpen,
    expandedTemplates,
    setExpandedTemplates,
    toggleTemplateExpand,
    templates,
    setTemplates: saveCustomTemplates,
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToDelete,
    setItemToDelete,
    handleAddCategory,
    handleAddSnippet,
    confirmDelete,
    handleUndo,
    executeDelete,
    handleDeleteTemplate,
    handleDeleteSnippet,
    handleStartEdit,
    handleSaveEdit,
    handleCopy,
    handleUseTemplate,
    filteredSnippets,
    addSnippetDirect,
  };
}
