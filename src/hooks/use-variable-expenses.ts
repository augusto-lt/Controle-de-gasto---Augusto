"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import {
  listVariableByDay,
  listVariableByMonth,
  totalVariableDay,
  totalVariableMonth,
} from "@/lib/db";
import type { DayKey, MonthKey } from "@/lib/date";
import type { VariableExpense } from "@/types";

/** Gastos variáveis de um mês inteiro, ordenados do mais recente p/ mais antigo. */
export function useVariableByMonth(monthKey: MonthKey): VariableExpense[] {
  const rows = useLiveQuery(
    () => listVariableByMonth(monthKey),
    [monthKey],
    [],
  );
  return rows ?? [];
}

/** Gastos variáveis de um dia. */
export function useVariableByDay(dayKey: DayKey): VariableExpense[] {
  const rows = useLiveQuery(() => listVariableByDay(dayKey), [dayKey], []);
  return rows ?? [];
}

/** Total mensal de variáveis em centavos. */
export function useVariableMonthTotal(monthKey: MonthKey): number {
  const total = useLiveQuery(
    () => totalVariableMonth(monthKey),
    [monthKey],
    0,
  );
  return total ?? 0;
}

/** Total diário de variáveis em centavos. */
export function useVariableDayTotal(dayKey: DayKey): number {
  const total = useLiveQuery(() => totalVariableDay(dayKey), [dayKey], 0);
  return total ?? 0;
}

/**
 * Agrupa gastos por dia. Devolve [{ day, items, totalCents }] ordenado
 * do dia mais recente para o mais antigo.
 */
export interface DayGroup {
  day: DayKey;
  items: VariableExpense[];
  totalCents: number;
}

export function useVariableByMonthGrouped(monthKey: MonthKey): DayGroup[] {
  const items = useVariableByMonth(monthKey);
  return useMemo(() => {
    const map = new Map<DayKey, VariableExpense[]>();
    for (const item of items) {
      const arr = map.get(item.date) ?? [];
      arr.push(item);
      map.set(item.date, arr);
    }
    return Array.from(map.entries())
      .map(([day, items]) => ({
        day,
        items,
        totalCents: items.reduce((s, i) => s + i.amountCents, 0),
      }))
      .sort((a, b) => (a.day < b.day ? 1 : -1));
  }, [items]);
}
