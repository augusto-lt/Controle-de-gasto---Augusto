"use client";

import { useCallback, useState } from "react";
import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ExpenseRow } from "@/components/expense-row";
import { Fab } from "@/components/fab";
import { MonthSwitcher } from "@/components/month-switcher";
import { QuickAddSheet } from "@/components/quick-add-sheet";
import { useCategoryMap } from "@/hooks/use-categories";
import {
  useVariableByMonthGrouped,
  useVariableMonthTotal,
} from "@/hooks/use-variable-expenses";
import {
  currentMonthKey,
  formatRelativeDayLabel,
  type MonthKey,
} from "@/lib/date";
import { formatBRL } from "@/lib/money";
import type { VariableExpense } from "@/types";

export default function VariaveisPage() {
  const [monthKey, setMonthKey] = useState<MonthKey>(currentMonthKey());
  const groups = useVariableByMonthGrouped(monthKey);
  const monthTotal = useVariableMonthTotal(monthKey);
  const categoryMap = useCategoryMap();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<VariableExpense | null>(null);

  const openNew = useCallback(() => {
    setEditing(null);
    setSheetOpen(true);
  }, []);

  // Identidade estável para evitar re-render dos rows memoizados.
  const openEdit = useCallback((expense: VariableExpense) => {
    setEditing(expense);
    setSheetOpen(true);
  }, []);

  const isEmpty = groups.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-background px-4 py-3">
        <MonthSwitcher value={monthKey} onChange={setMonthKey} />
      </div>

      {isEmpty ? (
        <EmptyState
          icon={Receipt}
          title="Nenhum gasto neste mês"
          description={
            "Toque no + para registrar seu primeiro gasto. Você pode digitar algo como “fanta 6,50” no campo de descrição."
          }
        />
      ) : (
        <ul className="flex-1 overflow-y-auto pb-[calc(7rem+env(safe-area-inset-bottom))]">
          {groups.map((group) => (
            <li key={group.day}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-muted px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <span>{formatRelativeDayLabel(group.day)}</span>
                <span className="tabular-nums">
                  {formatBRL(group.totalCents)}
                </span>
              </div>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <ExpenseRow
                      expense={item}
                      category={categoryMap.get(item.categoryId)}
                      onEdit={openEdit}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {/* Total do mês fixo no rodapé, acima da bottom-nav */}
      <div
        className="fixed inset-x-0 z-20 border-t border-border bg-background"
        style={{ bottom: `calc(4rem + env(safe-area-inset-bottom))` }}
      >
        <div className="flex h-12 items-center justify-between px-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total do mês
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatBRL(monthTotal)}
          </span>
        </div>
      </div>

      <Fab onClick={openNew} aria-label="Adicionar gasto" />

      <QuickAddSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
      />
    </div>
  );
}
