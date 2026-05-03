"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  formatMonthLabel,
  fromMonthKey,
  toMonthKey,
  type MonthKey,
} from "@/lib/date";

interface MonthSwitcherProps {
  value: MonthKey;
  onChange: (next: MonthKey) => void;
}

export function MonthSwitcher({ value, onChange }: MonthSwitcherProps) {
  const ref = fromMonthKey(value);
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Mês anterior"
        onClick={() => onChange(toMonthKey(subMonths(ref, 1)))}
      >
        <ChevronLeft className="size-5" />
      </Button>
      <p className="flex-1 text-center text-sm font-medium tabular-nums">
        {formatMonthLabel(value)}
      </p>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Próximo mês"
        onClick={() => onChange(toMonthKey(addMonths(ref, 1)))}
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
