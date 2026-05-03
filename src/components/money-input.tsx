"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatBRLNumber, parseBRL } from "@/lib/money";

interface MoneyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  /** Valor controlado em centavos. Use `null` para "vazio". */
  valueCents: number | null;
  onChangeCents: (cents: number | null) => void;
}

/**
 * Input monetário pt-BR com máscara leve.
 *
 * Comportamento:
 *   - Aceita dígitos, vírgula e ponto enquanto digita (sem reformatar)
 *   - No `blur`, formata como "1.234,56"
 *   - `parseBRL` segue a regra "10" → R$ 10,00
 *   - inputMode="decimal" abre teclado numérico no celular
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  function MoneyInput(
    { valueCents, onChangeCents, className, onBlur, ...props },
    ref,
  ) {
    const [text, setText] = React.useState<string>(() =>
      valueCents == null ? "" : formatBRLNumber(valueCents),
    );

    // sincroniza quando o valor externo muda (ex: parse automático do quick-add)
    React.useEffect(() => {
      const parsed = parseBRL(text);
      if (parsed !== valueCents) {
        setText(valueCents == null ? "" : formatBRLNumber(valueCents));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valueCents]);

    return (
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground"
        >
          R$
        </span>
        <Input
          ref={ref}
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          placeholder="0,00"
          className={cn(
            "pl-10 text-right text-lg font-semibold tabular-nums",
            className,
          )}
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            // permite só dígitos, vírgula, ponto e menos
            const sanitized = raw.replace(/[^\d.,-]/g, "");
            setText(sanitized);
            onChangeCents(parseBRL(sanitized));
          }}
          onBlur={(e) => {
            const cents = parseBRL(text);
            if (cents != null) {
              setText(formatBRLNumber(cents));
            } else if (text === "") {
              onChangeCents(null);
            }
            onBlur?.(e);
          }}
          {...props}
        />
      </div>
    );
  },
);
