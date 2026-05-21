"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { startOfDay, subDays } from "date-fns";
import { db } from "@/lib/db";
import { toDayKey } from "@/lib/date";
import { useSettings } from "@/hooks/use-settings";

export interface GoalStreak {
  /** Dias consecutivos dentro da meta (de ontem para trás). */
  streakDays: number;
  /** Hoje ainda está dentro da meta? Pode ser usado como bonus chip. */
  todayWithinGoal: boolean;
}

const WINDOW_DAYS = 180; // janela suficiente para qualquer streak realista

/**
 * Conta dias consecutivos em que o gasto variável ficou ≤ meta diária.
 *
 * Regras:
 *   - Conta de ONTEM para trás (hoje pode mudar; só fecha após meia-noite).
 *   - Para de contar antes do primeiro gasto registrado — não infla com
 *     dias anteriores ao início do uso do app.
 *   - Dias sem gasto contam como "dentro da meta" (R$ 0 ≤ qualquer meta).
 *   - Se a meta = 0, devolve 0 (não há meta para validar).
 */
export function useGoalStreak(): GoalStreak {
  const settings = useSettings();
  const goal = settings.dailyGoalCents;

  const rows = useLiveQuery(
    async () => {
      if (goal <= 0) return [];
      const from = toDayKey(subDays(new Date(), WINDOW_DAYS));
      const to = toDayKey(new Date());
      return db.variableExpenses
        .where("date")
        .between(from, to, true, true)
        .toArray();
    },
    [goal],
    [],
  );

  return useMemo<GoalStreak>(() => {
    if (goal <= 0 || !rows || rows.length === 0) {
      return { streakDays: 0, todayWithinGoal: true };
    }

    const byDay = new Map<string, number>();
    let earliestRecorded: string | null = null;
    for (const r of rows) {
      byDay.set(r.date, (byDay.get(r.date) ?? 0) + r.amountCents);
      if (!earliestRecorded || r.date < earliestRecorded) {
        earliestRecorded = r.date;
      }
    }

    if (!earliestRecorded) return { streakDays: 0, todayWithinGoal: true };

    const todayKey = toDayKey(new Date());
    const todayTotal = byDay.get(todayKey) ?? 0;
    const todayWithinGoal = todayTotal <= goal;

    const yesterday = subDays(startOfDay(new Date()), 1);
    let streakDays = 0;
    for (let i = 0; i < WINDOW_DAYS; i++) {
      const dayKey = toDayKey(subDays(yesterday, i));
      // Para de contar antes do primeiro dia de uso (evita fake streaks).
      if (dayKey < earliestRecorded) break;
      const total = byDay.get(dayKey) ?? 0;
      if (total > goal) break;
      streakDays++;
    }

    return { streakDays, todayWithinGoal };
  }, [rows, goal]);
}
