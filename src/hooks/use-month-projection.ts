"use client";

import { useMemo } from "react";
import { addMonths, subMonths } from "date-fns";
import { useFixedTotalCents } from "@/hooks/use-fixed-expenses";
import { useVariableByMonth } from "@/hooks/use-variable-expenses";
import {
  currentMonthKey,
  fromMonthKey,
  toMonthKey,
  type MonthKey,
} from "@/lib/date";

export interface MonthProjection {
  /** Total previsto para o mês corrente (fixos + variáveis projetadas). */
  projectionTotalCents: number;
  /** Variáveis: realizado + projetado pelo ritmo atual. */
  projectedVariableCents: number;
  /** Média diária real até hoje. */
  avgDailyCents: number;
  /** Dias decorridos no mês até hoje (1..N). */
  daysElapsed: number;
  /** Total de dias do mês. */
  daysInMonth: number;
  /** Total real do mês anterior (variáveis + fixos correntes como aproximação). */
  previousMonthCents: number;
  /** Variação % vs mês anterior (positivo = subiu). `null` se sem dado. */
  deltaPct: number | null;
  /** `true` se faz sentido mostrar projeção (mês corrente + ≥ 2 dias). */
  isProjectable: boolean;
}

/**
 * Calcula projeção do mês baseado no ritmo diário até agora, e compara
 * com o total real do mês anterior.
 *
 * Nota: o componente "fixos" assume os atuais — não temos histórico de
 * snapshots de assinaturas, então previousMonth usa fixedCents corrente.
 * É aproximação suficiente para uso pessoal.
 */
export function useMonthProjection(
  monthKey: MonthKey = currentMonthKey(),
): MonthProjection {
  const fixedCents = useFixedTotalCents();
  const variables = useVariableByMonth(monthKey);
  const previousKey = toMonthKey(subMonths(fromMonthKey(monthKey), 1));
  const previousVariables = useVariableByMonth(previousKey);

  return useMemo(() => {
    const monthDate = fromMonthKey(monthKey);
    const daysInMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
    ).getDate();

    const isCurrentMonth = monthKey === currentMonthKey();
    const today = new Date();
    const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth;

    const variableCents = variables.reduce((s, r) => s + r.amountCents, 0);
    const avgDailyCents =
      daysElapsed > 0 ? Math.round(variableCents / daysElapsed) : 0;

    // Para o mês corrente, projeta o restante pela média; senão, é o total real.
    const projectedVariableCents = isCurrentMonth
      ? Math.round(avgDailyCents * daysInMonth)
      : variableCents;
    const projectionTotalCents = fixedCents + projectedVariableCents;

    const prevVariableCents = previousVariables.reduce(
      (s, r) => s + r.amountCents,
      0,
    );
    // Total do mês anterior usa os fixos atuais como aproximação (não temos
    // histórico de assinaturas). Em quase todos os casos isso é correto.
    const previousMonthCents = fixedCents + prevVariableCents;

    const deltaPct =
      previousMonthCents > 0
        ? ((projectionTotalCents - previousMonthCents) / previousMonthCents) *
          100
        : null;

    // Só faz sentido projetar a partir do 2º dia (1 dia não tem ritmo)
    const isProjectable = isCurrentMonth && daysElapsed >= 2;

    // Evita warning de unused import — addMonths é usado em outros lugares
    void addMonths;

    return {
      projectionTotalCents,
      projectedVariableCents,
      avgDailyCents,
      daysElapsed,
      daysInMonth,
      previousMonthCents,
      deltaPct,
      isProjectable,
    };
  }, [monthKey, fixedCents, variables, previousVariables]);
}
