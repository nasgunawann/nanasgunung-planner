"use client";

import React, { useEffect, useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { IconGripVertical } from "@tabler/icons-react";

type DragHandleProps = {
  editor: Editor;
  draggedPosRef: React.RefObject<number | null>;
};

export default function DragHandle({ editor, draggedPosRef }: DragHandleProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [activeNodePos, setActiveNodePos] = useState<number | null>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || !editor.view) return;

    const view = editor.view;

    const handleMouseMove = (event: MouseEvent) => {
      const editorDOM = view.dom;
      
      // If mouse leaves the editor or is not inside it, check if it's over the handle
      if (!editorDOM.contains(event.target as Node)) {
        if (handleRef.current?.contains(event.target as Node)) {
          return; // Keep handle visible if mouse is directly over the handle
        }
        setCoords(null);
        setActiveNodePos(null);
        return;
      }

      // Find the position in the document at mouse coordinates
      const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
      if (!pos) return;

      // Resolve the position to find the top-level block node (depth = 1)
      const $pos = view.state.doc.resolve(pos.pos);
      const targetDepth = 1;
      if ($pos.depth < targetDepth) {
        setCoords(null);
        setActiveNodePos(null);
        return;
      }

      const blockStart = $pos.before(targetDepth);
      const blockNode = view.state.doc.nodeAt(blockStart);
      if (!blockNode) return;

      // Skip table rows or cell nodes internally, only target top-level block
      const blockDOM = view.nodeDOM(blockStart) as HTMLElement;
      if (!blockDOM) return;

      // Calculate coordinates relative to the editor viewport parent
      const rect = blockDOM.getBoundingClientRect();
      const editorParent = editorDOM.parentElement;
      if (!editorParent) return;
      const parentRect = editorParent.getBoundingClientRect();

      // Position the grip handle perfectly in the left margin of the block
      setCoords({
        top: rect.top - parentRect.top + (rect.height - 20) / 2, // Center vertically
        left: rect.left - parentRect.left - 16, // Move 16px to the left margin
      });
      setActiveNodePos(blockStart);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [editor]);

  // Handle drag start on the grip handle
  const handleDragStart = (event: React.DragEvent) => {
    if (activeNodePos === null || !editor) return;

    const view = editor.view;
    const { state } = view;

    // Create and dispatch a NodeSelection for the hovered block
    const selection = NodeSelection.create(state.doc, activeNodePos);
    view.dispatch(state.tr.setSelection(selection));

    // Force focus the editor
    editor.commands.focus();

    // Cache the dragged node's initial position
    if (draggedPosRef) {
      (draggedPosRef as any).current = activeNodePos;
    }

    // Set the block DOM element as the drag preview image for a premium native feedback!
    const blockDOM = view.nodeDOM(activeNodePos) as HTMLElement;
    if (blockDOM && event.dataTransfer) {
      event.dataTransfer.setDragImage(blockDOM, 0, 0);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", blockDOM.innerText || "");
    }
  };

  if (!coords || activeNodePos === null) return null;

  return (
    <div
      ref={handleRef}
      className="absolute z-40 flex items-center justify-center w-4 h-5 rounded cursor-grab hover:bg-muted active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-all duration-150"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      draggable="true"
      onDragStart={handleDragStart}
    >
      <IconGripVertical size={13} className="stroke-[2.5]" />
    </div>
  );
}
