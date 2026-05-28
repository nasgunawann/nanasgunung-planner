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
} from "@tabler/icons-react";

// Seed data for templates
const templates = [
  {
    title: "Launch Teaser Blueprint",
    type: "Short Video",
    usage: "4 kali digunakan",
    platform: "Instagram",
    category: "Reels",
    description:
      "Cocok untuk membangun rasa penasaran audiens sebelum merilis fitur atau produk baru.",
    blueprint: `[OUTLINE STORYBOARD VIDEO]

0:00 - Hook Visual: Tampilkan layar hitam dengan tulisan "Kami lelah dengan Google Calendar..."
0:03 - Masalah Utama: Tunjukkan kebingungan mengatur jadwal secara manual di sidebar.
0:07 - Solusi Nyata: Tampilkan mockup live planner baru dengan transisi kilat.
0:12 - Call-To-Action (CTA): Ajak penonton klik link di bio untuk mendapatkan akses awal gratis! 🎉`,
  },
  {
    title: "Educational Carousel Blueprint",
    type: "Carousel Slides",
    usage: "7 kali digunakan",
    platform: "LinkedIn",
    category: "Post",
    description:
      "Membagi tips teknis mendalam menggunakan struktur slide yang informatif dan memiliki tingkat simpan tinggi.",
    blueprint: `[STRUKTUR SLIDE CAROUSEL]

Slide 1: Headline menarik & provokatif (cth: "Jangan pakai database berat untuk MVP Anda!")
Slide 2: Tunjukkan fakta/angka kelemahan cara lama (loading lambat, biaya setup mahal).
Slide 3: Jelaskan alternatif cara baru (contoh penggunaan browser LocalStorage).
Slide 4: Berikan cuplikan kode / snippet implementasi sederhana.
Slide 5: Ringkasan singkat keuntungan + Ajakan untuk SIMPAN / SAVE postingan ini!`,
  },
  {
    title: "Interactive Story Seq Blueprint",
    type: "Stories Sequence",
    usage: "11 kali digunakan",
    platform: "Instagram",
    category: "Stories",
    description:
      "Membangun interaksi personal menggunakan urutan stiker jajak pendapat (Poll) atau Q&A.",
    blueprint: `[URUTAN INSTAGRAM STORIES]

Story 1: Gunakan stiker POLL / Jajak Pendapat.
Tanya: "Apakah kalian sering merasa burn-out mengelola jadwal konten?" (Pilihan: Ya / Banget!)

Story 2: Respon hasil polling & validasi keresahan mereka.
Teks: "Ternyata 80% dari kita merasakan hal yang sama. Inilah alasan kami mendesain UI baru ini..."

Story 3: CTA Tautan Link.
Ajak mereka klik link sticker untuk bergabung ke waiting-list eksklusif.`,
  },
];

// Seed data for reusable text snippets
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

export default function LibraryPage() {
  const { addDraft } = useDrafts();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "templates" | "snippets" | "history"
  >("templates");

  // Reusable Snippets State
  const [snippets, setSnippets] = useState<
    { id: string; title: string; content: string }[]
  >([]);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetContent, setSnippetContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Template success message state
  const [templateSuccess, setTemplateSuccess] = useState<string | null>(null);

  // Hydrate Snippets from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nanas_snippets");
      if (stored) {
        setSnippets(JSON.parse(stored));
      } else {
        setSnippets(defaultSnippets);
        localStorage.setItem("nanas_snippets", JSON.stringify(defaultSnippets));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveSnippets = (newSnippets: typeof snippets) => {
    setSnippets(newSnippets);
    try {
      localStorage.setItem("nanas_snippets", JSON.stringify(newSnippets));
    } catch (e) {
      // ignore
    }
  };

  const handleAddSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetTitle.trim() || !snippetContent.trim()) return;

    const newSnip = {
      id: `snip-${Date.now()}`,
      title: snippetTitle.trim(),
      content: snippetContent.trim(),
    };

    saveSnippets([newSnip, ...snippets]);
    setSnippetTitle("");
    setSnippetContent("");
  };

  const handleDeleteSnippet = (id: string) => {
    saveSnippets(snippets.filter((s) => s.id !== id));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleUseTemplate = (template: (typeof templates)[0]) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(now.getDate()).padStart(2, "0")}T08:00`;

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

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Tab Switcher */}
        <div className="flex gap-1 bg-muted/40 p-1 border border-border/40 rounded-xl max-w-md">
          {[
            {
              id: "templates",
              label: "Blueprints Templat",
              icon: IconListDetails,
            },
            { id: "snippets", label: "Klip Reusable", icon: IconTags },
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
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
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

        {/* Main Content Layout */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          {/* Main Area */}
          <section className="space-y-4">
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
                    {templates.map((template) => (
                      <article
                        key={template.title}
                        className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={[
                                  "px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider",
                                  platformColorMap[template.platform] ??
                                    "bg-primary",
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

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {template.description}
                        </p>

                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-primary block">
                            Blueprint Template Outline:
                          </span>
                          <pre className="bg-background border border-border/40 p-3 text-[11px] font-mono text-muted-foreground rounded whitespace-pre-line leading-relaxed">
                            {template.blueprint}
                          </pre>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleUseTemplate(template)}
                            className="flex h-8 items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                          >
                            Gunakan Templat Konten
                            <IconArrowRight className="size-3.5" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </m.div>
              )}

              {/* Tab 2: Reusable Text Snippets */}
              {activeTab === "snippets" && (
                <m.div
                  key="snippets-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]"
                >
                  {/* Left: Snippets List */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground">
                      Penyimpanan Klip Aset ({snippets.length})
                    </h3>
                    {snippets.length > 0 ? (
                      <div className="w-full">
                        <AnimatePresence initial={false}>
                          {snippets.map((snip) => (
                            <m.div
                              key={snip.id}
                              initial={{
                                height: 0,
                                opacity: 0,
                                scale: 0.98,
                                y: 4,
                              }}
                              animate={{
                                height: "auto",
                                opacity: 1,
                                scale: 1,
                                y: 0,
                              }}
                              exit={{
                                height: 0,
                                opacity: 0,
                                scale: 0.98,
                                y: -4,
                              }}
                              transition={{
                                type: "tween",
                                ease: [0.16, 1, 0.3, 1],
                                duration: 0.22,
                              }}
                              className="overflow-hidden w-full"
                            >
                              <div className="pb-3">
                                <article className="rounded-xl border border-border/60 bg-card p-4 space-y-2 shadow-sm">
                                  <div className="flex justify-between items-center gap-2">
                                    <h4 className="font-heading font-bold text-sm text-foreground">
                                      {snip.title}
                                    </h4>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopy(snip.id, snip.content)
                                        }
                                        className={[
                                          "flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer border",
                                          copiedId === snip.id
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
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
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteSnippet(snip.id)
                                        }
                                        className="p-1 rounded text-muted-foreground/35 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
                                        title="Hapus Klip"
                                      >
                                        <IconTrash className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="bg-background/40 border border-border/40 p-2.5 rounded text-[11px] font-medium font-sans text-muted-foreground leading-relaxed whitespace-pre-wrap select-all">
                                    {snip.content}
                                  </p>
                                </article>
                              </div>
                            </m.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card">
                        <p className="text-xs font-bold text-foreground">
                          Klip Aset kosong
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px] mx-auto">
                          Tambahkan template tanda tangan, CTA, atau hashtag di
                          panel sebelah kanan untuk menyalin aset secara instan!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Add Snippet Studio */}
                  <div>
                    <div className="bg-card border border-border/60 p-4 rounded-xl shadow-sm space-y-3 sticky top-4">
                      <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <IconPlus className="size-3.5" />
                        Tambah Klip Aset Baru
                      </h3>
                      <form onSubmit={handleAddSnippet} className="grid gap-3">
                        <div className="grid gap-1">
                          <label
                            htmlFor="snip-title"
                            className="text-[10px] font-bold text-muted-foreground uppercase"
                          >
                            Judul Klip
                          </label>
                          <input
                            id="snip-title"
                            type="text"
                            value={snippetTitle}
                            onChange={(e) => setSnippetTitle(e.target.value)}
                            placeholder="cth: Footer Call To Action"
                            className="h-8 rounded border border-border bg-background px-2.5 text-xs outline-none focus:border-primary/50"
                            required
                          />
                        </div>
                        <div className="grid gap-1">
                          <label
                            htmlFor="snip-content"
                            className="text-[10px] font-bold text-muted-foreground uppercase"
                          >
                            Isi Teks Aset
                          </label>
                          <textarea
                            id="snip-content"
                            rows={5}
                            value={snippetContent}
                            onChange={(e) => setSnippetContent(e.target.value)}
                            placeholder="cth: Follow @nanasgunung untuk update harian..."
                            className="rounded border border-border bg-background p-2.5 text-xs outline-none focus:border-primary/50 resize-none"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={
                            !snippetTitle.trim() || !snippetContent.trim()
                          }
                          className="w-full h-8 flex items-center justify-center gap-1 rounded bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <IconPlus className="size-3.5" />
                          Simpan Klip Aset
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
                  className="space-y-4"
                >
                  <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                      <IconClockHour4 className="size-5 text-primary" />
                      <h3 className="font-heading text-base font-bold text-foreground">
                        Recent Updates & Synchronizations
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          time: "2 jam yang lalu",
                          msg: "Memperbarui kerangka struktur Launch Teaser Blueprint.",
                        },
                        {
                          time: "Kemarin",
                          msg: "Mengarsipkan 3 draft ide usang setelah ulasan bulanan.",
                        },
                        {
                          time: "Hari Ini",
                          msg: "Sinkronisasi lokal selesai. 12 templat aktif tersimpan secara offline.",
                        },
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
                </m.div>
              )}
            </AnimatePresence>
          </section>

          {/* Sidebar / Glance Panel */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <IconBooks className="size-5 text-primary" />
                <h3 className="font-heading text-base font-bold text-foreground">
                  Aset & Statistik
                </h3>
              </div>

              <div className="grid gap-2 grid-cols-3">
                {[
                  { label: "Templat", value: "3" },
                  { label: "Snippets", value: snippets.length.toString() },
                  { label: "Arsip", value: "94" },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="border border-border/50 bg-background p-3 rounded-xl text-center shadow-sm"
                  >
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">
                      {metric.label}
                    </p>
                    <p className="mt-1.5 font-heading text-lg font-bold text-foreground">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <IconTags className="size-4.5 text-primary" />
                <h3 className="font-heading text-sm font-bold text-foreground">
                  Tags Reusability
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Aset teks dan templat yang paling sering Anda gunakan dalam
                workflow pembuatan jadwal konten:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-bold">
                {[
                  "Launch",
                  "Education",
                  "Promo",
                  "UGC",
                  "FAQ",
                  "Stories",
                  "Hashtags",
                  "CTA",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border bg-background px-2 py-1 text-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex gap-3 text-xs bg-primary/5 border-primary/20">
              <IconSparkles className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-foreground">
                  Gunakan Snippets Instan
                </h4>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Simpan potongan teks yang sering diulang di tab{" "}
                  <strong>Klip Reusable</strong>. Cukup klik tombol{" "}
                  <strong>Salin Klip</strong> untuk menyalin secara instan, lalu
                  paste di editor draf Anda!
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
