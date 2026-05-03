"use client";

import { Card } from "@/components/ui/card";
import { formatRelativeDayLabel } from "@/lib/date";
import { formatBRL } from "@/lib/money";
import type { ReportData } from "@/hooks/use-reports";

interface StatsGridProps {
  stats: ReportData["stats"];
}

interface StatItemProps {
  label: string;
  value: string;
  hint?: string;
}

function StatItem({ label, value, hint }: StatItemProps) {
  return (
    <Card className="p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-lg font-semibold tabular-nums">
        {value}
      </p>
      {hint && (
        <p className="text-[11px] text-muted-foreground truncate">{hint}</p>
      )}
    </Card>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatItem
        label="Média diária"
        value={formatBRL(stats.avgDailyCents)}
        hint="média do mês até hoje"
      />
      <StatItem
        label="Maior gasto único"
        value={formatBRL(stats.biggestSingleCents)}
      />
      <StatItem
        label="Dia mais caro"
        value={
          stats.mostExpensiveDay
            ? formatBRL(stats.mostExpensiveDay.totalCents)
            : "—"
        }
        hint={
          stats.mostExpensiveDay
            ? formatRelativeDayLabel(stats.mostExpensiveDay.day)
            : undefined
        }
      />
      <StatItem label="Total do mês" value={formatBRL(stats.monthCents)} />
    </div>
  );
}
