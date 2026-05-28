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
