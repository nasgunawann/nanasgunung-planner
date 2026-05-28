"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDrafts } from "@/lib/drafts";
import { platformColorMap } from "@/lib/platform-map";
import PageTransition from "@/components/page-transition";
import { AnimatePresence, m } from "motion/react";
import {
  IconBooks,
  IconClockHour4,
  IconRecycle,
  IconTags,
  IconPlus,
  IconTrash,
  IconCopy,
  IconCheck,
  IconArrowRight,
  IconSparkles,
  IconListDetails,
  IconEdit,
  IconX,
} from "@tabler/icons-react";

// Seed data for templates - Upgraded to beautiful HTML to render flawlessly in TipTap!
const templates = [
  {
    title: "Launch Teaser Blueprint",
    type: "Short Video",
    usage: "4 kali digunakan",
    platform: "Instagram",
    category: "Reels",
    description: "Cocok untuk membangun rasa penasaran audiens sebelum merilis fitur atau produk baru.",
    blueprint: `<h3><strong>[OUTLINE STORYBOARD VIDEO]</strong></h3>
<p></p>
<ul>
  <li><strong>0:00 - Hook Visual:</strong> Tampilkan layar hitam dengan tulisan <em>"Kami lelah dengan Google Calendar..."</em></li>
  <li><strong>0:03 - Masalah Utama:</strong> Tunjukkan kebingungan mengatur jadwal secara manual di sidebar.</li>
  <li><strong>0:07 - Solusi Nyata:</strong> Tampilkan mockup live planner baru dengan transisi kilat.</li>
  <li><strong>0:12 - Call-To-Action (CTA):</strong> Ajak penonton klik link di bio untuk mendapatkan akses awal gratis! 🎉</li>
</ul>`,
  },
  {
    title: "Educational Carousel Blueprint",
    type: "Carousel Slides",
    usage: "7 kali digunakan",
    platform: "LinkedIn",
    category: "Post",
    description: "Membagi tips teknis mendalam menggunakan struktur slide yang informatif dan memiliki tingkat simpan tinggi.",
    blueprint: `<h3><strong>[STRUKTUR SLIDE CAROUSEL]</strong></h3>
<p></p>
<ol>
  <li><strong>Slide 1:</strong> Headline menarik & provokatif (cth: <em>"Jangan pakai database berat untuk MVP Anda!"</em>)</li>
  <li><strong>Slide 2:</strong> Tunjukkan fakta/angka kelemahan cara lama (loading lambat, biaya setup mahal).</li>
  <li><strong>Slide 3:</strong> Jelaskan alternatif cara baru (contoh penggunaan browser LocalStorage).</li>
  <li><strong>Slide 4:</strong> Berikan cuplikan kode / snippet implementasi sederhana.</li>
  <li><strong>Slide 5:</strong> Ringkasan singkat keuntungan + Ajakan untuk <strong>SIMPAN / SAVE</strong> postingan ini!</li>
</ol>`,
  },
  {
    title: "Interactive Story Seq Blueprint",
    type: "Stories Sequence",
    usage: "11 kali digunakan",
    platform: "Instagram",
    category: "Stories",
    description: "Membangun interaksi personal menggunakan urutan stiker jajak pendapat (Poll) atau Q&A.",
    blueprint: `<h3><strong>[URUTAN INSTAGRAM STORIES]</strong></h3>
<p></p>
<ul>
  <li><strong>Story 1:</strong> Gunakan stiker <strong>POLL / Jajak Pendapat</strong>.<br/>Tanya: <em>"Apakah kalian sering merasa burn-out mengelola jadwal konten?"</em> (Pilihan: Ya / Banget!)</li>
  <li><strong>Story 2:</strong> Respon hasil polling & validasi keresahan mereka.<br/>Teks: <em>"Ternyata 80% dari kita merasakan hal yang sama. Inilah alasan kami mendesain UI baru ini..."</em></li>
  <li><strong>Story 3:</strong> <strong>CTA Tautan Link</strong>.<br/>Ajak mereka klik link sticker untuk bergabung ke waiting-list eksklusif.</li>
</ul>`,
  },
];

type Snippet = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
};

// Seed data for reusable text snippets
const defaultSnippets: Snippet[] = [
  {
    id: "snip-1",
    title: "CTA Follow Standard",
    content: "Jangan lupa untuk follow @nanasgunung untuk tips menarik seputar Web Development & Design setiap hari! 🚀",
    category: "CTA",
    tags: ["Promo", "Instagram"],
  },
  {
    id: "snip-2",
    title: "Kumpulan Hashtag Tech",
    content: "#nextjs #typescript #programmerindonesia #webdev #codinglife #belajarcoding",
    category: "Hashtags",
    tags: ["Hashtags", "Tech"],
  },
  {
    id: "snip-3",
    title: "Closing Post LinkedIn",
    content: "Bagaimana dengan workflow tim Anda saat membangun MVP? Mari diskusi di kolom komentar! 👇",
    category: "Stories",
    tags: ["Launch", "LinkedIn"],
  },
];

const defaultCategories = ["CTA", "Hashtags", "Stories", "Intro", "UGC", "FAQ"];

export default function LibraryPage() {
  const { addDraft } = useDrafts();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<"templates" | "snippets" | "history">("templates");

  // Reusable Snippets State
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetContent, setSnippetContent] = useState("");
  const [snippetCategory, setSnippetCategory] = useState("CTA");
  const [snippetTagsInput, setSnippetTagsInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic Categories State
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Filtering State
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("All");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");

  // Inline Editing State
  const [editingSnippetId, setEditingSnippetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTagsInput, setEditTagsInput] = useState("");

  // Closable Tip state
  const [isSnippetTipOpen, setIsSnippetTipOpen] = useState(true);

  // Template Accordion State
  const [expandedTemplates, setExpandedTemplates] = useState<string[]>([]);

  const toggleTemplateExpand = (title: string) => {
    setExpandedTemplates((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  // Hydrate Snippets & Categories from LocalStorage
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
        localStorage.setItem("nanas_snippet_categories", JSON.stringify(defaultCategories));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveSnippets = (newSnippets: Snippet[]) => {
    setSnippets(newSnippets);
    try {
      localStorage.setItem("nanas_snippets", JSON.stringify(newSnippets));
    } catch (e) {
      // ignore
    }
  };

  const saveCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    try {
      localStorage.setItem("nanas_snippet_categories", JSON.stringify(newCategories));
    } catch (e) {
      // ignore
    }
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
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const newSnip: Snippet = {
      id: `snip-${Date.now()}`,
      title: snippetTitle.trim(),
      content: snippetContent.trim(),
      category: snippetCategory,
      tags: tagsArray,
    };

    saveSnippets([newSnip, ...snippets]);
    setSnippetTitle("");
    setSnippetContent("");
    setSnippetTagsInput("");
  };

  const handleDeleteSnippet = (id: string) => {
    saveSnippets(snippets.filter((s) => s.id !== id));
    if (editingSnippetId === id) setEditingSnippetId(null);
  };

  const handleStartEdit = (snip: Snippet) => {
    setEditingSnippetId(snip.id);
    setEditTitle(snip.title);
    setEditContent(snip.content);
    setEditCategory(snip.category ?? "CTA");
    setEditTagsInput(snip.tags ? snip.tags.join(", ") : "");
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;

    const tagsArray = editTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const updated = snippets.map((s) =>
      s.id === id
        ? {
            ...s,
            title: editTitle.trim(),
            content: editContent.trim(),
            category: editCategory,
            tags: tagsArray,
          }
        : s
    );

    saveSnippets(updated);
    setEditingSnippetId(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleUseTemplate = (template: typeof templates[0]) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T08:00`;

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

  // Compute all unique tags from active snippets to render the Tag Cloud dynamically!
  const allUniqueTags = Array.from(
    new Set(snippets.flatMap((s) => s.tags ?? []))
  );

  // Filter snippets based on dynamic search controls
  const filteredSnippets = snippets.filter((s) => {
    const matchesCategory =
      selectedCategoryFilter === "All" || s.category === selectedCategoryFilter;
    const matchesTag =
      selectedTagFilter === "All" || (s.tags ?? []).includes(selectedTagFilter);
    return matchesCategory && matchesTag;
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Closable Instant Snippet Notification Tip */}
        <AnimatePresence>
          {isSnippetTipOpen && (
            <m.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.22 }}
              className="overflow-hidden w-full"
            >
              <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-4 pr-10 text-xs flex gap-3 shadow-sm shadow-primary/5">
                <IconSparkles className="size-4.5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-foreground">💡 Tip: Gunakan Aset Siap Pakai Instan</h4>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    Simpan potongan teks yang sering diulang di tab <strong>Aset Siap Pakai</strong>. Cukup klik tombol <strong>Apply</strong> di panel draf untuk menyisipkan secara instan ke kanvas editor draf Anda!
                  </p>
                </div>
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsSnippetTipOpen(false)}
                  className="absolute top-3.5 right-3.5 p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
                  title="Tutup Notifikasi"
                >
                  <svg className="size-3 fill-none stroke-current stroke-[2.5px]" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Tab & Compact Metrics Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-muted/20 p-1 border border-border/40 rounded-xl w-full">
          {/* Left: Tab Switcher */}
          <div className="flex gap-1 bg-muted/40 p-1 border border-border/40 rounded-lg overflow-x-auto scrollbar-none flex-nowrap w-full sm:w-auto shrink-0 max-w-full sm:max-w-lg md:max-w-xl">
            {[
              { id: "templates", label: "Template", icon: IconListDetails },
              { id: "snippets", label: "Aset Siap Pakai", icon: IconTags },
              { id: "history", label: "Arsip & Riwayat", icon: IconRecycle },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={[
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap shrink-0",
                    active
                      ? "bg-card border border-border/50 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                  ].join(" ")}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right: Small, super-compact Aset & Statistik Row */}
          <div className="flex items-center gap-3.5 text-[10px] font-mono font-bold text-muted-foreground pr-3 select-none">
            <span className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded border border-border/35 shadow-sm">
              <span className="text-foreground">3</span> Templat
            </span>
            <span className="text-border/60">|</span>
            <span className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded border border-border/35 shadow-sm">
              <span className="text-foreground">{snippets.length}</span> Snippets
            </span>
            <span className="text-border/60">|</span>
            <span className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded border border-border/35 shadow-sm">
              <span className="text-foreground">94</span> Arsip
            </span>
          </div>
        </div>

        {/* Main Content Area - Full Width Page */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {/* Tab 1: Blueprints Templates */}
            {activeTab === "templates" && (
              <m.div
                key="templates-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="grid gap-4">
                  {templates.map((template) => {
                    const isExpanded = expandedTemplates.includes(template.title);

                    return (
                      <article
                        key={template.title}
                        className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-3"
                      >
                        {/* Title Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={[
                                  "px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider",
                                  platformColorMap[template.platform] ?? "bg-primary",
                                ].join(" ")}
                              >
                                {template.platform}
                              </span>
                              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                                {template.type}
                              </span>
                            </div>
                            <h3 className="font-heading text-lg font-bold text-foreground">
                              {template.title}
                            </h3>
                          </div>
                          <span className="text-[11px] text-muted-foreground font-semibold bg-muted/40 border border-border/30 px-2 py-1 rounded">
                            {template.usage}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed pb-1">
                          {template.description}
                        </p>

                        {/* Accordion Expand Button */}
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleTemplateExpand(template.title)}
                            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer select-none"
                          >
                            <span>{isExpanded ? "Sembunyikan Skema Blueprint" : "Lihat Skema Blueprint Outline"}</span>
                            <svg
                              className={[
                                "size-3.5 fill-none stroke-current stroke-[2.5px] transition-transform duration-200",
                                isExpanded ? "rotate-180" : "",
                              ].join(" ")}
                              viewBox="0 0 24 24"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </div>

                        {/* HTML Rich-Text Accordion Drawer */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <m.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              transition={{
                                type: "tween",
                                ease: [0.16, 1, 0.3, 1],
                                duration: 0.22,
                              }}
                              className="overflow-hidden w-full"
                            >
                              <div className="space-y-1.5 border-t border-border/40 pt-3">
                                <span className="text-[9px] uppercase tracking-wider font-bold text-primary block">
                                  Blueprint Template Outline (HTML Rendered):
                                </span>
                                <div
                                  dangerouslySetInnerHTML={{ __html: template.blueprint }}
                                  className="bg-background border border-border/40 p-4 rounded-lg text-xs leading-relaxed text-muted-foreground/80 font-sans max-w-none space-y-2 prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4 select-all shadow-inner"
                                />
                              </div>
                            </m.div>
                          )}
                        </AnimatePresence>

                        {/* Use Template Action Button */}
                        <div className="flex justify-end pt-2 border-t border-border/20">
                          <button
                            type="button"
                            onClick={() => handleUseTemplate(template)}
                            className="flex h-8 items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm animate-in fade-in"
                          >
                            Gunakan Templat Konten
                            <IconArrowRight className="size-3.5" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </m.div>
            )}

            {/* Tab 2: Reusable Text Snippets (Upgraded CRUD, Tag/Category Editors & Interactive Filters) */}
            {activeTab === "snippets" && (
              <m.div
                key="snippets-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"
              >
                {/* Left Column: Filter panel & Snippets list */}
                <div className="space-y-4">
                  {/* Interactive Categories & Tags Filter Cloud (Moved Tags Card Here!) */}
                  <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-3 select-none">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="font-bold text-muted-foreground uppercase text-[10px]">Filter Kategori:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryFilter("All")}
                        className={[
                          "px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all",
                          selectedCategoryFilter === "All"
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground",
                        ].join(" ")}
                      >
                        Semua Kategori
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategoryFilter(cat)}
                          className={[
                            "px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all",
                            selectedCategoryFilter === cat
                              ? "bg-primary text-primary-foreground font-bold shadow-sm"
                              : "bg-muted/50 hover:bg-muted text-muted-foreground",
                          ].join(" ")}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Tag Filter Cloud */}
                    {allUniqueTags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap text-[10px] border-t border-border/40 pt-2.5">
                        <span className="font-bold text-muted-foreground uppercase text-[9px]">Filter Tags Cloud:</span>
                        <button
                          type="button"
                          onClick={() => setSelectedTagFilter("All")}
                          className={[
                            "px-2 py-0.5 rounded border cursor-pointer transition-all font-semibold",
                            selectedTagFilter === "All"
                              ? "bg-foreground border-foreground text-background font-bold"
                              : "border-border bg-background hover:bg-muted text-muted-foreground",
                          ].join(" ")}
                        >
                          Semua Tags
                        </button>
                        {allUniqueTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTagFilter(tag)}
                            className={[
                              "px-2 py-0.5 rounded border cursor-pointer transition-all font-semibold",
                              selectedTagFilter === tag
                                ? "bg-foreground border-foreground text-background font-bold"
                                : "border-border bg-background hover:bg-muted text-muted-foreground",
                            ].join(" ")}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Snippets List wrapper */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex justify-between items-center">
                      <span>Daftar Aset Siap Pakai ({filteredSnippets.length})</span>
                      {(selectedCategoryFilter !== "All" || selectedTagFilter !== "All") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategoryFilter("All");
                            setSelectedTagFilter("All");
                          }}
                          className="text-[10px] text-primary hover:underline font-bold"
                        >
                          Reset Filter
                        </button>
                      )}
                    </h3>

                    {filteredSnippets.length > 0 ? (
                      <div className="w-full">
                        <AnimatePresence initial={false}>
                          {filteredSnippets.map((snip) => {
                            const isEditing = editingSnippetId === snip.id;

                            return (
                              <m.div
                                key={snip.id}
                                initial={{ height: 0, opacity: 0, scale: 0.98, y: 4 }}
                                animate={{ height: "auto", opacity: 1, scale: 1, y: 0 }}
                                exit={{ height: 0, opacity: 0, scale: 0.98, y: -4 }}
                                transition={{
                                  type: "tween",
                                  ease: [0.16, 1, 0.3, 1],
                                  duration: 0.22,
                                }}
                                className="overflow-hidden w-full"
                              >
                                <div className="pb-3">
                                  <article className="rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-sm transition-all hover:border-border/100">
                                    {isEditing ? (
                                      /* Edit Mode View inside card */
                                      <div className="space-y-3 text-xs animate-in fade-in duration-100">
                                        <div className="grid gap-2 sm:grid-cols-2">
                                          <div className="grid gap-0.5">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Judul Klip</span>
                                            <input
                                              type="text"
                                              value={editTitle}
                                              onChange={(e) => setEditTitle(e.target.value)}
                                              className="h-8 rounded border border-border bg-background px-2.5 text-xs outline-none"
                                              required
                                            />
                                          </div>
                                          <div className="grid gap-0.5">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Kategori</span>
                                            <select
                                              value={editCategory}
                                              onChange={(e) => setEditCategory(e.target.value)}
                                              className="h-8 rounded border border-border bg-background px-2 text-xs outline-none"
                                            >
                                              {categories.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>

                                        <div className="grid gap-0.5">
                                          <span className="text-[9px] font-bold text-muted-foreground uppercase">Tags (Pisahkan dengan koma)</span>
                                          <input
                                            type="text"
                                            value={editTagsInput}
                                            onChange={(e) => setEditTagsInput(e.target.value)}
                                            placeholder="cth: Launch, Promo"
                                            className="h-8 rounded border border-border bg-background px-2.5 text-xs outline-none"
                                          />
                                        </div>

                                        <div className="grid gap-0.5">
                                          <span className="text-[9px] font-bold text-muted-foreground uppercase">Isi Caption</span>
                                          <textarea
                                            rows={4}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="rounded border border-border bg-background p-2.5 text-xs outline-none resize-none"
                                            required
                                          />
                                        </div>

                                        <div className="flex justify-end gap-2 border-t border-border/40 pt-2">
                                          <button
                                            type="button"
                                            onClick={() => setEditingSnippetId(null)}
                                            className="px-2.5 py-1.5 rounded border border-border bg-background hover:bg-muted text-[10px] font-bold transition-all cursor-pointer"
                                          >
                                            Batal
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleSaveEdit(snip.id)}
                                            className="px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold transition-all cursor-pointer"
                                          >
                                            Simpan Aset
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Normal Static Mode View with Badges */
                                      <>
                                        <div className="flex justify-between items-start gap-3">
                                          <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              {/* Category Badge */}
                                              <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[8px] leading-none shrink-0">
                                                {snip.category}
                                              </span>
                                              {/* Tags Badges */}
                                              {snip.tags && snip.tags.map((t) => (
                                                <span
                                                  key={t}
                                                  className="bg-muted text-muted-foreground border border-border/40 px-1.5 py-0.5 rounded text-[8px] leading-none shrink-0"
                                                >
                                                  #{t}
                                                </span>
                                              ))}
                                            </div>
                                            <h4 className="font-heading font-bold text-sm text-foreground truncate">
                                              {snip.title}
                                            </h4>
                                          </div>

                                          <div className="flex items-center gap-1 shrink-0">
                                            {/* Salin Button */}
                                            <button
                                              type="button"
                                              onClick={() => handleCopy(snip.id, snip.content)}
                                              className={[
                                                "flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer border select-none",
                                                copiedId === snip.id
                                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold"
                                                  : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground",
                                              ].join(" ")}
                                            >
                                              {copiedId === snip.id ? (
                                                <>
                                                  <IconCheck className="size-3" />
                                                  Tersalin!
                                                </>
                                              ) : (
                                                <>
                                                  <IconCopy className="size-3" />
                                                  Salin Klip
                                                </>
                                              )}
                                            </button>

                                            {/* Edit Button */}
                                            <button
                                              type="button"
                                              onClick={() => handleStartEdit(snip)}
                                              className="p-1 rounded text-muted-foreground/35 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                                              title="Edit Klip"
                                            >
                                              <IconEdit className="size-3.5" />
                                            </button>

                                            {/* Hapus Button */}
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteSnippet(snip.id)}
                                              className="p-1 rounded text-muted-foreground/35 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
                                              title="Hapus Klip"
                                            >
                                              <IconTrash className="size-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                        <p className="bg-background/40 border border-border/40 p-2.5 rounded text-[11px] font-medium font-sans text-muted-foreground leading-relaxed whitespace-pre-wrap select-all font-mono">
                                          {snip.content}
                                        </p>
                                      </>
                                    )}
                                  </article>
                                </div>
                              </m.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card">
                        <p className="text-xs font-bold text-foreground">Aset Siap Pakai tidak ditemukan</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px] mx-auto">
                          Tidak ada aset dengan kombinasi filter kategori atau tag yang Anda pilih. Coba klik reset filter.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Add Snippet Studio (Upgraded with inline category adder & tags input) */}
                <div>
                  <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-4 sticky top-4">
                    <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border/45 pb-2">
                      <IconPlus className="size-3.5" />
                      Tambah Aset Siap Pakai Baru
                    </h3>
                    <form onSubmit={handleAddSnippet} className="grid gap-3.5">
                      {/* Title */}
                      <div className="grid gap-1">
                        <label htmlFor="snip-title" className="text-[10px] font-bold text-muted-foreground uppercase">
                          Judul Aset
                        </label>
                        <input
                          id="snip-title"
                          type="text"
                          value={snippetTitle}
                          onChange={(e) => setSnippetTitle(e.target.value)}
                          placeholder="cth: Tagline Promosi Reels"
                          className="h-8 rounded border border-border bg-background px-2.5 text-xs outline-none focus:border-primary/50"
                          required
                        />
                      </div>

                      {/* Category Selector with Inline Category Adder */}
                      <div className="grid gap-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="snip-category" className="text-[10px] font-bold text-muted-foreground uppercase">
                            Kategori Aset
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                            className="text-[9px] text-primary font-bold hover:underline select-none"
                          >
                            {isAddingNewCategory ? "Batal" : "+ Kategori"}
                          </button>
                        </div>

                        {/* Inline Category Adder */}
                        <AnimatePresence>
                          {isAddingNewCategory && (
                            <m.div
                              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                              animate={{ height: "auto", opacity: 1, marginBottom: 8 }}
                              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                              className="overflow-hidden grid gap-1.5 p-2 bg-muted/40 rounded border border-border/50"
                            >
                              <span className="text-[9px] font-bold text-muted-foreground uppercase">Nama Kategori Baru</span>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={newCategoryName}
                                  onChange={(e) => setNewCategoryName(e.target.value)}
                                  placeholder="cth: Penutup"
                                  className="h-7 flex-1 rounded border border-border bg-background px-2 text-[11px] outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddCategory}
                                  className="h-7 bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold px-2.5 rounded transition-all cursor-pointer"
                                >
                                  Simpan
                                </button>
                              </div>
                            </m.div>
                          )}
                        </AnimatePresence>

                        <select
                          id="snip-category"
                          value={snippetCategory}
                          onChange={(e) => setSnippetCategory(e.target.value)}
                          className="h-8 rounded border border-border bg-background px-2 text-xs outline-none focus:border-primary/50 cursor-pointer"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tags */}
                      <div className="grid gap-1">
                        <label htmlFor="snip-tags" className="text-[10px] font-bold text-muted-foreground uppercase">
                          Tags (Pisahkan dengan koma)
                        </label>
                        <input
                          id="snip-tags"
                          type="text"
                          value={snippetTagsInput}
                          onChange={(e) => setSnippetTagsInput(e.target.value)}
                          placeholder="cth: Launch, Promo, Tech"
                          className="h-8 rounded border border-border bg-background px-2.5 text-xs outline-none focus:border-primary/50"
                        />
                      </div>

                      {/* Content Textarea */}
                      <div className="grid gap-1">
                        <label htmlFor="snip-content" className="text-[10px] font-bold text-muted-foreground uppercase">
                          Isi Aset Siap Pakai (Caption/Hashtags/Text)
                        </label>
                        <textarea
                          id="snip-content"
                          rows={6}
                          value={snippetContent}
                          onChange={(e) => setSnippetContent(e.target.value)}
                          placeholder="cth: Tulis naskah klip atau draf berulang di sini..."
                          className="rounded border border-border bg-background p-2.5 text-xs outline-none focus:border-primary/50 resize-none font-sans"
                          required
                        />
                      </div>

                      {/* Submit Trigger */}
                      <button
                        type="submit"
                        disabled={!snippetTitle.trim() || !snippetContent.trim()}
                        className="w-full h-8 flex items-center justify-center gap-1 rounded bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        <IconPlus className="size-3.5" />
                        Simpan Aset Siap Pakai
                      </button>
                    </form>
                  </div>
                </div>
              </m.div>
            )}

            {/* Tab 3: History & Archive */}
            {activeTab === "history" && (
              <m.div
                key="history-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]"
              >
                {/* Left: History Logs */}
                <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 h-fit">
                  <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                    <IconClockHour4 className="size-5 text-primary" />
                    <h3 className="font-heading text-base font-bold text-foreground">
                      Recent Updates & Synchronizations
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      { time: "2 jam yang lalu", msg: "Memperbarui kerangka struktur Launch Teaser Blueprint." },
                      { time: "Kemarin", msg: "Mengarsipkan 3 draft ide usang setelah ulasan bulanan." },
                      { time: "Hari Ini", msg: "Sinkronisasi lokal selesai. 12 templat aktif tersimpan secara offline." },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start gap-4 p-3 rounded-lg border border-border/40 bg-background/50 text-xs text-muted-foreground"
                      >
                        <span>{item.msg}</span>
                        <span className="shrink-0 font-semibold font-mono text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded">
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Informational Box */}
                <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-4 h-fit bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2.5 border-b border-primary/20 pb-2">
                    <IconSparkles className="size-4.5 text-primary" />
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Asset Synchronization</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Semua data templat, aset siap pakai, kustom kategori, dan tag cloud Anda dikelola secara lokal pada sandboxed <strong>localStorage</strong> browser Anda.
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Sistem otomatis mengamankan kuota dan melakukan kompresi data lokal untuk menjaga pemrosesan antarmuka snap-to-fit tetap stabil dan snap di frame-rate <strong>60fps</strong>.
                  </p>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
