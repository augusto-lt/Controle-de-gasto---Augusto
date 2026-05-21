"use client";

import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/money";
import { formatMonthLabel, type MonthKey } from "@/lib/date";
import { cn } from "@/lib/utils";

interface TotalCardProps {
  monthKey: MonthKey;
  totalCents: number;
  fixedCents: number;
  variableCents: number;
  /** Renda mensal — quando > 0, exibe "Sobra/Excedente" em destaque. */
  incomeCents: number;
}

/**
 * Card principal do dashboard.
 *
 * Sem renda configurada → mostra total de despesas em destaque (como antes).
 * Com renda configurada → mostra **Sobra** (positiva) ou **Excedente**
 * (negativo) como número principal, com despesas e renda no breakdown.
 *
 * O cartão é primary (zinc escuro) sempre. Em caso de excedente, troca
 * para destructive para chamar atenção.
 */
export function TotalCard({
  monthKey,
  totalCents,
  fixedCents,
  variableCents,
  incomeCents,
}: TotalCardProps) {
  const hasIncome = incomeCents > 0;
  const balanceCents = incomeCents - totalCents;
  const over = balanceCents < 0;

  return (
    <Card
      className={cn(
        "text-primary-foreground",
        over && hasIncome
          ? "bg-destructive text-white"
          : "bg-primary",
      )}
    >
      <div className="space-y-1 p-5">
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">
          {formatMonthLabel(monthKey)}
        </p>

        {hasIncome ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium uppercase opacity-80">
                {over ? "Excedente" : "Sobra"}
              </span>
            </div>
            <p className="text-4xl font-semibold tabular-nums leading-tight">
              {formatBRL(Math.abs(balanceCents))}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs opacity-90">
              <span className="tabular-nums">
                Renda <strong>{formatBRL(incomeCents)}</strong>
              </span>
              <span className="opacity-50">·</span>
              <span className="tabular-nums">
                Gasto <strong>{formatBRL(totalCents)}</strong>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] opacity-70">
              <span className="tabular-nums">
                Fixos {formatBRL(fixedCents)}
              </span>
              <span className="opacity-50">·</span>
              <span className="tabular-nums">
                Variáveis {formatBRL(variableCents)}
              </span>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </Card>
  );
}
