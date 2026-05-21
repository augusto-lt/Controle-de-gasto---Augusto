"use client";

import { useMemo } from "react";
import {
  useActiveFixedExpenses,
  useFixedTotalCents,
} from "@/hooks/use-fixed-expenses";
import type { FixedExpense } from "@/types";

export interface FixedYearlySummary {
  /** Total mensal ativo (centavos). */
  monthlyCents: number;
  /** Custo anual = mensal × 12. */
  yearlyCents: number;
  /** Assinatura ativa de maior valor (ou null). */
  top: FixedExpense | null;
  /** Custo anual da top (centavos). */
  topYearlyCents: number;
}

/**
 * Sticker shock das assinaturas: visualiza o quanto sai por ano e qual
 * é a maior. Considera apenas assinaturas ativas.
 */
export function useFixedYearly(): FixedYearlySummary {
  const monthlyCents = useFixedTotalCents();
  const active = useActiveFixedExpenses();

  return useMemo(() => {
    const top =
      active.length > 0
        ? active.reduce((max, cur) =>
            cur.amountCents > max.amountCents ? cur : max,
          )
        : null;
    return {
      monthlyCents,
      yearlyCents: monthlyCents * 12,
      top,
      topYearlyCents: top ? top.amountCents * 12 : 0,
    };
  }, [monthlyCents, active]);
}
