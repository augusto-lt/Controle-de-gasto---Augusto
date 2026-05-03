"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Fab } from "@/components/fab";
import { FixedExpenseRow } from "@/components/fixed-expense-row";
import { FixedExpenseSheet } from "@/components/fixed-expense-sheet";
import { useCategoryMap } from "@/hooks/use-categories";
import {
  useFixedExpenses,
  useFixedTotalCents,
} from "@/hooks/use-fixed-expenses";
import { formatBRL } from "@/lib/money";
import type { FixedExpense } from "@/types";

export default function FixosPage() {
  const items = useFixedExpenses();
  const total = useFixedTotalCents();
  const categoryMap = useCategoryMap();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<FixedExpense | null>(null);

  const openNew = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (item: FixedExpense) => {
    setEditing(item);
    setSheetOpen(true);
  };

  const activeCount = items.filter((i) => i.active).length;

  return (
    <div className="flex flex-1 flex-col">
      {/* Card de total no topo */}
      <div className="border-b border-border bg-background px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total mensal ativo
        </p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">
          {formatBRL(total)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
          {activeCount} de {items.length}{" "}
          {items.length === 1 ? "assinatura" : "assinaturas"} ativas
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Nenhuma assinatura cadastrada"
          description="Toque no + para registrar sua primeira assinatura mensal (Spotify, Netflix, plano celular...)."
        />
      ) : (
        <ul
          className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))]"
        >
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FixedExpenseRow
                  expense={item}
                  category={categoryMap.get(item.categoryId)}
                  onEdit={openEdit}
                />
              </motion.li>
            ))}
          </AnimatePresence>
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
