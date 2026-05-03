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
import { Switch } from "@/components/ui/switch";
import { CategoryPicker } from "@/components/category-picker";
import { MoneyInput } from "@/components/money-input";
import { useCategories } from "@/hooks/use-categories";
import { addFixedExpense, updateFixedExpense } from "@/lib/db";
import { CATEGORY_IDS } from "@/lib/seed";
import type { FixedExpense } from "@/types";

interface FixedExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se passado, modo edição. */
  editing?: FixedExpense | null;
}

function clampDay(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(31, Math.round(value)));
}

export function FixedExpenseSheet({
  open,
  onOpenChange,
  editing,
}: FixedExpenseSheetProps) {
  const categories = useCategories();

  const [name, setName] = React.useState("");
  const [amountCents, setAmountCents] = React.useState<number | null>(null);
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [dueDay, setDueDay] = React.useState<number>(1);
  const [active, setActive] = React.useState<boolean>(true);
  const [submitting, setSubmitting] = React.useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);

  // Reset intencional do form quando o sheet abre (padrão de modal controlado).
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setAmountCents(editing.amountCents);
      setCategoryId(editing.categoryId);
      setDueDay(editing.dueDay);
      setActive(editing.active);
    } else {
      setName("");
      setAmountCents(null);
      // padrão: categoria "Assinaturas" se existir, senão a primeira
      const def =
        categories.find((c) => c.id === CATEGORY_IDS.assinaturas)?.id ??
        categories[0]?.id ??
        null;
      setCategoryId(def);
      setDueDay(1);
      setActive(true);
    }
    const id = window.setTimeout(() => nameRef.current?.focus(), 250);
    return () => window.clearTimeout(id);
  }, [open, editing, categories]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isValid =
    name.trim().length > 0 &&
    amountCents != null &&
    amountCents >= 0 &&
    categoryId != null &&
    dueDay >= 1 &&
    dueDay <= 31;

  const submit = async () => {
    if (!isValid || amountCents == null || !categoryId) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateFixedExpense(editing.id, {
          name: name.trim(),
          amountCents,
          categoryId,
          dueDay,
          active,
        });
        toast.success("Assinatura atualizada");
      } else {
        await addFixedExpense({
          name: name.trim(),
          amountCents,
          categoryId,
          dueDay,
          active,
        });
        toast.success("Assinatura adicionada");
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
          <SheetTitle>
            {editing ? "Editar assinatura" : "Nova assinatura"}
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-2"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="fixed-name">Nome</Label>
            <Input
              id="fixed-name"
              ref={nameRef}
              value={name}
              placeholder="Ex.: Spotify"
              autoComplete="off"
              enterKeyHint="next"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="fixed-amount">Valor mensal</Label>
            <MoneyInput
              id="fixed-amount"
              valueCents={amountCents}
              onChangeCents={setAmountCents}
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="fixed-due-day">Dia do vencimento</Label>
              <Input
                id="fixed-due-day"
                type="number"
                inputMode="numeric"
                min={1}
                max={31}
                value={dueDay}
                onChange={(e) => setDueDay(clampDay(Number(e.target.value)))}
                className="text-center text-lg font-semibold tabular-nums"
              />
            </div>

            <label className="flex h-11 items-center gap-2 rounded-md border border-input px-3">
              <span className="text-sm font-medium">Ativa</span>
              <Switch
                checked={active}
                onCheckedChange={setActive}
                aria-label="Assinatura ativa"
              />
            </label>
          </div>

          <div className="grid gap-1.5">
            <Label>Categoria</Label>
            <CategoryPicker
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
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
