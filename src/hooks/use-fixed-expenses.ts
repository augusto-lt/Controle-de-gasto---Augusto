"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db, listFixedExpenses } from "@/lib/db";
import type { FixedExpense } from "@/types";

/** Lista reativa de assinaturas (ordenada por dia de vencimento). */
export function useFixedExpenses(): FixedExpense[] {
  const rows = useLiveQuery(() => listFixedExpenses(), [], []);
  return rows ?? [];
}

/** Apenas as assinaturas ativas. */
export function useActiveFixedExpenses(): FixedExpense[] {
  const all = useFixedExpenses();
  return useMemo(() => all.filter((r) => r.active), [all]);
}

/** Total mensal das assinaturas ativas, em centavos. */
export function useFixedTotalCents(): number {
  const active = useActiveFixedExpenses();
  return useMemo(
    () => active.reduce((sum, r) => sum + r.amountCents, 0),
    [active],
  );
}

/** Versão "raw" — útil para componentes que precisam de loading state. */
export function useFixedExpensesLive() {
  return useLiveQuery(() => db.fixedExpenses.toArray(), []);
}
