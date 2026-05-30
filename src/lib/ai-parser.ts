// Lightweight AI response parser for Brainstorm angles
export function parseAngles(
  text: string,
): { title: string; hook: string; outline: string }[] {
  const angles: { title: string; hook: string; outline: string }[] = [];

  // Robust case-insensitive splitter for all ANGLE heading variations
  const sections = text.split(/={2,}\s*ANGLE\s*\d+\s*={2,}/gi);

  for (const section of sections) {
    if (!section.trim()) continue;

    // Support case-insensitive title, hook, and outline labels (indonesian or english)
    // Resiliently matches optional markdown asterisks, hashes, and spacing around labels
    const titleMatch = section.match(/(?:\*{0,2})(?:TITLE|Title|Judul)(?:\*{0,2})\s*:\s*(.+)/i);
    const hookMatch = section.match(/(?:\*{0,2})(?:HOOK|Hook|Opening)(?:\*{0,2})\s*:\s*(.+)/i);
    const outlineMatch = section.match(
      /(?:\*{0,2})(?:OUTLINE|Outline|Struktur|Storyboard)(?:\*{0,2})\s*:\s*/i,
    );

    const outlineIndex =
      outlineMatch && outlineMatch.index !== undefined
        ? outlineMatch.index
        : -1;
    const outlineLength = outlineMatch ? outlineMatch[0].length : 8;

    let title = "";
    let hook = "";
    let outline = "";

    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^['"'*#\s]+|['"'*#\s]+$/g, "");
    }
    if (hookMatch) {
      hook = hookMatch[1].trim().replace(/^['"'*#\s]+|['"'*#\s]+$/g, "");
    }
    if (outlineIndex !== -1) {
      outline = section.substring(outlineIndex + outlineLength).trim();
      // Clean leading and trailing markdown stars, brackets, hashes, or quotes
      outline = outline.replace(/^['"'*#\s]+|['"'*#\s]+$/g, "");
    }

    if (title || hook || outline) {
      angles.push({
        title: title || "Ide Konten Baru",
        hook: hook || "Hook tidak tersedia.",
        outline: outline || "Outline tidak tersedia.",
      });
    }
  }

  return angles;
}

export default parseAngles;
