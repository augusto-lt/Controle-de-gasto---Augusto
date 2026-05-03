"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CategoryPicker } from "@/components/category-picker";
import { MoneyInput } from "@/components/money-input";
import { useCategories } from "@/hooks/use-categories";
import { useLastCategoryId } from "@/hooks/use-last-category";
import {
  addVariableExpense,
  updateVariableExpense,
} from "@/lib/db";
import { currentDayKey, type DayKey } from "@/lib/date";
import { parseQuickInput } from "@/lib/money";
import type { VariableExpense } from "@/types";

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se passado, modo edição. Caso contrário, modo criação. */
  editing?: VariableExpense | null;
  /** Dia padrão para novos gastos (default: hoje). */
  defaultDay?: DayKey;
}

export function QuickAddSheet({
  open,
  onOpenChange,
  editing,
  defaultDay,
}: QuickAddSheetProps) {
  const categories = useCategories();
  const [lastCategoryId, rememberCategory] = useLastCategoryId();

  const [description, setDescription] = React.useState("");
  const [amountCents, setAmountCents] = React.useState<number | null>(null);
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [day, setDay] = React.useState<DayKey>(currentDayKey());
  const [submitting, setSubmitting] = React.useState(false);
  const descRef = React.useRef<HTMLInputElement>(null);

  // Inicializa estado a cada abertura — é um reset intencional disparado por
  // mudança de prop (open/editing), padrão clássico de modal/sheet controlado.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setDescription(editing.description);
      setAmountCents(editing.amountCents);
      setCategoryId(editing.categoryId);
      setDay(editing.date);
    } else {
      setDescription("");
      setAmountCents(null);
      setCategoryId(lastCategoryId ?? categories[0]?.id ?? null);
      setDay(defaultDay ?? currentDayKey());
    }
    // foco automático no campo de descrição (usa requestAnimationFrame para
    // esperar a animação do sheet)
    const id = window.setTimeout(() => descRef.current?.focus(), 250);
    return () => window.clearTimeout(id);
  }, [open, editing, lastCategoryId, categories, defaultDay]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Parse inteligente: usuário digita "fanta 6,50" → extrai valor automaticamente
  const handleDescriptionBlur = () => {
    if (amountCents != null) return;
    const parsed = parseQuickInput(description);
    if (parsed) {
      setDescription(parsed.description);
      setAmountCents(parsed.amountCents);
    }
  };

  const isValid =
    description.trim().length > 0 &&
    amountCents != null &&
    amountCents > 0 &&
    categoryId != null;

  const submit = async () => {
    if (!isValid || amountCents == null || !categoryId) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateVariableExpense(editing.id, {
          description: description.trim(),
          amountCents,
          categoryId,
          date: day,
        });
        toast.success("Gasto atualizado");
      } else {
        await addVariableExpense({
          description: description.trim(),
          amountCents,
          categoryId,
          date: day,
        });
        rememberCategory(categoryId);
        toast.success("Gasto registrado");
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    void submit();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="flex max-h-[92dvh] flex-col">
        <SheetHeader>
          <SheetTitle>{editing ? "Editar gasto" : "Novo gasto"}</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-2"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="quick-description">Descrição</Label>
            <Input
              id="quick-description"
              ref={descRef}
              value={description}
              placeholder='Ex.: "fanta 6,50"'
              autoComplete="off"
              enterKeyHint="next"
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="quick-amount">Valor</Label>
            <MoneyInput
              id="quick-amount"
              valueCents={amountCents}
              onChangeCents={setAmountCents}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Categoria</Label>
            <CategoryPicker
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="quick-date">Dia</Label>
            <Input
              id="quick-date"
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value || currentDayKey())}
            />
          </div>

          <button type="submit" hidden aria-hidden tabIndex={-1} />
        </form>

        <SheetFooter className="border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={!isValid || submitting}
            onClick={() => void submit()}
          >
            {editing ? "Salvar" : "Adicionar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
