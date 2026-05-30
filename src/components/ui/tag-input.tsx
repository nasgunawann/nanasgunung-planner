"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { IconX } from "@tabler/icons-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, onChange, placeholder = "Ketik tag..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tagText: string) => {
    // Trim, convert to lowercase, remove any starting '#' and duplicate spaces
    let cleanTag = tagText.trim().replace(/^#+/, "");
    if (!cleanTag) return;

    // Avoid duplicates
    if (!tags.includes(cleanTag)) {
      onChange([...tags, cleanTag]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div 
      className="flex flex-wrap items-center gap-1.5 min-h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-xs shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 pl-2 pr-1.5 py-0.5 rounded text-[10px] font-bold select-none capitalize transition-all"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(index);
            }}
            className="size-3.5 flex items-center justify-center rounded-full hover:bg-primary/20 text-primary/75 hover:text-primary transition-all cursor-pointer"
            aria-label={`Hapus tag ${tag}`}
          >
            <IconX className="size-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent py-1 text-xs outline-none placeholder:text-muted-foreground/60 border-none focus:ring-0 p-0 text-foreground"
      />
    </div>
  );
}
