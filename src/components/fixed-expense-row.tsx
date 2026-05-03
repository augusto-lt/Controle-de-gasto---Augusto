"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/category-icon";
import { Switch } from "@/components/ui/switch";
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

const SWIPE_THRESHOLD = -88;
const ACTION_REVEAL = -72;

/**
 * Linha de assinatura mensal.
 *   - Tap → editar
 *   - Swipe-left → excluir com undo
 *   - Toggle ativo/inativo na lateral (com stopPropagation para não abrir edit)
 *   - Linhas inativas ficam atenuadas (opacity-60) mas continuam interativas
 */
export function FixedExpenseRow({
  expense,
  category,
  onEdit,
}: FixedExpenseRowProps) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [ACTION_REVEAL, 0], [1, 0.4]);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDelete = async () => {
    const snapshot: FixedExpense = { ...expense };
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
  };

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x < SWIPE_THRESHOLD) {
      x.set(-window.innerWidth);
      window.setTimeout(() => void handleDelete(), 180);
    } else {
      x.set(0);
    }
  };

  const onClick = () => {
    if (isDragging) return;
    onEdit(expense);
  };

  const handleToggle = (next: boolean) => {
    void (async () => {
      try {
        await toggleFixedExpense(expense.id, next);
      } catch (err) {
        console.error(err);
        toast.error("Não foi possível alterar");
      }
    })();
  };

  return (
    <div className="relative isolate">
      <motion.div
        aria-hidden
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 -z-10 flex items-center justify-end bg-destructive/15 px-6 text-destructive"
      >
        <Trash2 className="size-5" />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={{ left: 0.2, right: 0 }}
        dragMomentum={false}
        style={{ x }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={onDragEnd}
        className={cn(
          "flex w-full items-center gap-3 bg-background px-4 py-3",
          "border-b border-border last:border-b-0",
          "touch-pan-y",
          !expense.active && "opacity-60",
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className="flex flex-1 items-center gap-3 text-left focus-visible:outline-none"
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

        <Switch
          checked={expense.active}
          onCheckedChange={handleToggle}
          aria-label={
            expense.active ? "Desativar assinatura" : "Ativar assinatura"
          }
          // não dispara o tap-to-edit do botão pai (Switch já é um elemento separado)
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </div>
  );
}
