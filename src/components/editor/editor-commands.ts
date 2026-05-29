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
  IconSparkles,
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

export type DraftMeta = {
  title?: string;
  platform?: string;
  category?: string;
  status?: string;
};

export type EditorCommandItem = {
  id: string;
  title: string;
  desc: string;
  icon: any;
  action?: (editor: any) => void;
  type?: "format" | "snippet" | "ai";
  content?: string;
  commandType?: string;
  requiresInput?: boolean;
  placeholder?: string;
};

// ─── Formatting Commands ─────────────────────────────────────────────────────
export const formatCommands: EditorCommandItem[] = [
  { id: "h1", title: "Heading 1", desc: "Judul ukuran besar (H1)", icon: IconH1, action: (ed: any) => ed.chain().focus().toggleHeading({ level: 1 }).run() },
  { id: "h2", title: "Heading 2", desc: "Judul ukuran sedang (H2)", icon: IconH2, action: (ed: any) => ed.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: "h3", title: "Heading 3", desc: "Judul ukuran kecil (H3)", icon: IconH3, action: (ed: any) => ed.chain().focus().toggleHeading({ level: 3 }).run() },
  { id: "bullet", title: "Bulleted List", desc: "Daftar bulatan sederhana", icon: IconList, action: (ed: any) => ed.chain().focus().toggleBulletList().run() },
  { id: "number", title: "Numbered List", desc: "Daftar urutan angka", icon: IconListNumbers, action: (ed: any) => ed.chain().focus().toggleOrderedList().run() },
  { id: "quote", title: "Quote / Kutipan", desc: "Blok kutipan teks/visual", icon: IconQuote, action: (ed: any) => ed.chain().focus().toggleBlockquote().run() },
  { id: "divider", title: "Divider (Garis)", desc: "Garis pembatas horizontal", icon: IconSeparatorHorizontal, action: (ed: any) => ed.chain().focus().setHorizontalRule().run() },
  { id: "code", title: "Storyboard Block", desc: "Blok kode storyboard", icon: IconCode, action: (ed: any) => ed.chain().focus().toggleCodeBlock().run() },
  { id: "strike", title: "Strikethrough", desc: "Coretan teks draf", icon: IconStrikethrough, action: (ed: any) => ed.chain().focus().toggleStrike().run() },
  { id: "underline", title: "Underline", desc: "Garis bawah teks", icon: IconUnderline, action: (ed: any) => ed.chain().focus().toggleUnderline().run() },
  { id: "highlight", title: "Highlight", desc: "Warna kuning sorotan", icon: IconHighlight, action: (ed: any) => ed.chain().focus().toggleHighlight().run() },
  { id: "align-left", title: "Rata Kiri", desc: "Teks rata kiri", icon: IconAlignLeft, action: (ed: any) => ed.chain().focus().setTextAlign("left").run() },
  { id: "align-center", title: "Rata Tengah", desc: "Teks rata tengah", icon: IconAlignCenter, action: (ed: any) => ed.chain().focus().setTextAlign("center").run() },
  { id: "align-right", title: "Rata Kanan", desc: "Teks rata kanan", icon: IconAlignRight, action: (ed: any) => ed.chain().focus().setTextAlign("right").run() },
  { id: "table", title: "Tabel", desc: "Sisipkan tabel 3x3", icon: IconTable, action: (ed: any) => ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { id: "link", title: "Link / Tautan", desc: "Sisipkan hyperlink", icon: IconLink, action: (ed: any) => {
    const url = prompt("Masukkan URL:");
    if (url) ed.chain().focus().setLink({ href: url }).run();
  }},
];

// ─── AI Commands ─────────────────────────────────────────────────────────────
export const aiCommands: EditorCommandItem[] = [
  { id: "ai-generate", type: "ai", title: "AI Generate", desc: "Tulis konten bebas sesuai instruksimu", icon: IconSparkles, commandType: "general", requiresInput: true, placeholder: "Contoh: tulis hook pembuka yang menarik perhatian..." },
  { id: "ai-hook", type: "ai", title: "Tulis Hook", desc: "Generate 3 variasi opening hook viral", icon: IconSparkles, commandType: "hook", requiresInput: false, placeholder: "" },
  { id: "ai-caption", type: "ai", title: "Caption Medsos", desc: "Caption siap posting untuk platformmu", icon: IconSparkles, commandType: "caption", requiresInput: false, placeholder: "" },
  { id: "ai-outline", type: "ai", title: "Buat Outline", desc: "Buat struktur konten dari topik ini", icon: IconSparkles, commandType: "outline", requiresInput: false, placeholder: "" },
  { id: "ai-improve", type: "ai", title: "Perbaiki Tulisan", desc: "Polish & perbaiki teks yang sudah ada", icon: IconSparkles, commandType: "improve", requiresInput: false, placeholder: "" },
];

// ─── Human-readable labels for each AI command type ──────────────────────────
export const AI_COMMAND_LABELS: Record<string, string> = {
  general: "AI Generate",
  hook: "Tulis Hook",
  caption: "Caption Medsos",
  outline: "Buat Outline",
  improve: "Perbaiki Tulisan",
  "improve-selection": "Perbaiki Seleksi",
  "shorten-selection": "Persingkat Seleksi",
  "formalize-selection": "Ubah ke Formal",
  "casualize-selection": "Ubah ke Santai",
  "continue-selection": "Lanjutkan Seleksi",
};
