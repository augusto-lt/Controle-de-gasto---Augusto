/**
 * Export / import / CSV — utilitários de transferência de dados.
 *
 * Tudo client-side: usa Blob + URL.createObjectURL para gerar downloads
 * e FileReader para ler arquivos importados.
 */

import {
  exportAll,
  importAll,
  type ExportPayload,
} from "@/lib/db";
import { fromCents } from "@/lib/money";
import { format } from "date-fns";
import type { Category } from "@/types";

function timestamp(): string {
  return format(new Date(), "yyyy-MM-dd-HHmm");
}

function triggerDownload(filename: string, data: string, mime: string): void {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // libera o object URL no próximo tick para garantir que o download começou
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

export async function downloadJSON(): Promise<void> {
  const payload = await exportAll();
  const json = JSON.stringify(payload, null, 2);
  triggerDownload(
    `controle-gastos-${timestamp()}.json`,
    json,
    "application/json;charset=utf-8",
  );
}

export interface ImportResult {
  categories: number;
  fixedExpenses: number;
  variableExpenses: number;
}

/**
 * Lê um arquivo JSON exportado pelo próprio app, valida estrutura e
 * persiste. Modo "replace" apaga tudo antes; "merge" sobrescreve por id.
 */
export async function readAndImportJSON(
  file: File,
  mode: "replace" | "merge",
): Promise<ImportResult> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Arquivo inválido: JSON malformado.");
  }
  const payload = parsed as Partial<ExportPayload>;
  if (
    !payload ||
    typeof payload !== "object" ||
    payload.version !== 1 ||
    !Array.isArray(payload.categories) ||
    !Array.isArray(payload.fixedExpenses) ||
    !Array.isArray(payload.variableExpenses) ||
    !payload.settings
  ) {
    throw new Error(
      "Arquivo inválido: não parece um backup do Controle de Gastos.",
    );
  }
  await importAll(payload as ExportPayload, mode);
  return {
    categories: payload.categories.length,
    fixedExpenses: payload.fixedExpenses.length,
    variableExpenses: payload.variableExpenses.length,
  };
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

const CSV_BOM = "﻿"; // garante que Excel BR detecte UTF-8

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[;"\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Formata reais como "9,99" (sem símbolo, separador decimal vírgula). */
function brlForCsv(cents: number): string {
  return fromCents(cents).toFixed(2).replace(".", ",");
}

/**
 * CSV pt-BR: separador `;`, decimal `,`, BOM UTF-8 — abre limpo no Excel BR
 * e no Google Sheets em região Brasil.
 */
export async function downloadCSV(): Promise<void> {
  const payload = await exportAll();
  const catById = new Map<string, Category>(
    payload.categories.map((c) => [c.id, c]),
  );

  const lines: string[] = [];
  lines.push(["Tipo", "Data", "Descrição", "Categoria", "Valor"].join(";"));

  // Variáveis
  for (const v of payload.variableExpenses) {
    lines.push(
      [
        "Variável",
        v.date,
        csvEscape(v.description),
        csvEscape(catById.get(v.categoryId)?.name ?? ""),
        brlForCsv(v.amountCents),
      ].join(";"),
    );
  }

  // Fixos (campo "Data" vira o dia do vencimento como referência)
  for (const f of payload.fixedExpenses) {
    lines.push(
      [
        f.active ? "Fixo" : "Fixo (inativo)",
        `dia ${f.dueDay}`,
        csvEscape(f.name),
        csvEscape(catById.get(f.categoryId)?.name ?? ""),
        brlForCsv(f.amountCents),
      ].join(";"),
    );
  }

  const csv = CSV_BOM + lines.join("\r\n");
  triggerDownload(
    `controle-gastos-${timestamp()}.csv`,
    csv,
    "text/csv;charset=utf-8",
  );
}
