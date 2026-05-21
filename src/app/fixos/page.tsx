"use client";

import { useCallback, useState } from "react";
import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Fab } from "@/components/fab";
import { FixedExpenseRow } from "@/components/fixed-expense-row";
import { FixedExpenseSheet } from "@/components/fixed-expense-sheet";
import { useCategoryMap } from "@/hooks/use-categories";
import { useFixedExpenses } from "@/hooks/use-fixed-expenses";
import { useFixedYearly } from "@/hooks/use-fixed-yearly";
import { formatBRL } from "@/lib/money";
import type { FixedExpense } from "@/types";

export default function FixosPage() {
  const items = useFixedExpenses();
  const yearly = useFixedYearly();
  const categoryMap = useCategoryMap();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<FixedExpense | null>(null);

  const openNew = useCallback(() => {
    setEditing(null);
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback((item: FixedExpense) => {
    setEditing(item);
    setSheetOpen(true);
  }, []);

  const activeCount = items.filter((i) => i.active).length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-background px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total mensal ativo
        </p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">
          {formatBRL(yearly.monthlyCents)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
          ≈ {formatBRL(yearly.yearlyCents)} por ano · {activeCount} de{" "}
          {items.length}{" "}
          {items.length === 1 ? "assinatura" : "assinaturas"} ativas
        </p>
        {yearly.top && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Maior:{" "}
            <strong className="text-foreground">{yearly.top.name}</strong> —{" "}
            <span className="tabular-nums">
              {formatBRL(yearly.topYearlyCents)}/ano
            </span>
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Nenhuma assinatura cadastrada"
          description="Toque no + para registrar sua primeira assinatura mensal (Spotify, Netflix, plano celular...)."
        />
      ) : (
        <ul className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))]">
          {items.map((item) => (
            <li key={item.id}>
              <FixedExpenseRow
                expense={item}
                category={categoryMap.get(item.categoryId)}
                onEdit={openEdit}
              />
            </li>
          ))}
        </ul>
      )}

      <Fab onClick={openNew} aria-label="Nova assinatura" />

      <FixedExpenseSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
      />
    </div>
  );
}
