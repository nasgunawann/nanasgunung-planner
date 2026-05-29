export type Template = {
  title: string;
  type: string;
  usage: string;
  platform: string;
  category: string;
  description: string;
  blueprint: string;
  isCustom?: boolean;
};

export type Snippet = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
};

export const defaultTemplates: Template[] = [
  {
    title: "Launch Teaser Blueprint",
    type: "Short Video",
    usage: "4 kali digunakan",
    platform: "Instagram",
    category: "Reels",
    description:
      "Cocok untuk membangun rasa penasaran audiens sebelum merilis fitur atau produk baru.",
    isCustom: true,
    blueprint: `<h3><strong>[OUTLINE STORYBOARD VIDEO]</strong></h3>
<p></p>
<ul>
  <li><strong>0:00 - Hook Visual:</strong> Tampilkan layar hitam dengan tulisan <em>\"Kami lelah dengan Google Calendar...\"</em></li>
  <li><strong>0:03 - Masalah Utama:</strong> Tunjukkan kebingungan mengatur jadwal secara manual di sidebar.</li>
  <li><strong>0:07 - Solusi Nyata:</strong> Tampilkan mockup live planner baru dengan transisi kilat.</li>
  <li><strong>0:12 - Call-To-Action (CTA):</strong> Ajak penonton klik link di bio untuk mendapatkan akses awal gratis! 🎉</li>
</ul>`,
  },
  {
    title: "Educational Carousel Blueprint",
    type: "Carousel Slides",
    usage: "7 kali digunakan",
    platform: "LinkedIn",
    category: "Post",
    description:
      "Membagi tips teknis mendalam menggunakan struktur slide yang informatif dan memiliki tingkat simpan tinggi.",
    isCustom: true,
    blueprint: `<h3><strong>[STRUKTUR SLIDE CAROUSEL]</strong></h3>
<p></p>
<ol>
  <li><strong>Slide 1:</strong> Headline menarik & provokatif (cth: <em>\"Jangan pakai database berat untuk MVP Anda!\"</em>)</li>
  <li><strong>Slide 2:</strong> Tunjukkan fakta/angka kelemahan cara lama (loading lambat, biaya setup mahal).</li>
  <li><strong>Slide 3:</strong> Jelaskan alternatif cara baru (contoh penggunaan browser LocalStorage).</li>
  <li><strong>Slide 4:</strong> Berikan cuplikan kode / snippet implementasi sederhana.</li>
  <li><strong>Slide 5:</strong> Ringkasan singkat keuntungan + Ajakan untuk <strong>SIMPAN / SAVE</strong> postingan ini!</li>
</ol>`,
  },
  {
    title: "Interactive Story Seq Blueprint",
    type: "Stories Sequence",
    usage: "11 kali digunakan",
    platform: "Instagram",
    category: "Stories",
    description:
      "Membangun interaksi personal menggunakan urutan stiker jajak pendapat (Poll) atau Q&A.",
    isCustom: true,
    blueprint: `<h3><strong>[URUTAN INSTAGRAM STORIES]</strong></h3>
<p></p>
<ul>
  <li><strong>Story 1:</strong> Gunakan stiker <strong>POLL / Jajak Pendapat</strong>.<br/>Tanya: <em>\"Apakah kalian sering merasa burn-out mengelola jadwal konten?\"</em> (Pilihan: Ya / Banget!)</li>
  <li><strong>Story 2:</strong> Respon hasil polling & validasi keresahan mereka.<br/>Teks: <em>\"Ternyata 80% dari kita merasakan hal yang sama. Inilah alasan kami mendesain UI baru ini...\"</em></li>
  <li><strong>Story 3:</strong> <strong>CTA Tautan Link</strong>.<br/>Ajak mereka klik link sticker untuk bergabung ke waiting-list eksklusif.</li>
</ul>`,
  },
];

export const defaultSnippets: Snippet[] = [
  {
    id: "snip-1",
    title: "CTA Follow Standard",
    content:
      "Jangan lupa untuk follow @nanasgunung untuk tips menarik seputar Web Development & Design setiap hari! 🚀",
    category: "CTA",
    tags: ["Promo", "Instagram"],
  },
  {
    id: "snip-2",
    title: "Kumpulan Hashtag Tech",
    content:
      "#nextjs #typescript #programmerindonesia #webdev #codinglife #belajarcoding",
    category: "Hashtags",
    tags: ["Hashtags", "Tech"],
  },
  {
    id: "snip-3",
    title: "Closing Post LinkedIn",
    content:
      "Bagaimana dengan workflow tim Anda saat membangun MVP? Mari diskusi di kolom komentar! 👇",
    category: "Stories",
    tags: ["Launch", "LinkedIn"],
  },
];

export const defaultCategories = [
  "CTA",
  "Hashtags",
  "Stories",
  "Intro",
  "UGC",
  "FAQ",
];
