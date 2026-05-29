import React from "react";
import { createPortal } from "react-dom";
import { EditorCommandItem } from "./editor-commands";

type SlashMenuProps = {
  isSlashActive: boolean;
  slashCoords: { top: number; bottom: number; left: number } | null;
  filteredItems: EditorCommandItem[];
  selectedIndex: number;
  selectedItemRef: React.RefObject<HTMLButtonElement | null>;
  executeCommand: (item: EditorCommandItem) => void;
};

export default function SlashMenu({
  isSlashActive,
  slashCoords,
  filteredItems,
  selectedIndex,
  selectedItemRef,
  executeCommand,
}: SlashMenuProps) {
  if (!isSlashActive || !slashCoords || filteredItems.length === 0 || typeof document === "undefined") return null;

  // ─── Slash menu item renderer ─────────────────────────────────────────────────
  const renderMenuItems = (items: EditorCommandItem[], colorClass = "text-muted-foreground/80") =>
    items.map((item) => {
      const itemIndex = filteredItems.indexOf(item);
      const isSelected = itemIndex === selectedIndex;
      const Icon = item.icon;
      return (
        <button
          key={item.id}
          ref={isSelected ? selectedItemRef : null}
          type="button"
          onClick={() => executeCommand(item)}
          className={[
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer select-none",
            isSelected ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted",
          ].join(" ")}
        >
          <Icon className={["size-4 shrink-0", isSelected ? "text-primary-foreground" : colorClass].join(" ")} />
          <div className="flex-1 min-w-0">
            <div className="truncate">{item.title}</div>
            <div
              className={[
                "text-[9px] truncate font-normal leading-tight mt-0.5",
                isSelected ? "text-primary-foreground/75" : "text-muted-foreground/65",
              ].join(" ")}
            >
              {item.desc}
            </div>
          </div>
        </button>
      );
    });

  return createPortal(
    <div
      id="tiptap-slash-menu"
      style={{
        position: "fixed",
        top:
          typeof window !== "undefined" && slashCoords.bottom + 260 > window.innerHeight
            ? slashCoords.top - Math.min(260, filteredItems.length * 40 + 20) - 4
            : slashCoords.bottom + 4,
        left:
          typeof window !== "undefined" ? Math.max(12, Math.min(slashCoords.left, window.innerWidth - 270)) : slashCoords.left,
      }}
      className="fixed z-[9999] w-64 bg-card/95 border border-border shadow-2xl rounded-xl p-2 max-h-[300px] overflow-y-auto backdrop-blur-md flex flex-col focus:outline-none scrollbar-none"
    >
      {filteredItems.some((i) => i.type === "format") && (
        <div className="flex flex-col">
          <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 px-3 py-1.5 select-none">
            Format Teks
          </div>
          {renderMenuItems(
            filteredItems.filter((i) => i.type === "format"),
            "text-muted-foreground/80"
          )}
        </div>
      )}

      {filteredItems.some((i) => i.type === "ai") && (
        <div className="flex flex-col mt-1 pt-1 border-t border-border/40">
          <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 px-3 py-1.5 select-none">
            AI Commands
          </div>
          {renderMenuItems(
            filteredItems.filter((i) => i.type === "ai"),
            "text-primary"
          )}
        </div>
      )}

      {filteredItems.some((i) => i.type === "snippet") && (
        <div className="flex flex-col mt-1 pt-1 border-t border-border/40">
          <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 px-3 py-1.5 select-none">
            Aset Siap Pakai
          </div>
          {renderMenuItems(
            filteredItems.filter((i) => i.type === "snippet"),
            "text-primary"
          )}
        </div>
      )}
    </div>,
    document.body
  );
}
