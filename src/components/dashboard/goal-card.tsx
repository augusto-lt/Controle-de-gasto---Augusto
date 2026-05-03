"use client";

import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  todayCents: number;
  goalCents: number;
  status: "ok" | "warn" | "danger";
}

const STATUS_BG: Record<GoalCardProps["status"], string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  danger: "bg-rose-500",
};

const STATUS_TEXT: Record<GoalCardProps["status"], string> = {
  ok: "text-emerald-700 dark:text-emerald-400",
  warn: "text-amber-700 dark:text-amber-400",
  danger: "text-rose-700 dark:text-rose-400",
};

const STATUS_LABEL: Record<GoalCardProps["status"], string> = {
  ok: "Dentro da meta",
  warn: "Acima da meta",
  danger: "Muito acima da meta",
};

export function GoalCard({ todayCents, goalCents, status }: GoalCardProps) {
  const ratio = goalCents > 0 ? todayCents / goalCents : 0;
  const widthPct = Math.min(100, ratio * 100);
  const overPct = ratio > 1 ? Math.round(ratio * 100) : null;

  return (
    <Card>
      <div className="space-y-3 p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Hoje
          </p>
          <p className={cn("text-xs font-medium", STATUS_TEXT[status])}>
            {STATUS_LABEL[status]}
            {overPct != null && ` · ${overPct}%`}
          </p>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <p className="text-3xl font-semibold tabular-nums leading-tight">
            {formatBRL(todayCents)}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            de {formatBRL(goalCents)}
          </p>
        </div>

        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(widthPct)}
          aria-label="Progresso da meta diária"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500",
              STATUS_BG[status],
            )}
            style={{ width: `${widthPct}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
