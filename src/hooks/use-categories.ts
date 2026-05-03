"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db, listCategories } from "@/lib/db";
import type { Category } from "@/types";

/** Lista reativa de categorias, ordenada por nome (pt-BR). */
export function useCategories(): Category[] {
  const rows = useLiveQuery(() => listCategories(), [], []);
  return rows ?? [];
}

/** Mapa `id -> Category` para lookups O(1) em listas. */
export function useCategoryMap(): Map<string, Category> {
  const cats = useCategories();
  return useMemo(() => new Map(cats.map((c) => [c.id, c])), [cats]);
}

/** Versão "raw" para casos em que precisamos do live query bruto. */
export function useCategoriesLive() {
  return useLiveQuery(() => db.categories.toArray(), []);
}
