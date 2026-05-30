"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDrafts, type Idea } from "@/lib/drafts";
import parseAngles from "@/lib/ai-parser";

export default function useBrainstorm() {
  const { ideas, addIdea, deleteIdea, addDraft } = useDrafts();
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Informative");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [displayProgress, setDisplayProgress] = useState(0);
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
      if (ideaParam) {
        setTopic(decodeURIComponent(ideaParam));
        toast.info(
          "Mengimpor ide mentah dari perpustakaan untuk dikembangkan!",
        );
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  // Smooth progress animation
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

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
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

  function handleSaveAsTemplate(idea: Idea) {
    try {
      const stored = localStorage.getItem("nanas_custom_templates");
      const currentTemplates = stored ? JSON.parse(stored) : [];

      const blueprintHtml = `<h3><strong>[OUTLINE STORYBOARD VIDEO]</strong></h3>\n<p></p>\n<ul>\n  <li><strong>Hook:</strong> ${idea.hook}</li>\n  <li><strong>Outline / Storyboard:</strong></li>\n</ul>\n<pre><code>${idea.outline}</code></pre>`;

      const newTemplate = {
        title: idea.title,
        type: "Custom Outline",
        usage: "0 kali digunakan",
        platform: idea.platform,
        category: "Post",
        description: `Templat kustom yang dibuat dari hasil brainstorm ide: "${idea.title}"`,
        blueprint: blueprintHtml,
        isCustom: true,
      };

      if (currentTemplates.some((t: any) => t.title === idea.title)) {
        toast.error("Templat dengan nama yang sama sudah ada di Library!");
        return;
      }

      const updated = [newTemplate, ...currentTemplates];
      localStorage.setItem("nanas_custom_templates", JSON.stringify(updated));

      toast.success(
        `Ide "${idea.title}" berhasil disimpan sebagai Templat Kustom di Library!`,
        {
          action: {
            label: "Buka Library",
            onClick: () => router.push("/library"),
          },
        },
      );
    } catch (e) {
      toast.error("Gagal menyimpan templat kustom.");
    }
  }

  function handlePromoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!promotingIdea) return;

    const form = e.currentTarget as HTMLFormElement;
    const date = (form.elements.namedItem("date") as HTMLInputElement).value;
    const category = (form.elements.namedItem("category") as HTMLSelectElement)
      .value;
    const status = (form.elements.namedItem("status") as HTMLSelectElement)
      .value;

    const scriptText = `[AI GENERATED BRIEF & HOOK]\nHook: "${promotingIdea.hook}"\n\n[SCRIPT OUTLINE]\n${promotingIdea.outline}`;

    const draftId = addDraft(
      {
        title: promotingIdea.title,
        platform: promotingIdea.platform,
        category,
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
  };
}
