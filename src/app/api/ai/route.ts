// src/app/api/ai/route.ts
import { GoogleGenAI } from "@google/genai";
import type { NextRequest } from "next/server";

type DraftMeta = {
  title?: string;
  platform?: string;
  category?: string;
  status?: string;
};

const SYSTEM_PROMPTS: Record<string, string> = {
  general: `Kamu adalah asisten penulis konten kreatif Indonesia.
Bantu pengguna menulis konten sesuai instruksi yang diberikan.
Kembalikan HANYA teks konten, tanpa penjelasan tambahan, tanpa header "Berikut adalah:", langsung ke kontennya.
Gunakan bahasa Indonesia yang natural dan engaging.`,

  hook: `Kamu adalah spesialis hook konten viral untuk media sosial Indonesia.
Tugasmu: tulis opening hook yang powerful, memancing rasa penasaran, dan membuat orang berhenti scroll.
Format: tulis 3 variasi hook, tiap variasi diawali tanda •
Gunakan teknik storytelling, pertanyaan provokatif, atau fakta mengejutkan.
Sesuaikan gaya dengan platform yang disebutkan.
Kembalikan HANYA teksnya, tanpa penjelasan.`,

  caption: `Kamu adalah copywriter media sosial profesional Indonesia.
Tugasmu: tulis caption yang engaging, siap posting, sesuai platform.
- Instagram: visual storytelling, 3-5 hashtag relevan, emoji secukupnya
- TikTok: singkat, hook di awal, CTA jelas, tren bahasa anak muda
- LinkedIn: profesional, insight driven, minimal emoji
- YouTube: deskriptif, SEO friendly
Kembalikan HANYA caption, tanpa penjelasan tambahan.`,

  outline: `Kamu adalah content strategist berpengalaman.
Tugasmu: buat outline konten yang terstruktur dan actionable.
Format outline:
1. Hook/Opening
2. Poin-poin utama (dengan sub-poin jika perlu)
3. CTA/Closing
Sesuaikan dengan platform dan format konten.
Kembalikan HANYA outline, tanpa penjelasan tambahan.`,

  improve: `Kamu adalah editor konten profesional.
Tugasmu: perbaiki dan polish teks yang diberikan tanpa mengubah makna aslinya.
Perbaikan: kejelasan kalimat, alur yang lebih smooth, kata-kata lebih engaging, hilangkan pengulangan.
Kembalikan HANYA teks yang sudah diperbaiki, tanpa penjelasan perubahan.`,

  "improve-selection": `Kamu adalah editor bahasa Indonesia profesional.
Tugasmu: perbaiki teks terpilih yang diberikan agar terdengar lebih mengalir (flow), alami, tata bahasa benar, dan menarik.
JANGAN mengubah inti makna teks aslinya.
Kembalikan HANYA teks hasil perbaikan tanpa penjelasan apapun.`,

  "shorten-selection": `Kamu adalah editor ringkasan profesional.
Tugasmu: persingkat teks terpilih yang diberikan agar lebih padat, ringkas, dan to-the-point tanpa menghilangkan informasi penting.
Kembalikan HANYA teks ringkasnya saja tanpa penjelasan tambahan.`,

  "formalize-selection": `Kamu adalah spesialis komunikasi formal.
Tugasmu: ubah gaya bahasa dari teks terpilih yang diberikan menjadi formal, profesional, sopan, dan akademis/bisnis yang tepat.
Kembalikan HANYA teks formalnya saja tanpa penjelasan tambahan.`,

  "casualize-selection": `Kamu adalah spesialis copywriter media sosial kasual.
Tugasmu: ubah gaya bahasa dari teks terpilih menjadi santai, kasual, friendly, conversational, dan ramah untuk dibaca di media sosial santai.
Kembalikan HANYA teks kasualnya saja tanpa penjelasan tambahan.`,

  "continue-selection": `Kamu adalah asisten penulis kreatif Indonesia.
Tugasmu: lanjutkan kalimat atau paragraf yang terputus/diberikan oleh pengguna secara mulus, koheren, dan natural sesuai konteksnya.
Kembalikan HANYA teks lanjutannya saja, tanpa mengulangi teks aslinya, tanpa penjelasan tambahan.`,

  brainstorm: `Kamu adalah content strategist dan copywriter media sosial jenius dari Indonesia.
Tugasmu: buat 3 sudut pandang kreatif (angles) berbeda untuk ide topik yang diberikan oleh pengguna.
Sesuaikan gaya bahasa, format outline, dan hook dengan platform sosial yang diminta (Instagram, TikTok, YouTube, atau LinkedIn) dan nada suara (tone) yang dipilih (yang tercantum di bawah "KONTEKS DRAFT" sebagai Platform dan Status/Nada).

Setiap angle harus memiliki:
1. TITLE: Judul atau headline yang spesifik, menarik, dan menangkap esensi angle tersebut (jangan hanya mengulang topik pengguna).
2. HOOK: Opening hook yang sangat kuat dan viral (1-2 kalimat).
3. OUTLINE: Struktur konten lengkap per bagian (misal per slide untuk Instagram, per timestamp atau adegan untuk TikTok/YouTube, atau per poin/paragraf untuk LinkedIn).

Kamu HARUS menuliskan hasilnya dengan format terstruktur menggunakan penanda persis seperti berikut agar bisa diproses oleh aplikasi:

=== ANGLE 1 ===
TITLE: [Judul Angle 1]
HOOK: [Hook Angle 1]
OUTLINE:
[Outline baris 1]
[Outline baris 2]
...
=== ANGLE 2 ===
TITLE: [Judul Angle 2]
HOOK: [Hook Angle 2]
OUTLINE:
[Outline baris 1]
...
=== ANGLE 3 ===
TITLE: [Judul Angle 3]
HOOK: [Hook Angle 3]
OUTLINE:
[Outline baris 1]
...

JANGAN menuliskan penjelasan pembuka, penutup, atau tanda markdown tambahan di luar struktur tersebut. Langsung mulai dari === ANGLE 1 ===.`,
};

function buildPrompt(
  commandType: string,
  userPrompt: string,
  context: string,
  draftMeta?: DraftMeta,
): string {
  const metaLines: string[] = [];
  if (draftMeta?.title) metaLines.push(`Judul Draft  : "${draftMeta.title}"`);
  if (draftMeta?.platform) metaLines.push(`Platform     : ${draftMeta.platform}`);
  if (draftMeta?.category) metaLines.push(`Kategori     : ${draftMeta.category}`);
  if (draftMeta?.status) metaLines.push(`Status       : ${draftMeta.status}`);

  const metaSection = metaLines.length > 0
    ? `--- KONTEKS DRAFT ---\n${metaLines.join("\n")}\n`
    : "";

  const contextSection = context && context !== "<p></p>"
    ? `--- ISI EDITOR SAAT INI ---\n${context}\n`
    : "";

  const instructionSection = userPrompt
    ? `--- INSTRUKSI PENGGUNA ---\n${userPrompt}`
    : "";

  if (commandType === "improve") {
    if (!contextSection) return "Belum ada teks untuk diperbaiki.";
    return `${metaSection}${contextSection}${instructionSection || "Perbaiki teks di atas."}`.trim();
  }

  if (commandType.endsWith("-selection")) {
    return `${metaSection}\n--- TEKS YANG DIPILIH PENGGUNA ---\n${context}\n${instructionSection}`.trim();
  }

  return [metaSection, contextSection, instructionSection].filter(Boolean).join("\n").trim();
}

export async function POST(req: NextRequest) {
  const {
    prompt = "",
    context = "",
    commandType = "general",
    draftMeta,
    model: requestedModel,
  } = await req.json();

  const envModel = process.env.GEMMA_MODEL?.trim();
  const modelToUse = envModel || requestedModel || "gemini-2.5-flash-latest";

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const systemInstruction = SYSTEM_PROMPTS[commandType] ?? SYSTEM_PROMPTS.general;
  const fullPrompt = buildPrompt(commandType, prompt, context, draftMeta);

  const streamFromModel = async (modelName: string): Promise<ReadableStream<Uint8Array>> => {
    const streamResult = await ai.models.generateContentStream({
      model: modelName,
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.85,
        maxOutputTokens: 2048,
      },
    });

    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of streamResult) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
  };

  try {
    const stream = await streamFromModel(modelToUse);
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Model-Used": modelToUse,
        "X-Command-Type": commandType,
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Primary model failed, trying fallback:", err);
    const fallback = "gemini-2.5-flash-latest";
    try {
      const stream = await streamFromModel(fallback);
      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Model-Used": fallback,
          "X-Fallback-From": modelToUse,
          "X-Command-Type": commandType,
          "Cache-Control": "no-cache",
        },
      });
    } catch (fallbackErr) {
      console.error("Fallback also failed:", fallbackErr);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }
}
