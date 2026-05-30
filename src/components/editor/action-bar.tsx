import React, { useState } from "react";
import { createPortal } from "react-dom";
import { IconSparkles, IconCrown, IconBolt, IconLeaf, IconGitCompare, IconEye } from "@tabler/icons-react";
import { AI_COMMAND_LABELS } from "./editor-commands";

type ActionBarProps = {
  aiActionBar: {
    startPos: number;
    endPos: number;
    commandType: string;
    prompt: string;
    coords: { top: number; left: number };
    originalText?: string;
    newText?: string;
  } | null;
  isAiStreaming: boolean;
  handleAiAccept: () => void;
  handleAiRetry: () => void;
  handleAiDiscard: () => void;
  handleAiVariation?: (style: "professional" | "creative" | "concise") => void;
};

export default function ActionBar({
  aiActionBar,
  isAiStreaming,
  handleAiAccept,
  handleAiRetry,
  handleAiDiscard,
  handleAiVariation,
}: ActionBarProps) {
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  if (!aiActionBar || isAiStreaming || typeof document === "undefined")
    return null;

  return createPortal(
    <>
      <div
        id="tiptap-ai-action-bar"
        style={{
          position: "fixed",
          top: aiActionBar.coords.top,
          left: aiActionBar.coords.left,
        }}
        className="fixed z-[9998] flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-card border border-border shadow-2xl rounded-2xl p-2 md:p-2.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 w-[280px] md:w-auto"
      >
        {/* Variations Selector Carousel / Row */}
        {handleAiVariation && (
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
            <button
              type="button"
              onClick={() => handleAiVariation("professional")}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              title="Gaya Formal, Berbobot & Elegan"
            >
              <IconCrown className="size-2.5 text-amber-500" />
              <span>Profesional</span>
            </button>
            <button
              type="button"
              onClick={() => handleAiVariation("creative")}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              title="Gaya Kreatif, Viral & Storytelling"
            >
              <IconBolt className="size-2.5 text-purple-500" />
              <span>Kreatif</span>
            </button>
            <button
              type="button"
              onClick={() => handleAiVariation("concise")}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-bold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              title="Gaya Singkat, Padat & Efisien"
            >
              <IconLeaf className="size-2.5 text-emerald-500" />
              <span>Ringkas</span>
            </button>
          </div>
        )}

        {handleAiVariation && <span className="hidden md:block w-px h-5 bg-border/60 mx-0.5" />}

        {/* Main Actions Menu */}
        <div className="flex items-center gap-1 md:gap-1.5 justify-between">
          {/* Command label */}
          <div className="flex items-center gap-1 sm:gap-1.5 mr-0.5 sm:mr-1 max-w-[80px] md:max-w-[120px]">
            <IconSparkles className="size-3 ai-accent-text shrink-0" />
            <span className="text-[9px] md:text-[10px] font-semibold text-foreground/80 truncate">
              {aiActionBar.commandType === "general" && aiActionBar.prompt
                ? `"${aiActionBar.prompt.length > 20 ? aiActionBar.prompt.slice(0, 20) + "…" : aiActionBar.prompt}"`
                : (AI_COMMAND_LABELS[aiActionBar.commandType] ?? "AI Hasil")}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Compare Button */}
            {aiActionBar.originalText && (
              <button
                type="button"
                onClick={() => setIsDiffOpen(true)}
                title="Bandingkan naskah asli vs rekomendasi AI"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
              >
                <IconGitCompare className="size-2.5 md:size-3 text-primary" />
                <span className="hidden sm:inline">Bandingkan</span>
              </button>
            )}

            {/* Accept */}
            <button
              type="button"
              onClick={handleAiAccept}
              title="Simpan hasil AI"
              className="ai-accent flex items-center gap-1 px-2 py-1 md:px-2.5 md:py-1 rounded-lg text-[9px] md:text-[10px] font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-2.5 md:size-3 shrink-0">
                <path
                  d="M3 8l3.5 3.5L13 5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Simpan</span>
            </button>

            {/* Retry */}
            <button
              type="button"
              onClick={handleAiRetry}
              title="Coba lagi dengan instruksi yang sama"
              className="flex items-center gap-1 px-2 py-1 md:px-2 md:py-1 rounded-lg text-[9px] md:text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-2.5 md:size-3 shrink-0">
                <path
                  d="M13.5 2.5A6.5 6.5 0 1 1 9 2.07"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M13.5 2.5V6h-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Discard */}
            <button
              type="button"
              onClick={handleAiDiscard}
              title="Buang hasil AI"
              className="flex items-center gap-1 px-1.5 py-1 md:px-2 md:py-1 rounded-lg text-[9px] md:text-[10px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0 cursor-pointer"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-2.5 md:size-3 shrink-0">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Side-by-Side Compare Overlay Dialog ─────────────────────────── */}
      {isDiffOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-3xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <IconGitCompare className="size-5 text-primary animate-pulse" />
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">Bandingkan Hasil AI</h3>
                  <p className="text-[10px] text-muted-foreground">Tinjau perbedaan sebelum Anda menyetujui rekomendasi tulisan AI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDiffOpen(false)}
                className="text-muted-foreground hover:text-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* Content Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 overflow-y-auto max-h-[60vh] min-h-[250px]">
              {/* Original Text */}
              <div className="flex flex-col border border-destructive/20 rounded-xl bg-destructive/[0.02] p-4">
                <div className="flex items-center gap-1.5 border-b border-destructive/10 pb-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-[9px] font-bold text-destructive uppercase tracking-wider">Naskah Asli Anda</span>
                </div>
                <div className="text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap select-text">
                  {aiActionBar.originalText}
                </div>
              </div>

              {/* AI Proposal */}
              <div className="flex flex-col border border-emerald-500/20 rounded-xl bg-emerald-500/[0.02] p-4">
                <div className="flex items-center gap-1.5 border-b border-emerald-500/10 pb-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Rekomendasi AI</span>
                </div>
                <div className="text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap select-text">
                  {aiActionBar.newText || "Sedang memproses..."}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-border/60 px-5 py-4 bg-muted/20">
              <button
                type="button"
                onClick={() => {
                  setIsDiffOpen(false);
                  handleAiDiscard();
                }}
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive text-xs font-semibold transition-all cursor-pointer"
              >
                Buang Hasil
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDiffOpen(false);
                  handleAiAccept();
                }}
                className="ai-accent px-4 py-1.5 rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
              >
                Simpan Rekomendasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
