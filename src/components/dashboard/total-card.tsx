"use client";

import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/money";
import { formatMonthLabel, type MonthKey } from "@/lib/date";

interface TotalCardProps {
  monthKey: MonthKey;
  totalCents: number;
  fixedCents: number;
  variableCents: number;
}

export function TotalCard({
  monthKey,
  totalCents,
  fixedCents,
  variableCents,
}: TotalCardProps) {
  return (
    <Card className="bg-primary text-primary-foreground">
      <div className="space-y-1 p-5">
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">
          {formatMonthLabel(monthKey)}
        </p>
        <p className="text-4xl font-semibold tabular-nums leading-tight">
          {formatBRL(totalCents)}
        </p>
        <div className="flex items-center gap-3 pt-2 text-xs opacity-90">
          <span className="tabular-nums">
            Fixos <strong>{formatBRL(fixedCents)}</strong>
          </span>
          <span className="opacity-50">·</span>
          <span className="tabular-nums">
            Variáveis <strong>{formatBRL(variableCents)}</strong>
          </span>
        </div>
      </div>
    </Card>
  );
}
