"use client";

import { useMemo } from "react";
import {
  currentDayKey,
  currentMonthKey,
  lastNDays,
  type DayKey,
  type MonthKey,
} from "@/lib/date";
import { useFixedTotalCents } from "@/hooks/use-fixed-expenses";
import {
  useVariableByMonth,
  useVariableDayTotal,
} from "@/hooks/use-variable-expenses";
import { useSettings } from "@/hooks/use-settings";

export interface MonthlySummary {
  monthKey: MonthKey;
  /** Total fixo (assinaturas ativas) em centavos. */
  fixedCents: number;
  /** Total variável do mês em centavos. */
  variableCents: number;
  /** Soma de fixos + variáveis. */
  totalCents: number;
  /** Total gasto hoje (variáveis), em centavos. */
  todayCents: number;
  /** Meta diária configurada, em centavos. */
  dailyGoalCents: number;
  /**
   * Status visual da meta:
   *   - "ok"      → ≤ meta
   *   - "warn"    → entre meta e 2× meta
   *   - "danger"  → acima de 2× meta
   */
  goalStatus: "ok" | "warn" | "danger";
  /** Soma por categoria (id → centavos), apenas variáveis. */
  byCategory: Map<string, number>;
  /** Últimos 7 dias [{ day, totalCents }] ordenado do mais antigo p/ recente. */
  last7Days: { day: DayKey; totalCents: number }[];
}

export function useMonthlySummary(
  monthKey: MonthKey = currentMonthKey(),
): MonthlySummary {
  const fixedCents = useFixedTotalCents();
  const variables = useVariableByMonth(monthKey);
  const todayCents = useVariableDayTotal(currentDayKey());
  const settings = useSettings();

  return useMemo(() => {
    const variableCents = variables.reduce((s, r) => s + r.amountCents, 0);

    const byCategory = new Map<string, number>();
    for (const r of variables) {
      byCategory.set(
        r.categoryId,
        (byCategory.get(r.categoryId) ?? 0) + r.amountCents,
      );
    }

    const days = lastNDays(7);
    const dayTotals = new Map<DayKey, number>(days.map((d) => [d, 0]));
    for (const r of variables) {
      if (dayTotals.has(r.date)) {
        dayTotals.set(r.date, (dayTotals.get(r.date) ?? 0) + r.amountCents);
      }
    }
    const last7Days = days.map((day) => ({
      day,
      totalCents: dayTotals.get(day) ?? 0,
    }));

    const goal = settings.dailyGoalCents;
    let goalStatus: MonthlySummary["goalStatus"] = "ok";
    if (goal > 0) {
      if (todayCents > goal * 2) goalStatus = "danger";
      else if (todayCents > goal) goalStatus = "warn";
    }

    return {
      monthKey,
      fixedCents,
      variableCents,
      totalCents: fixedCents + variableCents,
      todayCents,
      dailyGoalCents: goal,
      goalStatus,
      byCategory,
      last7Days,
    };
  }, [monthKey, fixedCents, variables, todayCents, settings.dailyGoalCents]);
}
