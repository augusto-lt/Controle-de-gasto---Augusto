"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  const openNew = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (expense: VariableExpense) => {
    setEditing(expense);
    setSheetOpen(true);
  };

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
          description="Toque no + para registrar seu primeiro gasto. Você pode digitar algo como “fanta 6,50” no campo de descrição."
        />
      ) : (
        <ul
          // padding inferior considera total fixo (h-12) + bottom-nav (h-16)
          // + safe area + folga para o FAB
          className="flex-1 overflow-y-auto pb-[calc(7rem+env(safe-area-inset-bottom))]"
        >
          <AnimatePresence initial={false}>
            {groups.map((group) => (
              <motion.li
                key={group.day}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="sticky top-0 z-10 flex items-center justify-between bg-muted/60 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
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
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Total do mês fixo no rodapé, acima da bottom-nav */}
      <div
        className="fixed inset-x-0 z-20 border-t border-border bg-background/95 backdrop-blur"
        style={{
          bottom: `calc(4rem + env(safe-area-inset-bottom))`,
        }}
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
