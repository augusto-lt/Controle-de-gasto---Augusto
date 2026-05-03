"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { formatBRL } from "@/lib/money";
import type { Category } from "@/types";

interface CategoryDonutProps {
  byCategory: Map<string, number>;
  categoryMap: Map<string, Category>;
}

interface Slice {
  id: string;
  name: string;
  color: string;
  cents: number;
  pct: number;
  category?: Category;
}

interface DonutPayload {
  payload: Slice;
}

export function CategoryDonut({ byCategory, categoryMap }: CategoryDonutProps) {
  const slices: Slice[] = React.useMemo(() => {
    const total = Array.from(byCategory.values()).reduce(
      (sum, v) => sum + v,
      0,
    );
    if (total === 0) return [];
    return Array.from(byCategory.entries())
      .map<Slice>(([id, cents]) => {
        const cat = categoryMap.get(id);
        return {
          id,
          name: cat?.name ?? "Sem categoria",
          color: cat?.color ?? "#71717a",
          cents,
          pct: cents / total,
          category: cat,
        };
      })
      .sort((a, b) => b.cents - a.cents);
  }, [byCategory, categoryMap]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Por categoria</CardTitle>
      </CardHeader>

      {slices.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
          Sem gastos variáveis neste mês
        </div>
      ) : (
        <div className="grid grid-cols-[140px_1fr] gap-3 px-2 pb-3">
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="cents"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="95%"
                  stroke="var(--color-background)"
                  strokeWidth={2}
                  paddingAngle={1}
                  isAnimationActive
                >
                  {slices.map((s) => (
                    <Cell key={s.id} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const slice = (payload as unknown as DonutPayload[])[0].payload;
                    return (
                      <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                        <p className="font-medium text-popover-foreground">
                          {slice.name}
                        </p>
                        <p className="tabular-nums text-muted-foreground">
                          {formatBRL(slice.cents)} ·{" "}
                          {Math.round(slice.pct * 100)}%
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="flex flex-col justify-center gap-1.5 pr-3 text-xs">
            {slices.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <CategoryIcon category={s.category} size="sm" />
                <span className="min-w-0 flex-1 truncate">{s.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {Math.round(s.pct * 100)}%
                </span>
              </li>
            ))}
            {slices.length > 5 && (
              <li className="pl-9 text-muted-foreground">
                +{slices.length - 5} mais
              </li>
            )}
          </ul>
        </div>
      )}
    </Card>
  );
}
