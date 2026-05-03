"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/category-icon";
import { Switch } from "@/components/ui/switch";
import { useSwipeToDelete } from "@/hooks/use-swipe-to-delete";
import {
  addFixedExpense,
  deleteFixedExpense,
  toggleFixedExpense,
} from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Category, FixedExpense } from "@/types";

interface FixedExpenseRowProps {
  expense: FixedExpense;
  category?: Category;
  onEdit: (expense: FixedExpense) => void;
}

function FixedExpenseRowImpl({
  expense,
  category,
  onEdit,
}: FixedExpenseRowProps) {
  const handleDelete = React.useCallback(() => {
    const snapshot: FixedExpense = { ...expense };
    void (async () => {
      try {
        await deleteFixedExpense(expense.id);
        toast("Assinatura excluída", {
          action: {
            label: "Desfazer",
            onClick: () => {
              void addFixedExpense(snapshot);
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

  const handleToggle = React.useCallback(
    (next: boolean) => {
      void (async () => {
        try {
          await toggleFixedExpense(expense.id, next);
        } catch (err) {
          console.error(err);
          toast.error("Não foi possível alterar");
        }
      })();
    },
    [expense.id],
  );

  // Switch e seu container precisam parar a propagação dos pointer events
  // para que o usuário consiga clicar no toggle sem disparar o swipe.
  const stopPointer: React.PointerEventHandler = (e) => e.stopPropagation();

  return (
    <div className="relative isolate overflow-hidden">
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
          "flex items-center gap-3 bg-background pr-3 transition-transform duration-200",
          "data-[dragging=true]:transition-none",
          "border-b border-border last:border-b-0",
          "will-change-transform",
          !expense.active && "opacity-60",
        )}
      >
        <button
          type="button"
          onClick={onRowClick}
          className={cn(
            "flex flex-1 items-center gap-3 py-3 pl-4 text-left",
            "active:bg-accent focus-visible:bg-accent focus-visible:outline-none",
          )}
        >
          <CategoryIcon category={category} size="md" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{expense.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              Vence dia {expense.dueDay}
              {category ? ` · ${category.name}` : ""}
            </p>
          </div>

          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatBRL(expense.amountCents)}
          </span>
        </button>

        <span
          onPointerDown={stopPointer}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center"
        >
          <Switch
            checked={expense.active}
            onCheckedChange={handleToggle}
            aria-label={
              expense.active ? "Desativar assinatura" : "Ativar assinatura"
            }
          />
        </span>
      </div>
    </div>
  );
}

export const FixedExpenseRow = React.memo(
  FixedExpenseRowImpl,
  (prev, next) =>
    prev.onEdit === next.onEdit &&
    prev.category?.id === next.category?.id &&
    prev.category?.color === next.category?.color &&
    prev.category?.name === next.category?.name &&
    prev.expense.id === next.expense.id &&
    prev.expense.name === next.expense.name &&
    prev.expense.amountCents === next.expense.amountCents &&
    prev.expense.dueDay === next.expense.dueDay &&
    prev.expense.categoryId === next.expense.categoryId &&
    prev.expense.active === next.expense.active,
);
