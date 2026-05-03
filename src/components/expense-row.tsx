"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/category-icon";
import { useSwipeToDelete } from "@/hooks/use-swipe-to-delete";
import {
  addVariableExpense,
  deleteVariableExpense,
} from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { formatTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Category, VariableExpense } from "@/types";

interface ExpenseRowProps {
  expense: VariableExpense;
  category?: Category;
  onEdit: (expense: VariableExpense) => void;
}

/**
 * Linha de gasto.
 *   - Tap (click) → edita
 *   - Swipe-left além do threshold → exclui com toast undo de 5s
 *
 * Implementação leve: pointer events nativos + CSS variable controlando
 * o transform (sem re-render React durante o gesto).
 */
function ExpenseRowImpl({ expense, category, onEdit }: ExpenseRowProps) {
  const handleDelete = React.useCallback(() => {
    const snapshot: VariableExpense = { ...expense };
    void (async () => {
      try {
        await deleteVariableExpense(expense.id);
        toast("Gasto excluído", {
          action: {
            label: "Desfazer",
            onClick: () => {
              void addVariableExpense(snapshot);
            },
          },
          duration: 5000,
        });
      } catch (err) {
        console.error(err);
        toast.error("Não foi possível excluir");
      }
    })();
  }, [expense]);

  const onTap = React.useCallback(() => onEdit(expense), [expense, onEdit]);
  const {
    ref: swipeRef,
    dragHandlers,
    onClick: onRowClick,
  } = useSwipeToDelete({ onTap, onDelete: handleDelete });

  return (
    <div className="relative isolate overflow-hidden">
      {/* fundo "delete" sempre presente, revelado pelo swipe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-end bg-destructive/15 px-6 text-destructive"
      >
        <Trash2 className="size-5" />
      </div>

      <div
        ref={swipeRef}
        {...dragHandlers}
        style={{
          transform: "translateX(var(--swipe-x, 0px))",
          touchAction: "pan-y",
        }}
        className={cn(
          "bg-background transition-transform duration-200",
          "data-[dragging=true]:transition-none",
          "will-change-transform",
        )}
      >
        <button
          type="button"
          onClick={onRowClick}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3 text-left",
            "border-b border-border last:border-b-0",
            "active:bg-accent",
            "focus-visible:outline-none focus-visible:bg-accent",
          )}
        >
          <CategoryIcon category={category} size="md" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{expense.description}</p>
            <p className="truncate text-xs text-muted-foreground">
              {category?.name ?? "Sem categoria"} ·{" "}
              {formatTime(expense.createdAt)}
            </p>
          </div>

          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatBRL(expense.amountCents)}
          </span>
        </button>
      </div>
    </div>
  );
}

export const ExpenseRow = React.memo(
  ExpenseRowImpl,
  (prev, next) =>
    prev.onEdit === next.onEdit &&
    prev.category?.id === next.category?.id &&
    prev.category?.color === next.category?.color &&
    prev.category?.name === next.category?.name &&
    prev.expense.id === next.expense.id &&
    prev.expense.description === next.expense.description &&
    prev.expense.amountCents === next.expense.amountCents &&
    prev.expense.date === next.expense.date &&
    prev.expense.categoryId === next.expense.categoryId &&
    prev.expense.createdAt === next.expense.createdAt,
);
