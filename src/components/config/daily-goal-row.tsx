"use client";

import * as React from "react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/money-input";
import { useSettings } from "@/hooks/use-settings";
import { setDailyGoal } from "@/lib/db";

/**
 * Editor da meta diária. Salva no Dexie no `blur` (não há botão "salvar"
 * — segue a regra de "toda ação persiste imediatamente").
 */
export function DailyGoalRow() {
  const settings = useSettings();
  const [draft, setDraft] = React.useState<number | null>(
    settings.dailyGoalCents,
  );

  // sincroniza quando settings mudar por outro caminho (ex.: import).
  // É um external-sync intencional do Dexie para o estado local do input.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(settings.dailyGoalCents);
  }, [settings.dailyGoalCents]);

  const commit = async (value: number | null) => {
    const next = value ?? 0;
    if (next === settings.dailyGoalCents) return;
    try {
      await setDailyGoal(next);
      toast.success("Meta atualizada");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar");
    }
  };

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex-1">
        <p className="text-sm font-medium">Meta diária</p>
        <p className="text-xs text-muted-foreground">
          Usada para colorir o card no dashboard.
        </p>
      </div>
      <div className="w-32">
        <MoneyInput
          valueCents={draft}
          onChangeCents={setDraft}
          onBlur={() => void commit(draft)}
          aria-label="Meta diária em reais"
        />
      </div>
    </div>
  );
}
