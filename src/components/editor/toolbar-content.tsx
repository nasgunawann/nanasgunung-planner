"use client";

import { IconMaximize, IconMinimize, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

export function MainToolbarContent({
  onHighlighterClick,
  onLinkClick,
  onAiClick,
  isMobile,
  isFullscreen,
  onFullscreenToggle,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  onAiClick: () => void;
  isMobile: boolean;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
}) {
  return (
    <>
      <ToolbarGroup>
        <Button
          onClick={onAiClick}
          variant="ghost"
          className="ai-accent-ghost gap-1 px-2 text-[10px] font-semibold"
          title="Generate dengan AI (Ctrl+/)"
        >
          <IconSparkles className="size-4 shrink-0" />
          {!isMobile && <span>Generate</span>}
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
      </ToolbarGroup>

      {!isMobile && (
        <>
          <ToolbarSeparator />
          <ToolbarGroup>
            <Button
              onClick={onFullscreenToggle}
              variant="ghost"
              className="size-7 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title={
                isFullscreen
                  ? "Keluar Mode Fokus (Esc)"
                  : "Mode Fokus Fullscreen (Zen)"
              }
            >
              {isFullscreen ? (
                <IconMinimize className="size-4 shrink-0 text-primary" />
              ) : (
                <IconMaximize className="size-4 shrink-0" />
              )}
            </Button>
          </ToolbarGroup>
        </>
      )}
    </>
  );
}

export function MobileToolbarContent({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) {
  return (
    <>
      <ToolbarGroup>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeftIcon className="tiptap-button-icon" />
          {type === "highlighter" ? (
            <HighlighterIcon className="tiptap-button-icon" />
          ) : (
            <LinkIcon className="tiptap-button-icon" />
          )}
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      {type === "highlighter" ? (
        <ColorHighlightPopoverContent />
      ) : (
        <LinkContent />
      )}
    </>
  );
}
