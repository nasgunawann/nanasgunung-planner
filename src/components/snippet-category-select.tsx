"use client";

import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { defaultSnippetCategories } from "@/lib/library-seed";

interface SnippetCategorySelectProps {
  value: string;
  onValueChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
}

export function SnippetCategorySelect({
  value,
  onValueChange,
  className,
  placeholder = "Pilih Kategori Aset",
  id,
  name,
}: SnippetCategorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} name={name}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {defaultSnippetCategories.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
