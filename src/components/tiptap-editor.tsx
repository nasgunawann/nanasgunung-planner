"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect } from "react";
import {
  IconBold,
  IconItalic,
  IconH1,
  IconH2,
  IconList,
  IconListNumbers,
  IconQuote,
  IconCode,
  IconHash,
} from "@tabler/icons-react";

type TipTapEditorProps = {
  content: string;
  onChange: (val: string) => void;
};

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  // Initialize TipTap
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // Pass the compiled HTML to the parent's debounced save state
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[420px] text-xs text-muted-foreground leading-relaxed p-4 font-sans ProseMirror",
      },
    },
  });

  // Sync internal TipTap state if the parent content changes externally (e.g. Initial load)
  useEffect(() => {
    if (!editor || content === editor.getHTML()) return;
    editor.commands.setContent(content, { emitUpdate: false }); // prevents triggering onUpdate again to avoid infinite loops
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs font-mono text-muted-foreground/60">
        Initializing TipTap Engine...
      </div>
    );
  }

  // Inject hashtags into current cursor location using TipTap Transactions
  const injectHashtags = (tags: string[]) => {
    editor.chain().focus().insertContent(" " + tags.join(" ") + " ").run();
  };

  const hashtagPacks: Record<string, string[]> = {
    Code: ["#developer", "#nextjs", "#programming", "#coding", "#reactjs"],
    Design: ["#uidesign", "#webdesign", "#figma", "#creative", "#aesthetics"],
    Life: ["#solocreator", "#developerlife", "#buildinpublic", "#remotework"],
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Dynamic WYSIWYG Formatting Toolbar */}
      <div className="bg-muted/30 border-b border-border/50 px-3 py-2 flex flex-wrap items-center gap-1 shadow-inner shrink-0">
        
        {/* Bold Button */}
        <button
          type="button"
          title="Bold (Ctrl+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("bold")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconBold className="size-4" />
        </button>

        {/* Italic Button */}
        <button
          type="button"
          title="Italic (Ctrl+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("italic")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconItalic className="size-4" />
        </button>

        {/* H1 Heading */}
        <button
          type="button"
          title="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("heading", { level: 1 })
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconH1 className="size-4" />
        </button>

        {/* H2 Heading */}
        <button
          type="button"
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("heading", { level: 2 })
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconH2 className="size-4" />
        </button>

        {/* Bullet List */}
        <button
          type="button"
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("bulletList")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconList className="size-4" />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("orderedList")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconListNumbers className="size-4" />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("blockquote")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconQuote className="size-4" />
        </button>

        {/* Code Block */}
        <button
          type="button"
          title="Storyboard Code Block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={[
            "size-7 flex items-center justify-center rounded transition-colors",
            editor.isActive("codeBlock")
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ].join(" ")}
        >
          <IconCode className="size-4" />
        </button>

        <span className="h-4 w-px bg-border mx-2" />

        {/* Live Hashtag Injections */}
        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mr-1">
          <IconHash className="size-3" />
          Inject Hashtags:
        </span>
        {Object.entries(hashtagPacks).map(([packName, tags]) => (
          <button
            key={packName}
            type="button"
            onClick={() => injectHashtags(tags)}
            className="text-[10px] bg-background hover:bg-muted border border-border px-2 py-0.5 rounded font-semibold transition-all text-muted-foreground hover:text-foreground"
          >
            +{packName}
          </button>
        ))}
      </div>

      {/* Tiptap Styled Content Area */}
      <div className="flex-1 p-4 bg-background/30 overflow-y-auto min-h-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
