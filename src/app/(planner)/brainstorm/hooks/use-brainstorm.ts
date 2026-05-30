"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDrafts, type Idea } from "@/lib/drafts";

export default function useBrainstorm() {
  const {
    ideas,
    addDraft,
    deleteIdea,
    clearAllIdeas,
    addRawIdea,
    
    // Centralized AI states and functions
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
  } = useDrafts();

  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [promotingIdea, setPromotingIdea] = useState<Idea | null>(null);

  useEffect(() => {
    try {
      const hideIntro = localStorage.getItem("hide_brainstorm_intro");
      if (hideIntro === "true") setShowIntro(false);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ideaParam = params.get("idea");
      const platformParam = params.get("platform");
      if (ideaParam) {
        setBrainstormTopic(decodeURIComponent(ideaParam));
        if (platformParam) {
          setBrainstormPlatform(decodeURIComponent(platformParam));
        }
        toast.info(
          "Mengimpor ide mentah dari Pustaka untuk dikembangkan!",
        );
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [setBrainstormTopic, setBrainstormPlatform]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    await generateBrainstormIdeas(brainstormTopic, brainstormPlatform, brainstormTone);
  }

  function handleSaveAsRawIdea(idea: Idea) {
    try {
      addRawIdea(idea.title, idea.platform);
    } catch (e) {
      toast.error("Gagal menyimpan sebagai ide mentah.");
    }
  }

  function handlePromoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!promotingIdea) return;

    const form = e.currentTarget as HTMLFormElement;
    const date = (form.elements.namedItem("date") as HTMLInputElement).value;
    const category = (form.elements.namedItem("category") as HTMLInputElement).value;
    const status = (form.elements.namedItem("status") as HTMLInputElement).value;

    const scriptText = `[AI GENERATED BRIEF & HOOK]\nHook: "${promotingIdea.hook}"\n\n[SCRIPT OUTLINE]\n${promotingIdea.outline}`;

    const draftId = addDraft(
      {
        title: promotingIdea.title,
        platform: promotingIdea.platform,
        category: category === "none" ? "" : category,
        status,
        date: date ? date : undefined,
        content: scriptText,
      },
      true,
    );

    toast.success(`Ide "${promotingIdea.title}" berhasil dijadikan draf!`, {
      action: {
        label: "Lihat Draft",
        onClick: () => router.push(`/drafts/${draftId}`),
      },
    });

    deleteIdea(promotingIdea.id, true);
    setPromotingIdea(null);
  }

  const handleCloseIntro = () => {
    setShowIntro(false);
    try {
      localStorage.setItem("hide_brainstorm_intro", "true");
    } catch (e) {
      // ignore
    }
  };

  return {
    ideas,
    topic: brainstormTopic,
    setTopic: setBrainstormTopic,
    platform: brainstormPlatform,
    setPlatform: setBrainstormPlatform,
    tone: brainstormTone,
    setTone: setBrainstormTone,
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
    handleSaveAsRawIdea,
    deleteIdea,
    clearAllIdeas,
  };
}
