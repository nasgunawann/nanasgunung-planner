"use client";

import { useState } from "react";
import { useDrafts, type Idea } from "@/lib/drafts";
import { platformColorMap } from "@/lib/platform-map";
import PageTransition from "@/components/page-transition";
import { AnimatePresence, m } from "motion/react";
import { toast } from "sonner";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  IconBrandLinkedin,
  IconSparkles,
  IconCalendarEvent,
  IconTrash,
  IconLoader2,
  IconArrowRight,
  IconInfoCircle,
} from "@tabler/icons-react";

const platformIconMap: Record<string, any> = {
  Instagram: IconBrandInstagram,
  TikTok: IconBrandTiktok,
  YouTube: IconBrandYoutube,
  LinkedIn: IconBrandLinkedin,
};

function parseAngles(text: string): { title: string; hook: string; outline: string }[] {
  const angles: { title: string; hook: string; outline: string }[] = [];
  const sections = text.split(/=== ANGLE \d+ ===/g);

  for (const section of sections) {
    if (!section.trim()) continue;

    const titleMatch = section.match(/TITLE:\s*(.+)/i);
    const hookMatch = section.match(/HOOK:\s*(.+)/i);
    const outlineIndex = section.indexOf("OUTLINE:");

    let title = "";
    let hook = "";
    let outline = "";

    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["'*]+|["'*]+$/g, "");
    }
    if (hookMatch) {
      hook = hookMatch[1].trim().replace(/^["'*]+|["'*]+$/g, "");
    }
    if (outlineIndex !== -1) {
      outline = section.substring(outlineIndex + 8).trim();
    }

    if (title || hook || outline) {
      angles.push({
        title: title || "Ide Konten Baru",
        hook: hook || "Hook tidak tersedia.",
        outline: outline || "Outline tidak tersedia.",
      });
    }
  }

  return angles;
}

export default function BrainstormPage() {
  const { ideas, addIdea, deleteIdea, addDraft } = useDrafts();

  // Inputs
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Informative");
  const [isGenerating, setIsGenerating] = useState(false);

  // Promotion Dialog State
  const [promotingIdea, setPromotingIdea] = useState<Idea | null>(null);

  // Real AI Engine (Multi-Angle Content Briefs)
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: topic,
          commandType: "brainstorm",
          draftMeta: {
            platform: platform,
            status: tone, // We map 'tone' to status which buildPrompt formats in the metadata
          },
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Gagal memanggil AI Agent.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedText += decoder.decode(value, { stream: true });
      }

      const parsedAngles = parseAngles(accumulatedText);

      if (parsedAngles.length === 0) {
        throw new Error("Format respons AI tidak sesuai. Pastikan API mengembalikan struktur ANGLE.");
      }

      // Add each idea in reverse order to preserve listing order (newest on top)
      for (let i = parsedAngles.length - 1; i >= 0; i--) {
        addIdea({
          title: parsedAngles[i].title,
          platform,
          hook: parsedAngles[i].hook,
          outline: parsedAngles[i].outline,
        });
      }

      setTopic("");
      toast.success("AI berhasil merancang 3 sudut pandang kreatif!");
    } catch (err: any) {
      console.error("Brainstorm AI Error:", err);
      toast.error(err.message || "Terjadi kesalahan saat menghubungi AI.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Promote Idea to Calendar
  function handlePromoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!promotingIdea) return;

    const form = e.currentTarget as HTMLFormElement;
    const date = (form.elements.namedItem("date") as HTMLInputElement).value;
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value;
    const status = (form.elements.namedItem("status") as HTMLSelectElement).value;

    if (!date) return;

    const scriptText = `[AI GENERATED BRIEF & HOOK]\nHook: "${promotingIdea.hook}"\n\n[SCRIPT OUTLINE]\n${promotingIdea.outline}`;

    // Add to scheduled drafts
    addDraft({
      title: promotingIdea.title,
      platform: promotingIdea.platform,
      category,
      status,
      date,
      content: scriptText,
    });

    // Delete from ideas funnel
    deleteIdea(promotingIdea.id);
    setPromotingIdea(null);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex items-center gap-3 bg-card border border-border/60 p-4 rounded-xl shadow-sm">
        <IconSparkles className="size-6 text-primary shrink-0" />
        <div className="text-sm">
          <p className="font-bold text-foreground">AI Content Co-Pilot Workspace</p>
          <p className="text-muted-foreground text-xs">
            Describe your idea below. The AI Agent will formulate platform-optimized hooks and outline grids that you can schedule directly.
          </p>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        {/* Column 1: AI Planner Studio */}
        <section className="space-y-4">
          <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold flex items-center gap-2">
              <IconSparkles className="size-4 text-primary" />
              AI Prompt Studio
            </h3>

            <form onSubmit={handleGenerate} className="grid gap-4">
              {/* Topic Input */}
              <div className="grid gap-1">
                <label htmlFor="topic-input" className="text-xs font-semibold text-muted-foreground">
                  What is your core idea or topic?
                </label>
                <textarea
                  id="topic-input"
                  rows={4}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. How to use Next.js context without prop-drilling or bloating state..."
                  className="rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary/50 resize-none"
                  required
                />
              </div>

              {/* Target Platform */}
              <div className="grid gap-1">
                <label htmlFor="platform-select" className="text-xs font-semibold text-muted-foreground">
                  Target Social Platform
                </label>
                <select
                  id="platform-select"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                >
                  <option value="Instagram">Instagram (Reels/Carousels)</option>
                  <option value="TikTok">TikTok (Short Form)</option>
                  <option value="YouTube">YouTube (Tutorial/Tech)</option>
                  <option value="LinkedIn">LinkedIn (Professional)</option>
                </select>
              </div>

              {/* Tone */}
              <div className="grid gap-1">
                <label htmlFor="tone-select" className="text-xs font-semibold text-muted-foreground">
                  Tone of Voice
                </label>
                <select
                  id="tone-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                >
                  <option value="Informative">Informative & Educational</option>
                  <option value="Hype">Hype & High Energy</option>
                  <option value="Storytelling">Engaging Storytelling</option>
                  <option value="Professional">Professional Insight</option>
                </select>
              </div>

              {/* Generate Trigger */}
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    Agent formulating ideas...
                  </>
                ) : (
                  <>
                    <IconSparkles className="size-4" />
                    Formulate Concept Outline
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Column 2: Idea Funnel (Saved Concepts) */}
        <section className="space-y-4">
          <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold flex items-center justify-between">
              <span>Saved Idea Funnel</span>
              <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded">
                {ideas.length} pending
              </span>
            </h3>

            {ideas.length > 0 || isGenerating ? (
              <div className="w-full max-h-[550px] overflow-y-auto pr-1">
                {isGenerating && (
                  <div className="space-y-4 pb-4 animate-pulse">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="rounded-lg border border-border/60 bg-background p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 w-2/3">
                            <div className="size-5 rounded-full bg-muted shrink-0" />
                            <div className="h-4 bg-muted rounded w-full" />
                          </div>
                          <div className="h-3 bg-muted rounded w-12" />
                        </div>
                        <div className="bg-muted/15 border-l-2 border-primary/20 p-2 space-y-2 rounded-r-md">
                          <div className="h-2 bg-muted rounded w-16" />
                          <div className="h-3 bg-muted rounded w-5/6" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-muted rounded w-24" />
                          <div className="h-10 bg-muted rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {ideas.map((idea) => {
                  const PlatformIcon = platformIconMap[idea.platform] || IconSparkles;

                  return (
                    <m.div
                      key={idea.id}
                      initial={{ height: 0, opacity: 0, scale: 0.98, y: 6 }}
                      animate={{ height: "auto", opacity: 1, scale: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, scale: 0.98, y: -6 }}
                      transition={{
                        type: "tween",
                        ease: [0.16, 1, 0.3, 1],
                        duration: 0.22,
                      }}
                      className="overflow-hidden w-full"
                    >
                      <div className="pb-4">
                        <article
                          className="rounded-lg border border-border/60 bg-background p-4 space-y-3 shadow-sm hover:border-border/100 transition-all"
                        >
                      {/* Header Title / Platform */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={[
                              "inline-flex items-center justify-center rounded-full p-1 scale-90",
                              platformColorMap[idea.platform ?? "Default"],
                            ].join(" ")}
                          >
                            <PlatformIcon className="size-3.5 text-white" />
                          </span>
                          <h4 className="font-heading font-bold text-sm truncate text-foreground">
                            {idea.title}
                          </h4>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">{idea.createdAt}</span>
                      </div>

                      {/* Hook Quote block */}
                      <div className="bg-muted/15 border-l-2 border-primary/50 p-2 text-xs rounded-r-md">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-primary block mb-0.5">
                          Suggested Hook:
                        </span>
                        <p className="italic text-foreground/90 font-medium">"{idea.hook}"</p>
                      </div>

                      {/* Script outline snippet */}
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground block">
                          AI Structured Script Outline:
                        </span>
                        <div className="bg-muted/30 border border-border/40 p-2 text-[11px] font-mono text-muted-foreground rounded whitespace-pre-line leading-relaxed">
                          {idea.outline}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 border-t border-border/40 pt-2.5">
                        <button
                          type="button"
                          onClick={() => deleteIdea(idea.id)}
                          className="flex items-center gap-1 text-red-500 hover:bg-red-500/5 px-2.5 py-1.5 rounded text-xs font-semibold transition-all"
                        >
                          <IconTrash className="size-3.5" />
                          Hapus Ide
                        </button>
                        <button
                          type="button"
                          onClick={() => setPromotingIdea(idea)}
                          className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded text-xs font-bold transition-all"
                        >
                          Tambahkan ke Draft
                          <IconArrowRight className="size-3.5" />
                        </button>
                      </div>
                        </article>
                      </div>
                    </m.div>
                  );
                })}
              </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 rounded-lg border border-dashed border-border/80 text-center bg-background/50">
                <IconInfoCircle className="size-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-bold">Funnel is currently empty</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                  Write an idea in the studio and click Formulate. The AI agent will feed concepts directly into this pipeline!
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Promote Concept to Scheduled Calendar Draft Modal */}
      {promotingIdea ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-3">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-heading text-base font-bold flex items-center gap-1.5">
                  <IconCalendarEvent className="size-4 text-primary" />
                  Promote Concept to Scheduler
                </h3>
                <p className="text-xs text-muted-foreground">
                  Move "{promotingIdea.title}" to active planner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPromotingIdea(null)}
                className="rounded-md border border-border bg-background hover:bg-muted px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handlePromoteSubmit} className="mt-4 grid gap-3">
              {/* Target Date */}
              <div className="grid gap-1">
                <label htmlFor="promote-date" className="text-xs font-semibold text-muted-foreground">
                  Schedule Date (yyyy-MM-dd)
                </label>
                <input
                  id="promote-date"
                  name="date"
                  type="date"
                  required
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                />
              </div>

              {/* Category */}
              <div className="grid gap-1">
                <label htmlFor="promote-category" className="text-xs font-semibold text-muted-foreground">
                  Format / Category
                </label>
                <select
                  id="promote-category"
                  name="category"
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                >
                  <option value="Reels">Reels / Shorts</option>
                  <option value="Stories">Stories / Snaps</option>
                  <option value="Post">Standard Post / Feed</option>
                </select>
              </div>

              {/* Workflow Status */}
              <div className="grid gap-1">
                <label htmlFor="promote-status" className="text-xs font-semibold text-muted-foreground">
                  Initial Status
                </label>
                <select
                  id="promote-status"
                  name="status"
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                >
                  <option value="Draft">Draft</option>
                  <option value="In progress">In progress</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              {/* Info Alert */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded p-2.5 text-[11px] text-muted-foreground flex gap-2">
                <IconInfoCircle className="size-4 text-blue-500 shrink-0" />
                <p>
                  Promoting this idea will automatically convert the catchy hook and structured outline into a storyboard script, ready for rich-text writing inside Drafts!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-border pt-3 mt-1">
                <button
                  type="button"
                  onClick={() => setPromotingIdea(null)}
                  className="rounded-md border border-border bg-background hover:bg-muted px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Schedule in Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      </div>
    </PageTransition>
  );
}
