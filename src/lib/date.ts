/**
 * Helpers de data — locale pt-BR.
 *
 * Convenção:
 *   - chave de dia: string "YYYY-MM-DD" (sortable lexicograficamente)
 *   - chave de mês: string "YYYY-MM"
 *   - quando precisar de Date, sempre construa local (sem UTC) para evitar
 *     o famoso bug "1 dia a menos" no fuso brasileiro.
 */

import {
  endOfDay,
  endOfMonth,
  format,
  parse,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export type DayKey = string; // "YYYY-MM-DD"
export type MonthKey = string; // "YYYY-MM"

const FMT_DAY: DayKey = "yyyy-MM-dd";
const FMT_MONTH: MonthKey = "yyyy-MM";

/** Hoje, no fuso local, normalizado para 00:00. */
export function today(): Date {
  return startOfDay(new Date());
}

/** Converte Date para "YYYY-MM-DD" (local). */
export function toDayKey(date: Date): DayKey {
  return format(date, FMT_DAY);
}

/** Converte "YYYY-MM-DD" para Date local (00:00). */
export function fromDayKey(key: DayKey): Date {
  return parse(key, FMT_DAY, new Date());
}

/** Converte Date para "YYYY-MM" (local). */
export function toMonthKey(date: Date): MonthKey {
  return format(date, FMT_MONTH);
}

/** Converte "YYYY-MM" para Date local apontando para o dia 1, 00:00. */
export function fromMonthKey(key: MonthKey): Date {
  return parse(key, FMT_MONTH, new Date());
}

/** Mês atual em formato "YYYY-MM". */
export function currentMonthKey(): MonthKey {
  return toMonthKey(new Date());
}

/** Dia atual em formato "YYYY-MM-DD". */
export function currentDayKey(): DayKey {
  return toDayKey(new Date());
}

/**
 * Devolve o intervalo `[firstDayKey, lastDayKey]` de um mês.
 * Útil para queries Dexie por range.
 */
export function monthRange(monthKey: MonthKey): { from: DayKey; to: DayKey } {
  const ref = fromMonthKey(monthKey);
  return {
    from: toDayKey(startOfMonth(ref)),
    to: toDayKey(endOfMonth(ref)),
  };
}

/** Devolve as últimas N chaves de dia, da mais antiga para a mais recente. */
export function lastNDays(n: number, ref: Date = new Date()): DayKey[] {
  const base = startOfDay(ref);
  return Array.from({ length: n }, (_, i) =>
    toDayKey(subDays(base, n - 1 - i)),
  );
}

/** Devolve as últimas N chaves de mês, da mais antiga para a mais recente. */
export function lastNMonths(n: number, ref: Date = new Date()): MonthKey[] {
  return Array.from({ length: n }, (_, i) =>
    toMonthKey(subMonths(ref, n - 1 - i)),
  );
}

/** Formata uma data como "ter, 12 de mar". */
export function formatShortDayLabel(date: Date | DayKey): string {
  const d = typeof date === "string" ? fromDayKey(date) : date;
  return format(d, "EEE, d 'de' MMM", { locale: ptBR });
}

/** Formata uma data como "12 de março de 2026". */
export function formatLongDate(date: Date | DayKey): string {
  const d = typeof date === "string" ? fromDayKey(date) : date;
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/** Formata um mês como "Maio 2026" (primeira letra maiúscula). */
export function formatMonthLabel(monthKey: MonthKey): string {
  const d = fromMonthKey(monthKey);
  const raw = format(d, "MMMM yyyy", { locale: ptBR });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Formata uma data como "12/03" — útil em eixos de gráfico. */
export function formatTickShort(date: Date | DayKey): string {
  const d = typeof date === "string" ? fromDayKey(date) : date;
  return format(d, "dd/MM");
}

/**
 * Devolve "Hoje", "Ontem" ou o label curto ("ter, 12 de mar") conforme a
 * proximidade da data. Útil para cabeçalhos de grupo na tela de Variáveis.
 */
export function formatRelativeDayLabel(date: Date | DayKey): string {
  const dayKey = typeof date === "string" ? date : toDayKey(date);
  const today = currentDayKey();
  const yesterday = toDayKey(subDays(new Date(), 1));
  if (dayKey === today) return "Hoje";
  if (dayKey === yesterday) return "Ontem";
  return formatShortDayLabel(dayKey);
}

/** Formata uma hora como "14:32". */
export function formatTime(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return format(d, "HH:mm");
}

export { endOfDay, startOfDay, startOfMonth, endOfMonth };
