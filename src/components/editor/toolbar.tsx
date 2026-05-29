import React from "react";
import { Editor } from "@tiptap/react";
import {
  IconBold,
  IconItalic,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconQuote,
  IconCode,
  IconSeparatorHorizontal,
  IconStrikethrough,
  IconUnderline,
  IconHighlight,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconLink,
  IconTable,
  IconColumnInsertRight,
  IconRowInsertBottom,
  IconTrash,
} from "@tabler/icons-react";

type ToolbarProps = {
  editor: Editor;
};

export default function Toolbar({ editor }: ToolbarProps) {
  // ─── Toolbar button helper ────────────────────────────────────────────────────
  const ToolbarBtn = ({
    onClick,
    active = false,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "size-7 flex items-center justify-center rounded transition-colors cursor-pointer",
        active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-muted/30 border-b border-border/50 px-3 py-2 flex flex-wrap items-center gap-1 shadow-inner shrink-0">
      {/* Text style */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
        <IconBold className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
        <IconItalic className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
        <IconUnderline className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <IconStrikethrough className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
        <IconHighlight className="size-4" />
      </ToolbarBtn>

      <span className="h-4 w-px bg-border mx-1" />

      {/* Headings */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
        <IconH1 className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
        <IconH2 className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
        <IconH3 className="size-4" />
      </ToolbarBtn>

      <span className="h-4 w-px bg-border mx-1" />

      {/* Lists */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
        <IconList className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
        <IconListNumbers className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
        <IconQuote className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
        <IconCode className="size-4" />
      </ToolbarBtn>

      <span className="h-4 w-px bg-border mx-1" />

      {/* Alignment */}
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Rata Kiri">
        <IconAlignLeft className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Rata Tengah">
        <IconAlignCenter className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Rata Kanan">
        <IconAlignRight className="size-4" />
      </ToolbarBtn>

      <span className="h-4 w-px bg-border mx-1" />

      {/* Table & extras */}
      <ToolbarBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Sisipkan Tabel">
        <IconTable className="size-4" />
      </ToolbarBtn>
      {editor.isActive("table") && (
        <>
          <ToolbarBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Tambah Kolom">
            <IconColumnInsertRight className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Tambah Baris">
            <IconRowInsertBottom className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Hapus Tabel">
            <IconTrash className="size-4" />
          </ToolbarBtn>
        </>
      )}
      <ToolbarBtn
        onClick={() => {
          const url = prompt("Masukkan URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        active={editor.isActive("link")}
        title="Link"
      >
        <IconLink className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
        <IconSeparatorHorizontal className="size-4" />
      </ToolbarBtn>
    </div>
  );
}
