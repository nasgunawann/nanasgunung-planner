// src/app/api/ai/route.ts
import { GoogleGenAI } from "@google/genai";
import type { NextRequest } from "next/server";

/**
 * POST /api/ai
 * Body JSON:
 *   { prompt: string, context?: string, model?: string }
 *   - `context` is the current editor HTML content (for context-aware generation).
 *   - `model` defaults to env GEMMA_MODEL or "gemini-2.5-flash-latest".
 *   - If the request to the specified model fails, it falls back to Gemini flash.
 * Response JSON includes the model actually used.
 */
export async function POST(req: NextRequest) {
  const { prompt, context, model: requestedModel } = await req.json();

  // Resolve model name: env overrides, then request, then fallback default
  const envModel = process.env.GEMMA_MODEL?.trim();
  const modelToUse = envModel || requestedModel || "gemini-2.5-flash-latest";

  // Initialise GenAI client (API key is required)
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!, // must exist in env
  });

  // Build the full prompt with context if provided
  const systemInstruction = `Kamu adalah asisten penulis konten kreatif. 
Tugasmu adalah membantu pengguna menulis konten sesuai instruksi yang diberikan.
Kembalikan HANYA teks konten yang diminta, tanpa markdown code block, tanpa penjelasan tambahan, tanpa header seperti "Berikut adalah:".
Tulis langsung kontennya saja.`;

  const fullPrompt = context
    ? `Konteks dokumen saat ini (HTML):\n${context}\n\n---\nInstruksi pengguna: ${prompt}`
    : `Instruksi pengguna: ${prompt}`;

  // Helper to call the model and return response text
  const callModel = async (modelName: string) => {
    const resp = await ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    });
    return resp.text;
  };


  try {
    const text = await callModel(modelToUse);
    return new Response(
      JSON.stringify({ modelUsed: modelToUse, output: text }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    // If the primary model fails (e.g., quota, unavailable), fallback to Gemini flash
    console.error("Primary model call failed:", err);
    const fallbackModel = "gemini-2.5-flash-latest";
    try {
      const fallbackText = await callModel(fallbackModel);
      return new Response(
        JSON.stringify({
          modelUsed: fallbackModel,
          fallbackFrom: modelToUse,
          output: fallbackText,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (fallbackErr) {
      console.error("Fallback model also failed:", fallbackErr);
      return new Response(
        JSON.stringify({ error: "AI generation failed for both primary and fallback models" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }
}
