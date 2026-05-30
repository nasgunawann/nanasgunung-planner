export const navItems = [
  { href: "/dashboard", label: "Dashboard", iconName: "IconLayoutDashboard" },
  { href: "/calendar", label: "Calendar", iconName: "IconCalendarEvent" },
  { href: "/brainstorm", label: "Brainstorm", iconName: "IconSparkleHighlight" },
  { href: "/drafts", label: "Drafts", iconName: "IconPencil" },
  { href: "/library", label: "Pustaka", iconName: "IconBooks" },
];

export const pageHeaders: Record<
  string,
  { title: string; actionLabel?: string }
> = {
  "/dashboard": { title: "Dashboard" },
  "/calendar": { title: "Calendar" },
  "/drafts": { title: "Drafts" },
  "/brainstorm": { title: "Brainstorm" },
  "/library": { title: "Pustaka" },
};

// Note: We export iconName as a string to keep this file free of icon imports.
// Consumers should map iconName to actual icon components where used.
