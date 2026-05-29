import React from "react";
import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  IconRowInsertTop,
  IconRowInsertBottom,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconTrash,
} from "@tabler/icons-react";

type TableBubbleProps = {
  editor: Editor;
  isAiStreaming: boolean;
};

export default function TableBubble({ editor, isAiStreaming }: TableBubbleProps) {
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: ed, from, to }) => {
        // Only show this bubble menu when the cursor is inside a table cell,
        // and we are not currently streaming AI content
        return ed.isActive("table") && !isAiStreaming;
      }}
    >
      <div className="bg-card border border-border shadow-2xl rounded-xl p-1 backdrop-blur-md flex items-center gap-0.5 z-[9996] animate-in fade-in zoom-in-95 duration-100">
        {/* Row Operations */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="size-7 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Tambah Baris di Atas"
          >
            <IconRowInsertTop className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="size-7 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Tambah Baris di Bawah"
          >
            <IconRowInsertBottom className="size-4" />
          </button>
        </div>

        <span className="w-px h-4 bg-border/60 mx-1 shrink-0" />

        {/* Column Operations */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="size-7 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Tambah Kolom di Kiri"
          >
            <IconColumnInsertLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="size-7 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Tambah Kolom di Kanan"
          >
            <IconColumnInsertRight className="size-4" />
          </button>
        </div>

        <span className="w-px h-4 bg-border/60 mx-1 shrink-0" />

        {/* Delete Row / Column Operations */}
        <div className="flex items-center gap-0.5">
          {/* Custom SVG for Delete Row */}
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="size-7 flex items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            title="Hapus Baris Ini"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              <circle cx="18" cy="12" r="3" fill="var(--card)" />
              <path d="M16.5 12h3" strokeLinecap="round" />
            </svg>
          </button>
          
          {/* Custom SVG for Delete Column */}
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="size-7 flex items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            title="Hapus Kolom Ini"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path d="M6 4v16M12 4v16M18 4v16" strokeLinecap="round" />
              <circle cx="12" cy="18" r="3" fill="var(--card)" />
              <path d="M10.5 18h3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <span className="w-px h-4 bg-border/60 mx-1 shrink-0" />

        {/* Delete Entire Table */}
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteTable().run()}
          className="size-7 flex items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
          title="Hapus Tabel Secara Utuh"
        >
          <IconTrash className="size-4" />
        </button>
      </div>
    </BubbleMenu>
  );
}
