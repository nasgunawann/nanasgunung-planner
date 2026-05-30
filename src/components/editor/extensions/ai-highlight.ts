import { Mark, mergeAttributes } from "@tiptap/core";

const AiHighlight = Mark.create({
  name: "aiHighlight",
  addOptions() {
    return { HTMLAttributes: { class: "ai-processing px-1 rounded" } };
  },
  parseHTML() {
    return [{ tag: "span[data-ai-highlight]" }];
  },
  renderHTML({ HTMLAttributes }: any) {
    return [
      "span",
      mergeAttributes(
        { "data-ai-highlight": "" },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ];
  },
});

export default AiHighlight;
