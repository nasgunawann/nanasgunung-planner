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
  IconLoader2,
  IconArrowRight,
  IconInfoCircle,
  IconX,
  IconBooks,
} from "@tabler/icons-react";
import PromptStudioForm from "./components/prompt-studio-form";
import AiProgressCard from "./components/ai-progress-card";
import IdeaCard from "./components/idea-card";
import PromoteModal from "./components/promote-modal";

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
            {/* Prompt Studio Form Component */}
            <PromptStudioForm
              topic={topic}
              setTopic={setTopic}
              platform={platform}
              setPlatform={setPlatform}
              tone={tone}
              setTone={setTone}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
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
                      <AiProgressCard
                        displayProgress={displayProgress}
                        generationStep={generationStep}
                        platform={platform}
                        tone={tone}
                      />
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
                    {ideas.map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onDelete={(id) => deleteIdea(id)}
                        onSaveAsTemplate={handleSaveAsTemplate}
                        onPromote={(i) => setPromotingIdea(i)}
                      />
                    ))}
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
