"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDrafts } from "@/lib/drafts";
import { toast } from "sonner";
import {
  defaultCategories,
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
    "templates" | "snippets" | "history"
  >("templates");
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetContent, setSnippetContent] = useState("");
  const [snippetCategory, setSnippetCategory] = useState("CTA");
  const [snippetTagsInput, setSnippetTagsInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("All");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("All");
  const [editingSnippetId, setEditingSnippetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTagsInput, setEditTagsInput] = useState("");
  const [isSnippetTipOpen, setIsSnippetTipOpen] = useState(true);
  const [expandedTemplates, setExpandedTemplates] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<LibraryDeleteItem>(null);

  useEffect(() => {
    try {
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
          JSON.stringify(defaultCategories),
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

    const tagsArray = snippetTagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    const newSnippet: Snippet = {
      id: `snip-${Date.now()}`,
      title: snippetTitle.trim(),
      content: snippetContent.trim(),
      category: snippetCategory,
      tags: tagsArray,
    };

    saveSnippets([newSnippet, ...snippets]);
    setSnippetTitle("");
    setSnippetContent("");
    setSnippetTagsInput("");
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
      setTemplates((prev) => {
        const index = prev.findIndex((template) => template.title === id);
        if (index === -1) return prev;
        const deletedObj = prev[index];
        const updated = prev.filter((template) => template.title !== id);

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

        return updated;
      });
    } else {
      setSnippets((prev) => {
        const index = prev.findIndex((snippet) => snippet.id === id);
        if (index === -1) return prev;
        const deletedObj = prev[index];
        const updated = prev.filter((snippet) => snippet.id !== id);

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

        return updated;
      });
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
    setEditTagsInput(snippet.tags ? snippet.tags.join(", ") : "");
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;

    const tagsArray = editTagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    const updated = snippets.map((snippet) =>
      snippet.id === id
        ? {
            ...snippet,
            title: editTitle.trim(),
            content: editContent.trim(),
            category: editCategory,
            tags: tagsArray,
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

  const allUniqueTags = useMemo(
    () =>
      Array.from(new Set(snippets.flatMap((snippet) => snippet.tags ?? []))),
    [snippets],
  );

  const filteredSnippets = useMemo(
    () =>
      snippets.filter((snippet) => {
        const matchesCategory =
          selectedCategoryFilter === "All" ||
          snippet.category === selectedCategoryFilter;
        const matchesTag =
          selectedTagFilter === "All" ||
          (snippet.tags ?? []).includes(selectedTagFilter);
        return matchesCategory && matchesTag;
      }),
    [selectedCategoryFilter, selectedTagFilter, snippets],
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
    snippetTagsInput,
    setSnippetTagsInput,
    copiedId,
    setCopiedId,
    categories,
    setCategories: saveCategories,
    isAddingNewCategory,
    setIsAddingNewCategory,
    newCategoryName,
    setNewCategoryName,
    selectedTagFilter,
    setSelectedTagFilter,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    editingSnippetId,
    setEditingSnippetId,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editCategory,
    setEditCategory,
    editTagsInput,
    setEditTagsInput,
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
    allUniqueTags,
    filteredSnippets,
  };
}
