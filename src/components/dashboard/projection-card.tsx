"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { MonthProjection } from "@/hooks/use-month-projection";

interface ProjectionCardProps {
  data: MonthProjection;
}

/**
 * Card de projeção: mostra para onde o mês está indo se o ritmo atual
 * continuar, e compara com o total real do mês anterior.
 *
 * Cores: vermelho se vai gastar mais que mês passado, verde se menos.
 */
export function ProjectionCard({ data }: ProjectionCardProps) {
  if (!data.isProjectable) return null;

  const showComparison =
    data.deltaPct != null && Math.abs(data.deltaPct) >= 1;
  const trendUp = (data.deltaPct ?? 0) > 0;
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm">Projeção do mês</CardTitle>
      </CardHeader>
      <div className="space-y-1 px-4 pb-4">
        <p className="text-2xl font-semibold tabular-nums">
          {formatBRL(data.projectionTotalCents)}
        </p>
        <p className="text-xs text-muted-foreground">
          Mantendo a média de{" "}
          <strong className="font-semibold text-foreground tabular-nums">
            {formatBRL(data.avgDailyCents)}/dia
          </strong>{" "}
          ({data.daysElapsed} de {data.daysInMonth} dias)
        </p>

        {showComparison && (
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs">
            <TrendIcon
              className={cn(
                "size-4",
                trendUp
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
              aria-hidden
            />
            <span className="text-muted-foreground">
              Mês passado:{" "}
              <span className="text-foreground tabular-nums">
                {formatBRL(data.previousMonthCents)}
              </span>{" "}
              ·{" "}
              <span
                className={cn(
                  "font-medium tabular-nums",
                  trendUp
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-emerald-700 dark:text-emerald-400",
                )}
              >
                {trendUp ? "↑" : "↓"} {Math.abs(Math.round(data.deltaPct!))}%
              </span>
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
