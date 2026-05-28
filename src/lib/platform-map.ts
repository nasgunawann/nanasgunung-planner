export const platformColorMap: Record<string, string> = {
  Instagram: "bg-pink-500 text-white",
  TikTok: "bg-black text-white",
  YouTube: "bg-red-600 text-white",
  LinkedIn: "bg-sky-600 text-white",
  Default: "bg-muted/40 text-foreground",
};

export const statusAccentMap: Record<
  string,
  { border: string; title: string; bg: string; chipText: string }
> = {
  Draft: {
    border: "border-l-amber-400",
    title: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-400/15",
    chipText: "text-amber-800 dark:text-amber-200",
  },
  "In progress": {
    border: "border-l-sky-400",
    title: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-400/15",
    chipText: "text-sky-800 dark:text-sky-200",
  },
  Published: {
    border: "border-l-emerald-400",
    title: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-400/15",
    chipText: "text-emerald-800 dark:text-emerald-200",
  },
  Default: {
    border: "border-l-border",
    title: "text-foreground",
    bg: "bg-muted/40",
    chipText: "text-foreground",
  },
};

export const normalizeStatus = (status?: string) => {
  if (!status) return "Draft";
  const value = status.toLowerCase();
  if (value.includes("progress")) return "In progress";
  if (
    value.includes("publish") ||
    value.includes("ready") ||
    value.includes("scheduled") ||
    value.includes("planned") ||
    value.includes("review") ||
    value.includes("edit")
  ) {
    return "Published";
  }
  return "Draft";
};

export const contentCategoryLabelMap: Record<string, string> = {
  Stories: "Stories",
  Reels: "Reels",
  Post: "Post",
};
