"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDrafts, type Idea } from "@/lib/drafts";
import { platformColorMap } from "@/lib/platform-map";
import PageTransition from "@/components/page-transition";
import { AnimatePresence, m } from "motion/react";
import { toast } from "sonner";
import {
  BrandInstagramIcon,
  BrandTiktokIcon,
  BrandYoutubeIcon,
  BrandLinkedinIcon,
} from "@/components/brand-icons";
import {
  IconSparkles,
  IconCalendarEvent,
  IconTrash,
  IconLoader2,
  IconArrowRight,
  IconInfoCircle,
  IconX,
  IconBooks,
} from "@tabler/icons-react";

const platformIconMap: Record<string, any> = {
  Instagram: BrandInstagramIcon,
  TikTok: BrandTiktokIcon,
  YouTube: BrandYoutubeIcon,
  LinkedIn: BrandLinkedinIcon,
};
import useBrainstorm from "./hooks/use-brainstorm";

export default function BrainstormPage() {
  const {
    ideas,
    topic,
    setTopic,
    platform,
    setPlatform,
    tone,
    setTone,
    isGenerating,
    generationStep,
    displayProgress,
    showIntro,
    setShowIntro,
    promotingIdea,
    setPromotingIdea,
    handleGenerate,
    handlePromoteSubmit,
    handleCloseIntro,
    handleSaveAsTemplate,
    deleteIdea,
  } = useBrainstorm();

  // All interactive state & handlers are provided by `useBrainstorm` hook

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Intro Header */}
        <AnimatePresence>
          {showIntro && (
            <m.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 bg-card border border-border/60 p-4 rounded-xl shadow-sm relative pr-10">
                <div className="flex items-center gap-3">
                  <IconSparkles className="size-6 text-primary shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold text-foreground">
                      AI Content Brainstormer
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Describe your idea below. The AI Agent will formulate
                      platform-optimized hooks and outline grids that you can
                      schedule directly.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseIntro}
                  className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0"
                  title="Sembunyikan Pengenalan"
                >
                  <IconX className="size-4" />
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Main Dashboard Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
          {/* Column 1: AI Planner Studio */}
          <section className="space-y-4 lg:sticky lg:top-20 self-start">
            <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm space-y-4">
              <h3 className="font-heading text-base font-bold flex items-center gap-2">
                <IconSparkles className="size-4 text-primary" />
                AI Prompt Studio
              </h3>

              <form onSubmit={handleGenerate} className="grid gap-4">
                {/* Topic Input */}
                <div className="grid gap-1">
                  <label
                    htmlFor="topic-input"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Masukkan ide atau topik kasar di sini
                  </label>
                  <textarea
                    id="topic-input"
                    rows={4}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ketemu cafe murah buat nugas... "
                    className="rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary/50 resize-none"
                    required
                  />
                </div>

                {/* Target Platform */}
                <div className="grid gap-1">
                  <label
                    htmlFor="platform-select"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Platform Sosial
                  </label>
                  <select
                    id="platform-select"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                  >
                    <option value="Instagram">
                      Instagram (Reels/Carousels)
                    </option>
                    <option value="TikTok">TikTok (Short Form)</option>
                    <option value="YouTube">YouTube (Tutorial/Tech)</option>
                    <option value="LinkedIn">LinkedIn (Professional)</option>
                  </select>
                </div>

                {/* Tone */}
                <div className="grid gap-1">
                  <label
                    htmlFor="tone-select"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Gaya Bicara
                  </label>
                  <select
                    id="tone-select"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                  >
                    <option value="Informative">
                      Informative & Educational
                    </option>
                    <option value="Hype">Hype & High Energy</option>
                    <option value="Storytelling">Engaging Storytelling</option>
                    <option value="Professional">Professional Insight</option>
                  </select>
                </div>

                {/* Generate Trigger */}
                <button
                  type="submit"
                  disabled={isGenerating || !topic.trim()}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-md shadow-purple-500/10 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin" />
                      Sedang memproses, harap tunggu...
                    </>
                  ) : (
                    <>
                      <IconSparkles className="size-4" />
                      Proses ide menggunakan AI
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
                <span>Hasil Ide Brainstorming</span>
                <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded">
                  {ideas.length} pending
                </span>
              </h3>

              {ideas.length > 0 || isGenerating ? (
                <div className="w-full space-y-4">
                  {isGenerating && (
                    <div className="space-y-4 pb-4">
                      {/* Premium Adapted AI Progress Card */}
                      <div className="group relative rounded-xl border border-primary/20 bg-primary/[0.01] backdrop-blur-sm p-5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Shimmer Ambient Glow background */}
                        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-24 h-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

                        {/* Card Content Wrapper */}
                        <div className="relative space-y-4">
                          {/* Header */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="text-xs font-bold text-foreground">
                                AI Content Brainstormer
                              </h4>
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 text-[10px] font-bold text-white shrink-0 animate-pulse"></div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              Merancang 3 sudut pandang kreatif...
                            </p>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                              <span className="font-semibold text-muted-foreground">
                                Progress
                              </span>
                              <span className="font-bold text-foreground">
                                {Math.round(displayProgress)}%
                              </span>
                            </div>

                            <div className="relative h-1.5 overflow-hidden rounded-full bg-muted border border-border/40">
                              <div
                                className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${displayProgress}%` }}
                              />
                            </div>
                          </div>

                          {/* Task List Stepper with translation & opacity */}
                          <div className="space-y-2.5 pt-1">
                            {[
                              "Menganalisis ide & keselarasan audiens",
                              `Meriset opening hook untuk ${platform}`,
                              `Menyusun 3 sudut pandang kreatif (${tone})`,
                              "Membuat draf visual & outline storyboard",
                              "Menyimpan draf ide kreatif...",
                            ].map((task, index) => {
                              const isTaskDone = index < generationStep - 1;
                              const isTaskActive = index === generationStep - 1;
                              const isTaskPending = index > generationStep - 1;

                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-2.5 transition-all duration-300"
                                  style={{
                                    opacity: isTaskActive
                                      ? 1
                                      : isTaskDone
                                        ? 0.65
                                        : 0.35,
                                    transform: isTaskActive
                                      ? "translateX(4px)"
                                      : "translateX(0)",
                                  }}
                                >
                                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted border border-border/50">
                                    {isTaskDone ? (
                                      <span className="text-[10px] text-green-500 font-bold">
                                        ✓
                                      </span>
                                    ) : isTaskActive ? (
                                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                    ) : (
                                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                    )}
                                  </div>
                                  <span
                                    className={[
                                      "text-xs leading-none transition-all",
                                      isTaskActive
                                        ? "text-primary font-bold"
                                        : "text-muted-foreground",
                                      isTaskDone
                                        ? "line-through decoration-muted-foreground/30"
                                        : "",
                                    ].join(" ")}
                                  >
                                    {task}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* 2 Arriving Cards Slots Skeletons */}
                      <div className="space-y-4 opacity-35 animate-pulse">
                        {[1, 2].map((n) => (
                          <div
                            key={n}
                            className="rounded-lg border border-border/40 bg-background/30 p-4 space-y-3.5 shadow-sm"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 w-2/3">
                                <div className="size-5 rounded-full bg-muted shrink-0 scale-90" />
                                <div className="h-3 bg-muted rounded w-full" />
                              </div>
                              <div className="h-2.5 bg-muted rounded w-8" />
                            </div>
                            <div className="bg-muted/10 border-l border-border/40 p-2 space-y-1.5 rounded-r">
                              <div className="h-2 bg-muted rounded w-12" />
                              <div className="h-2 bg-muted rounded w-4/5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {ideas.map((idea) => {
                      const PlatformIcon =
                        platformIconMap[idea.platform] || IconSparkles;

                      return (
                        <m.div
                          key={idea.id}
                          initial={{ height: 0, opacity: 0, scale: 0.98, y: 6 }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                            scale: 1,
                            y: 0,
                          }}
                          exit={{ height: 0, opacity: 0, scale: 0.98, y: -6 }}
                          transition={{
                            type: "tween",
                            ease: [0.16, 1, 0.3, 1],
                            duration: 0.22,
                          }}
                          className="overflow-hidden w-full"
                        >
                          <div className="pb-4">
                            <article className="rounded-lg border border-border/60 bg-background p-4 space-y-3 shadow-sm hover:border-border/100 transition-all">
                              {/* Header Title / Platform */}
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <PlatformIcon className="size-5 shrink-0" />
                                  <h4 className="font-heading font-bold text-sm truncate text-foreground">
                                    {idea.title}
                                  </h4>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                  {idea.createdAt}
                                </span>
                              </div>

                              {/* Hook Quote block */}
                              <div className="bg-muted/15 border-l-2 border-primary/50 p-2 text-xs rounded-r-md">
                                <span className="text-[9px] uppercase tracking-wider font-bold text-primary block mb-0.5">
                                  Suggested Hook:
                                </span>
                                <p className="italic text-foreground/90 font-medium break-words whitespace-pre-wrap">
                                  "{idea.hook}"
                                </p>
                              </div>

                              {/* Script outline snippet */}
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground block">
                                  AI Structured Script Outline:
                                </span>
                                <div className="bg-muted/30 border border-border/40 p-2 text-[11px] font-mono text-muted-foreground rounded whitespace-pre-wrap break-words leading-relaxed">
                                  {idea.outline}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex justify-end gap-2 border-t border-border/40 pt-2.5 flex-wrap">
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
                                  onClick={() => handleSaveAsTemplate(idea)}
                                  className="flex items-center gap-1 bg-muted hover:bg-muted/80 text-foreground border border-border px-2.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer"
                                >
                                  <IconBooks className="size-3.5 text-primary animate-pulse" />
                                  Simpan Sebagai Templat
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
                    Write an idea in the studio and click Formulate. The AI
                    agent will feed concepts directly into this pipeline!
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
                    Promote Concept ke Draft
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
                  <label
                    htmlFor="promote-date"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Tanggal Penjadwalan (Opsional)
                  </label>
                  <input
                    id="promote-date"
                    name="date"
                    type="date"
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50"
                  />
                </div>

                {/* Category */}
                <div className="grid gap-1">
                  <label
                    htmlFor="promote-category"
                    className="text-xs font-semibold text-muted-foreground"
                  >
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
                  <label
                    htmlFor="promote-status"
                    className="text-xs font-semibold text-muted-foreground"
                  >
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
                    Promoting this idea will automatically convert the catchy
                    hook and structured outline into a storyboard script, ready
                    for rich-text writing inside Drafts!
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
                    Tambahkan ke Draft
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
