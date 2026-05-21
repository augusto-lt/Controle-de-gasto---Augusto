"use client";

import * as React from "react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/money-input";
import { useSettings } from "@/hooks/use-settings";
import { setMonthlyIncome } from "@/lib/db";

/**
 * Editor da renda mensal. Quando preenchida (> 0), o dashboard mostra
 * "Saldo restante" automaticamente. Quando 0, exibe só despesas (default).
 */
export function IncomeRow() {
  const settings = useSettings();
  const [draft, setDraft] = React.useState<number | null>(
    settings.monthlyIncomeCents,
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(settings.monthlyIncomeCents);
  }, [settings.monthlyIncomeCents]);

  const commit = async (value: number | null) => {
    const next = value ?? 0;
    if (next === settings.monthlyIncomeCents) return;
    try {
      await setMonthlyIncome(next);
      toast.success("Renda atualizada");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar");
    }
  };

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex-1">
        <p className="text-sm font-medium">Renda mensal</p>
        <p className="text-xs text-muted-foreground">
          Opcional. Habilita o saldo restante no dashboard.
        </p>
      </div>
      <div className="w-36">
        <MoneyInput
          valueCents={draft}
          onChangeCents={setDraft}
          onBlur={() => void commit(draft)}
          aria-label="Renda mensal em reais"
        />
      </div>
    </div>
  );
}
