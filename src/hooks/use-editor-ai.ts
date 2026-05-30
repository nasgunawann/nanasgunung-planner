import { useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import { DraftMeta } from "@/components/editor/editor-commands";

type ActionBarState = {
  startPos: number;
  endPos: number;
  commandType: string;
  prompt: string;
  coords: { top: number; left: number };
  originalText?: string;
} | null;

export function useEditorAi(
  editor: Editor | null,
  draftMeta?: DraftMeta,
  containerRef?: React.RefObject<HTMLDivElement | null>
) {
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [aiActionBar, setAiActionBar] = useState<ActionBarState>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const aiOriginalContentRef = useRef<{ startPos: number; originalText?: string; wasSelection: boolean } | null>(null);

  const handleCancelAi = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAiStreaming(false);
    
    if (editor && aiOriginalContentRef.current) {
      const { startPos, originalText, wasSelection } = aiOriginalContentRef.current;
      editor.chain().focus().unsetMark("aiHighlight").run();
      const currentPos = editor.state.selection.from;
      if (wasSelection && originalText) {
        editor
          .chain()
          .focus()
          .deleteRange({ from: startPos, to: currentPos })
          .insertContentAt(startPos, originalText)
          .run();
      } else {
        editor.chain().focus().deleteRange({ from: startPos, to: currentPos }).run();
      }
    }
    aiOriginalContentRef.current = null;
  };

  const streamAiGenerate = async (
    commandType: string,
    userPrompt: string,
    customContext?: string
  ) => {
    if (!editor) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsAiStreaming(true);
    setAiActionBar(null);
    
    const currentContent = editor.getHTML();
    let startPos = editor.state.selection.from;
    let endPos = editor.state.selection.to;
    const isSelection = commandType.endsWith("-selection");
    let contextToUse = customContext || currentContent;
    let originalText = customContext || "";
    
    if (isSelection && !customContext) {
      contextToUse = editor.state.doc.textBetween(startPos, endPos, " ");
      originalText = contextToUse;
      editor.chain().focus().setMark("aiHighlight").run();
    }

    aiOriginalContentRef.current = {
      startPos,
      originalText: isSelection ? originalText : undefined,
      wasSelection: isSelection
    };

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: userPrompt,
          context: contextToUse,
          commandType,
          draftMeta,
        }),
      });
      if (!response.ok || !response.body) throw new Error("Stream failed");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      editor.commands.focus();
      
      if (isSelection) {
        editor.chain().focus().deleteSelection().run();
        startPos = editor.state.selection.from;
      }
      
      let accumulatedText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          accumulatedText += chunk;
          editor.commands.insertContent(chunk);
        }
      }
      
      let finalHtml = accumulatedText
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/^-\s+(.+)$/gm, "<li>$1</li>")
        .replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");
      
      const currentSelectionEnd = editor.state.selection.from;
      editor.commands.deleteRange({ from: startPos, to: currentSelectionEnd });
      editor.commands.insertContentAt(startPos, finalHtml);
      
      const finalEndPos = editor.state.selection.from;
      try {
        const coords = editor.view.coordsAtPos(finalEndPos);
        let barTop = coords.bottom + 8;
        const scrollContainer = containerRef?.current?.querySelector(
          ".simple-editor-content"
        );
        if (scrollContainer) {
          const minBottomSpace = 80;
          const overflow = coords.bottom + minBottomSpace - window.innerHeight;
          if (overflow > 0) {
            scrollContainer.scrollTop += overflow;
            barTop -= overflow;
          }
        }
        let barLeft = coords.left;
        const containerRect = containerRef?.current?.getBoundingClientRect();
        if (containerRect) {
          const isMobileW = window.innerWidth < 640;
          const barWidth = isMobileW ? 250 : 450;
          const padding = 16;
          barLeft = Math.max(
            containerRect.left + padding,
            Math.min(coords.left, containerRect.right - barWidth - padding)
          );
        }
        setAiActionBar({
          startPos,
          endPos: finalEndPos,
          commandType,
          prompt: userPrompt,
          coords: { top: barTop, left: barLeft },
          originalText: isSelection ? originalText : undefined,
        });
      } catch {
        setAiActionBar({
          startPos,
          endPos: finalEndPos,
          commandType,
          prompt: userPrompt,
          coords: { top: 200, left: 100 },
          originalText: isSelection ? originalText : undefined,
        });
      }
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.log("AI stream aborted gracefully");
      } else {
        console.error("AI stream error", e);
      }
    } finally {
      setIsAiStreaming(false);
    }
  };

  const handleAiAccept = () => {
    setAiActionBar(null);
    editor?.chain().focus().unsetMark("aiHighlight").run();
  };

  const handleAiDiscard = () => {
    if (!aiActionBar || !editor) return;
    const { startPos, endPos, originalText } = aiActionBar;
    editor.chain().focus().unsetMark("aiHighlight").run();
    if (originalText) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: startPos, to: endPos })
        .insertContentAt(startPos, originalText)
        .run();
    } else {
      editor.chain().focus().deleteRange({ from: startPos, to: endPos }).run();
    }
    setAiActionBar(null);
  };

  const handleAiRetry = async () => {
    if (!aiActionBar || !editor) return;
    const { commandType, prompt, startPos, endPos, originalText } = aiActionBar;
    setAiActionBar(null);
    if (originalText) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: startPos, to: endPos })
        .insertContentAt(startPos, originalText)
        .setTextSelection({
          from: startPos,
          to: startPos + originalText.length,
        })
        .run();
      await streamAiGenerate(commandType, prompt);
    } else {
      editor.chain().focus().deleteRange({ from: startPos, to: endPos }).run();
      await streamAiGenerate(commandType, prompt);
    }
  };

  const handleAiVariation = async (style: "professional" | "creative" | "concise") => {
    if (!aiActionBar || !editor || isAiStreaming) return;
    const { startPos, endPos } = aiActionBar;
    const currentText = editor.state.doc.textBetween(startPos, endPos, " ");
    
    editor.chain().focus().setTextSelection({ from: startPos, to: endPos }).setMark("aiHighlight").run();
    
    let commandType = "improve-selection";
    if (style === "professional") commandType = "formalize-selection";
    else if (style === "creative") commandType = "casualize-selection";
    else if (style === "concise") commandType = "shorten-selection";
    
    await streamAiGenerate(
      commandType,
      `Ubah teks ini agar terdengar sangat ${style === "professional" ? "profesional, berwibawa, dan elegan" : style === "creative" ? "kreatif, penuh metafora menarik, dan viral" : "ringkas, to the point, padat, dan efisien"}`,
      currentText
    );
  };

  return {
    isAiStreaming,
    aiActionBar,
    setAiActionBar,
    handleCancelAi,
    streamAiGenerate,
    handleAiAccept,
    handleAiDiscard,
    handleAiRetry,
    handleAiVariation,
  };
}
