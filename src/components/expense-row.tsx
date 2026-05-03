"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/category-icon";
import { cn } from "@/lib/utils";
import {
  addVariableExpense,
  deleteVariableExpense,
} from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { formatTime } from "@/lib/date";
import type { Category, VariableExpense } from "@/types";

interface ExpenseRowProps {
  expense: VariableExpense;
  category?: Category;
  onEdit: (expense: VariableExpense) => void;
}

const SWIPE_THRESHOLD = -88; // px que precisa arrastar para acionar exclusão
const ACTION_REVEAL = -72; // px de revelação do botão delete sem soltar

/**
 * Linha de gasto.
 *   - Tap (click) → edita (abre QuickAddSheet em modo edição)
 *   - Swipe-left até `SWIPE_THRESHOLD` → exclui com toast undo de 5s
 *   - Botão de lixeira fica revelado durante o swipe (affordance visual)
 *   - Em desktop, o swipe pode não funcionar bem; o tap continua editando.
 *     (Um menu de pontinhos pode ser adicionado depois se necessário.)
 */
export function ExpenseRow({ expense, category, onEdit }: ExpenseRowProps) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [ACTION_REVEAL, 0], [1, 0.4]);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDelete = async () => {
    const snapshot: VariableExpense = { ...expense };
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
  };

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x < SWIPE_THRESHOLD) {
      // anima até a esquerda e dispara exclusão
      x.set(-window.innerWidth);
      window.setTimeout(() => void handleDelete(), 180);
    } else {
      x.set(0);
    }
  };

  const onClick = () => {
    if (isDragging) return; // evita disparar edição ao soltar swipe
    onEdit(expense);
  };

  return (
    <div className="relative isolate">
      {/* fundo "delete" revelado pelo swipe */}
      <motion.div
        aria-hidden
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 -z-10 flex items-center justify-end bg-destructive/15 px-6 text-destructive"
      >
        <Trash2 className="size-5" />
      </motion.div>

      <motion.button
        type="button"
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={{ left: 0.2, right: 0 }}
        dragMomentum={false}
        style={{ x }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={onDragEnd}
        onClick={onClick}
        whileTap={{ backgroundColor: "var(--accent)" }}
        className={cn(
          "flex w-full items-center gap-3 bg-background px-4 py-3 text-left",
          "border-b border-border last:border-b-0",
          "focus-visible:outline-none focus-visible:bg-accent",
          "touch-pan-y", // permite scroll vertical, captura horizontal
        )}
      >
        <CategoryIcon category={category} size="md" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{expense.description}</p>
          <p className="truncate text-xs text-muted-foreground">
            {category?.name ?? "Sem categoria"} · {formatTime(expense.createdAt)}
          </p>
        </div>

        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {formatBRL(expense.amountCents)}
        </span>
      </motion.button>
    </div>
  );
}
