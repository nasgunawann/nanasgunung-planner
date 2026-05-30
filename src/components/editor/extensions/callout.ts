import { Node, mergeAttributes } from "@tiptap/core";

const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return { emoji: { default: "💡" } };
  },
  parseHTML() {
    return [{ tag: "div[data-type='callout']" }];
  },
  renderHTML({ node, HTMLAttributes }: any) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "callout" }),
      [
        "span",
        { class: "callout-emoji select-none", contenteditable: "false" },
        node.attrs.emoji,
      ],
      ["div", { class: "callout-content" }, 0],
    ];
  },
  addCommands() {
    return {
      setCallout:
        (attributes: any) =>
        ({ commands }: any) => {
          return commands.toggleNode("callout", "paragraph", attributes);
        },
    };
  },
} as any);

export default Callout;
