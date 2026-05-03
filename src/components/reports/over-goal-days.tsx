"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDayLabel } from "@/lib/date";
import { formatBRL } from "@/lib/money";
import type { OverGoalDay } from "@/hooks/use-reports";

interface OverGoalDaysProps {
  days: OverGoalDay[];
  goalCents: number;
}

export function OverGoalDays({ days, goalCents }: OverGoalDaysProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="size-4 text-rose-500" />
          Dias acima da meta ({formatBRL(goalCents)})
        </CardTitle>
      </CardHeader>

      {days.length === 0 ? (
        <div className="flex h-24 items-center justify-center px-4 pb-4 text-center text-xs text-muted-foreground">
          {goalCents === 0
            ? "Defina uma meta diária nas configurações."
            : "Nenhum dia ultrapassou a meta neste mês 🎉"}
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {days.map((d) => (
            <li
              key={d.day}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {formatRelativeDayLabel(d.day)}
                </p>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {Math.round(d.ratio * 100)}% da meta
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {formatBRL(d.totalCents)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
