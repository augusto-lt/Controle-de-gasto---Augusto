"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "@/lib/db";
import {
  currentMonthKey,
  formatMonthLabel,
  fromMonthKey,
  lastNMonths,
  monthRange,
  toDayKey,
  toMonthKey,
  type DayKey,
  type MonthKey,
} from "@/lib/date";
import { startOfMonth } from "date-fns";
import { useSettings } from "@/hooks/use-settings";
import type { VariableExpense } from "@/types";

export interface MonthSeriesPoint {
  monthKey: MonthKey;
  label: string; // ex: "Mai/26"
  totalCents: number;
}

export interface OverGoalDay {
  day: DayKey;
  totalCents: number;
  ratio: number; // total / meta
}

export interface CategoryTotal {
  categoryId: string;
  totalCents: number;
}

export interface ReportData {
  /** Série dos últimos 6 meses (do mais antigo ao atual). */
  sixMonths: MonthSeriesPoint[];
  /** Soma por categoria do mês atual, ordenada DESC. */
  topCategories: CategoryTotal[];
  /** Dias do mês atual que ultrapassaram a meta diária (DESC por valor). */
  overGoalDays: OverGoalDay[];
  /** Estatísticas resumidas do mês atual. */
  stats: {
    /** Total variável do mês atual. */
    monthCents: number;
    /** Total / dias decorridos no mês (até hoje). */
    avgDailyCents: number;
    /** Maior gasto único individual no mês. */
    biggestSingleCents: number;
    /** Dia com maior gasto agregado no mês (chave + total). */
    mostExpensiveDay: { day: DayKey; totalCents: number } | null;
  };
}

const EMPTY: ReportData = {
  sixMonths: [],
  topCategories: [],
  overGoalDays: [],
  stats: {
    monthCents: 0,
    avgDailyCents: 0,
    biggestSingleCents: 0,
    mostExpensiveDay: null,
  },
};

/** Label curto pra eixo do gráfico: "mai/26". */
function shortMonthLabel(monthKey: MonthKey): string {
  // formatMonthLabel devolve "Maio 2026"; queremos "mai/26"
  const [y, m] = monthKey.split("-");
  const monthNames = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];
  const idx = Math.max(0, Math.min(11, Number(m) - 1));
  return `${monthNames[idx]}/${y.slice(-2)}`;
}

/**
 * Busca todos os gastos variáveis dos últimos 6 meses em UMA query e calcula
 * tudo em memória — mais barato que disparar várias subscrições.
 */
export function useReports(): ReportData {
  const settings = useSettings();
  const monthsBack = 6;

  const data = useLiveQuery(
    async () => {
      const months = lastNMonths(monthsBack);
      const start = toDayKey(startOfMonth(fromMonthKey(months[0])));
      const { to: end } = monthRange(currentMonthKey());

      const rows: VariableExpense[] = await db.variableExpenses
        .where("date")
        .between(start, end, true, true)
        .toArray();

      return rows;
    },
    [monthsBack],
    [] as VariableExpense[],
  );

  return useMemo(() => {
    if (!data) return EMPTY;

    const months = lastNMonths(monthsBack);
    const currentMonth = currentMonthKey();
    const goal = settings.dailyGoalCents;

    // Série mensal
    const monthTotals = new Map<MonthKey, number>(months.map((m) => [m, 0]));
    for (const r of data) {
      const m = toMonthKey(new Date(`${r.date}T00:00:00`));
      if (monthTotals.has(m)) {
        monthTotals.set(m, (monthTotals.get(m) ?? 0) + r.amountCents);
      }
    }
    const sixMonths: MonthSeriesPoint[] = months.map((m) => ({
      monthKey: m,
      label: shortMonthLabel(m),
      totalCents: monthTotals.get(m) ?? 0,
    }));

    // Filtra só o mês atual para os outros agregados
    const thisMonth = data.filter(
      (r) => toMonthKey(new Date(`${r.date}T00:00:00`)) === currentMonth,
    );

    // Por categoria
    const byCat = new Map<string, number>();
    for (const r of thisMonth) {
      byCat.set(r.categoryId, (byCat.get(r.categoryId) ?? 0) + r.amountCents);
    }
    const topCategories: CategoryTotal[] = Array.from(byCat.entries())
      .map(([categoryId, totalCents]) => ({ categoryId, totalCents }))
      .sort((a, b) => b.totalCents - a.totalCents);

    // Por dia
    const byDay = new Map<DayKey, number>();
    let biggestSingle = 0;
    for (const r of thisMonth) {
      byDay.set(r.date, (byDay.get(r.date) ?? 0) + r.amountCents);
      if (r.amountCents > biggestSingle) biggestSingle = r.amountCents;
    }

    // Dias que estouraram a meta
    const overGoalDays: OverGoalDay[] =
      goal > 0
        ? Array.from(byDay.entries())
            .filter(([, total]) => total > goal)
            .map(([day, total]) => ({
              day,
              totalCents: total,
              ratio: total / goal,
            }))
            .sort((a, b) => b.totalCents - a.totalCents)
        : [];

    // Dia mais caro
    let mostExpensiveDay: ReportData["stats"]["mostExpensiveDay"] = null;
    for (const [day, total] of byDay.entries()) {
      if (!mostExpensiveDay || total > mostExpensiveDay.totalCents) {
        mostExpensiveDay = { day, totalCents: total };
      }
    }

    // Média diária = total / dias decorridos no mês até hoje
    const monthCents = thisMonth.reduce((s, r) => s + r.amountCents, 0);
    const today = new Date();
    const isCurrentMonth = toMonthKey(today) === currentMonth;
    const daysElapsed = isCurrentMonth
      ? today.getDate()
      : new Date(
          today.getFullYear(),
          Number(currentMonth.split("-")[1]),
          0,
        ).getDate();
    const avgDailyCents =
      daysElapsed > 0 ? Math.round(monthCents / daysElapsed) : 0;

    return {
      sixMonths,
      topCategories,
      overGoalDays,
      stats: {
        monthCents,
        avgDailyCents,
        biggestSingleCents: biggestSingle,
        mostExpensiveDay,
      },
    };
  }, [data, settings.dailyGoalCents]);
}

export { formatMonthLabel };
