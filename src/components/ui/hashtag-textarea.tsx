"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { IconX, IconSparkles } from "@tabler/icons-react";

interface HashtagTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function HashtagTextarea({
  value,
  onChange,
  placeholder = "Ketik konten Anda di sini... Gunakan #hashtag untuk membuat tag otomatis.",
  className = "",
  rows = 4,
}: HashtagTextareaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse existing content into items (text segments and hashtags)
  const getParsedItems = () => {
    if (!value.trim()) return [];
    
    // Split text by space while preserving spacing
    const tokens = value.split(/(\s+)/);
    const items: { id: string; type: "text" | "hashtag"; content: string }[] = [];

    tokens.forEach((token, idx) => {
      if (token.startsWith("#") && token.length > 1) {
        items.push({
          id: `hash-${idx}-${token}`,
          type: "hashtag",
          content: token,
        });
      } else if (token !== "") {
        // If the last item was text, merge them to avoid separate blocks
        const lastItem = items[items.length - 1];
        if (lastItem && lastItem.type === "text") {
          lastItem.content += token;
        } else {
          items.push({
            id: `text-${idx}`,
            type: "text",
            content: token,
          });
        }
      }
    });

    return items;
  };

  const parsedItems = getParsedItems();

  const handleAddHashtag = (tagText: string) => {
    let cleanTag = tagText.trim();
    if (!cleanTag) return;
    
    // Ensure it has a leading #
    if (!cleanTag.startsWith("#")) {
      cleanTag = `#${cleanTag}`;
    }

    const separator = value === "" || value.endsWith(" ") ? "" : " ";
    const newValue = `${value}${separator}${cleanTag} `;
    onChange(newValue);
    setInputText("");
  };

  const handleRemoveHashtag = (hashtagContent: string) => {
    // Escape hashtag for regex replacement
    const escaped = hashtagContent.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Match either the hashtag preceded by space or followed by space
    const regex = new RegExp(`(?:\\s+)?${escaped}(?:\\s+)?`, "g");
    const updatedValue = value.replace(regex, " ").trim();
    
    onChange(updatedValue === "" ? "" : `${updatedValue} `);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    // If typing space, enter, or comma and it's a hashtag, commit it!
    if (text.startsWith("#") && (text.endsWith(" ") || text.endsWith(",") || text.endsWith("\n"))) {
      handleAddHashtag(text.slice(0, -1));
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      if (inputText.trim()) {
        handleAddHashtag(inputText);
      }
    } else if (e.key === "Backspace" && inputText === "" && parsedItems.length > 0) {
      // Find the last hashtag item and delete it
      const hashtags = parsedItems.filter((i) => i.type === "hashtag");
      if (hashtags.length > 0) {
        e.preventDefault();
        const lastHashtag = hashtags[hashtags.length - 1];
        handleRemoveHashtag(lastHashtag.content);
      }
    }
  };

  const handleBlur = () => {
    if (inputText.trim()) {
      if (inputText.startsWith("#")) {
        handleAddHashtag(inputText);
      } else {
        // If not a hashtag, append as plain text on blur
        const separator = value === "" || value.endsWith(" ") ? "" : " ";
        onChange(`${value}${separator}${inputText.trim()} `);
        setInputText("");
      }
    }
  };

  // Synchronize normal text typing directly to content if it's not a hashtag trigger
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`flex flex-wrap items-start gap-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs shadow-sm focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary/60 transition-all cursor-text min-h-[100px] align-top ${className}`}
    >
      {/* Dynamic Content Display */}
      {parsedItems.map((item) => {
        if (item.type === "hashtag") {
          return (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground border border-border/80 pl-2 pr-1.5 py-0.5 rounded text-[10px] font-bold select-none transition-all hover:bg-muted mt-0.5"
            >
              {item.content}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveHashtag(item.content);
                }}
                className="size-3.5 flex items-center justify-center rounded-full hover:bg-foreground/15 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                aria-label={`Hapus hashtag ${item.content}`}
              >
                <IconX className="size-2.5" />
              </button>
            </span>
          );
        }
        return (
          <span key={item.id} className="text-foreground py-0.5 break-all whitespace-pre-wrap">
            {item.content}
          </span>
        );
      })}

      {/* Input controller */}
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={handleBlur}
        placeholder={value === "" ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent py-0.5 text-xs outline-none placeholder:text-muted-foreground/60 border-none focus:ring-0 p-0 text-foreground"
      />
    </div>
  );
}
