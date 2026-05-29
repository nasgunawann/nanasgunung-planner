export const navItems = [
  { href: "/calendar", label: "Calendar", iconName: "IconCalendarEvent" },
  { href: "/brainstorm", label: "Brainstorm", iconName: "IconSparkles" },
  { href: "/drafts", label: "Drafts", iconName: "IconPencil" },
  { href: "/library", label: "Library", iconName: "IconBooks" },
];

export const pageHeaders: Record<
  string,
  { title: string; actionLabel?: string }
> = {
  "/calendar": { title: "Calendar" },
  "/drafts": { title: "Drafts" },
  "/brainstorm": { title: "Brainstorm" },
  "/library": { title: "Library" },
};

// Note: We export iconName as a string to keep this file free of icon imports.
// Consumers should map iconName to actual icon components where used.
