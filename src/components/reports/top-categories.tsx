"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { formatBRL } from "@/lib/money";
import type { CategoryTotal } from "@/hooks/use-reports";
import type { Category } from "@/types";

interface TopCategoriesProps {
  items: CategoryTotal[];
  categoryMap: Map<string, Category>;
}

/**
 * Top 5 categorias com barra horizontal proporcional ao maior valor.
 * Visual leve: faixa colorida com a cor da categoria, valor na ponta.
 */
export function TopCategories({ items, categoryMap }: TopCategoriesProps) {
  const top = items.slice(0, 5);
  const max = top[0]?.totalCents ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Top categorias do mês</CardTitle>
      </CardHeader>

      {top.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
          Sem gastos variáveis neste mês
        </div>
      ) : (
        <ul className="flex flex-col gap-3 px-4 pb-4">
          {top.map((row) => {
            const cat = categoryMap.get(row.categoryId);
            const widthPct = max > 0 ? (row.totalCents / max) * 100 : 0;
            const color = cat?.color ?? "#71717a";
            return (
              <li key={row.categoryId} className="flex items-center gap-3">
                <CategoryIcon category={cat} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {cat?.name ?? "Sem categoria"}
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums">
                      {formatBRL(row.totalCents)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
