import { Extension } from "@tiptap/core";

export const BlockReorder = Extension.create({
  name: "blockReorder",

  addKeyboardShortcuts() {
    return {
      "Alt-ArrowUp": () => (this.editor.commands as any).moveBlockUp(),
      "Alt-ArrowDown": () => (this.editor.commands as any).moveBlockDown(),
    };
  },

  addCommands() {
    return {
      moveBlockUp:
        () =>
        ({ state, dispatch }: any) => {
          const { selection } = state;
          const { $from } = selection;

          // Resolve dynamic target depth to find the closest movable block (e.g. list item, task item, table, or paragraph)
          let targetDepth = $from.depth;
          while (targetDepth > 0) {
            const node = $from.node(targetDepth);
            if (
              node.type.name === "tableRow" ||
              node.type.name === "tableCell" ||
              node.type.name === "table"
            ) {
              if (node.type.name === "table") break;
              targetDepth--;
              continue;
            }
            if (
              node.type.name === "listItem" ||
              node.type.name === "taskItem"
            ) {
              break;
            }
            if (targetDepth === 1) break;
            targetDepth--;
          }

          if (targetDepth <= 0) return false;

          const start = $from.before(targetDepth);
          const end = $from.after(targetDepth);

          const beforePos = start - 1;
          if (beforePos < 0) return false;

          const resolvedBefore = state.doc.resolve(beforePos);
          if (resolvedBefore.depth < targetDepth) return false;

          const siblingStart = resolvedBefore.before(targetDepth);
          const siblingEnd = resolvedBefore.after(targetDepth);

          // Verify they share the exact same parent node depth
          if (
            $from.node(targetDepth - 1) !== resolvedBefore.node(targetDepth - 1)
          )
            return false;

          if (dispatch) {
            const tr = state.tr;
            const slice = tr.doc.slice(start, end);

            tr.delete(start, end);
            tr.insert(siblingStart, slice.content);

            const newStart = siblingStart;
            const selectionOffset = selection.from - start;
            tr.setSelection(
              state.selection.constructor.near(
                tr.doc.resolve(newStart + selectionOffset),
              ),
            );

            dispatch(tr);
            return true;
          }

          return true;
        },

      moveBlockDown:
        () =>
        ({ state, dispatch }: any) => {
          const { selection } = state;
          const { $from } = selection;

          let targetDepth = $from.depth;
          while (targetDepth > 0) {
            const node = $from.node(targetDepth);
            if (
              node.type.name === "tableRow" ||
              node.type.name === "tableCell" ||
              node.type.name === "table"
            ) {
              if (node.type.name === "table") break;
              targetDepth--;
              continue;
            }
            if (
              node.type.name === "listItem" ||
              node.type.name === "taskItem"
            ) {
              break;
            }
            if (targetDepth === 1) break;
            targetDepth--;
          }

          if (targetDepth <= 0) return false;

          const start = $from.before(targetDepth);
          const end = $from.after(targetDepth);

          const afterPos = end + 1;
          if (afterPos >= state.doc.content.size) return false;

          const resolvedAfter = state.doc.resolve(afterPos);
          if (resolvedAfter.depth < targetDepth) return false;

          const siblingStart = resolvedAfter.before(targetDepth);
          const siblingEnd = resolvedAfter.after(targetDepth);

          // Verify they share the exact same parent node depth
          if (
            $from.node(targetDepth - 1) !== resolvedAfter.node(targetDepth - 1)
          )
            return false;

          if (dispatch) {
            const tr = state.tr;
            const slice = tr.doc.slice(start, end);

            tr.delete(start, end);

            const shiftedSiblingStart = siblingStart - (end - start);
            const shiftedSiblingEnd = siblingEnd - (end - start);

            tr.insert(shiftedSiblingEnd, slice.content);

            const newStart = shiftedSiblingEnd;
            const selectionOffset = selection.from - start;
            tr.setSelection(
              state.selection.constructor.near(
                tr.doc.resolve(newStart + selectionOffset),
              ),
            );

            dispatch(tr);
            return true;
          }

          return true;
        },
    } as any;
  },
});
