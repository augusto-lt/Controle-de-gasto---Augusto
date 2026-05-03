"use client";

import { CategoryIcon } from "@/components/category-icon";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryPickerProps {
  categories: Category[];
  value: string | null;
  onChange: (id: string) => void;
}

/**
 * Grid de botões grandes para escolher categoria — ergonomia mobile,
 * cada chip tem ≥48px de altura. Mostra ícone colorido + nome.
 */
export function CategoryPicker({
  categories,
  value,
  onChange,
}: CategoryPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Categoria"
      className="grid grid-cols-4 gap-2"
    >
      {categories.map((cat) => {
        const selected = cat.id === value;
        return (
          <button
            key={cat.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(cat.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "active:scale-[0.97]",
              selected
                ? "border-foreground bg-accent"
                : "border-border bg-background hover:bg-accent/50",
            )}
          >
            <CategoryIcon category={cat} size="md" />
            <span
              className={cn(
                "line-clamp-1 text-[11px] font-medium leading-tight",
                selected ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
