/**
 * Camada de persistência — IndexedDB via Dexie.
 *
 * Tabelas:
 *   - categories            (id, name, color, icon, custom)
 *   - fixedExpenses         (id, name, amountCents, dueDay, categoryId, active, createdAt)
 *   - variableExpenses      (id, description, amountCents, date, categoryId, createdAt)
 *   - kv                    (key/value para Settings e flags como "seeded")
 *
 * Tudo executa no cliente (sem SSR). Import deste módulo só em components
 * marcados com "use client" ou em hooks chamados a partir deles.
 */

import Dexie, { type Table } from "dexie";
import type {
  Category,
  FixedExpense,
  Settings,
  ThemePreference,
  VariableExpense,
} from "@/types";
import { monthRange, type MonthKey } from "@/lib/date";

interface KvRow {
  key: string;
  value: unknown;
}

class GastosDB extends Dexie {
  categories!: Table<Category, string>;
  fixedExpenses!: Table<FixedExpense, string>;
  variableExpenses!: Table<VariableExpense, string>;
  kv!: Table<KvRow, string>;

  constructor() {
    super("controle-gastos");
    this.version(1).stores({
      categories: "id, name, custom",
      fixedExpenses: "id, name, categoryId, active, dueDay, createdAt",
      // index em [categoryId+date] permite consultas combinadas no futuro
      variableExpenses:
        "id, date, categoryId, createdAt, [date+categoryId]",
      kv: "key",
    });
  }
}

export const db = new GastosDB();

// ---------------------------------------------------------------------------
// IDs
// ---------------------------------------------------------------------------

/** ID curto baseado em timestamp + random — colisão desprezível para 1 usuário. */
export function newId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

// ---------------------------------------------------------------------------
// Settings (via tabela kv)
// ---------------------------------------------------------------------------

const KV_SETTINGS = "settings";
const KV_SEEDED = "seeded:v1";

export const DEFAULT_SETTINGS: Settings = {
  dailyGoalCents: 1000, // R$ 10,00
  theme: "system",
};

export async function getSettings(): Promise<Settings> {
  const row = await db.kv.get(KV_SETTINGS);
  if (!row) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...(row.value as Partial<Settings>) };
}

export async function setSettings(patch: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  const next: Settings = { ...current, ...patch };
  await db.kv.put({ key: KV_SETTINGS, value: next });
}

export async function setDailyGoal(cents: number): Promise<void> {
  await setSettings({ dailyGoalCents: Math.max(0, Math.round(cents)) });
}

export async function setTheme(theme: ThemePreference): Promise<void> {
  await setSettings({ theme });
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function listCategories(): Promise<Category[]> {
  const rows = await db.categories.toArray();
  return rows.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function upsertCategory(category: Category): Promise<void> {
  await db.categories.put(category);
}

export async function deleteCategory(id: string): Promise<void> {
  // mantém histórico — apenas categorias custom podem ser deletadas
  const cat = await db.categories.get(id);
  if (!cat || !cat.custom) return;
  await db.categories.delete(id);
}

// ---------------------------------------------------------------------------
// Fixed expenses (assinaturas mensais)
// ---------------------------------------------------------------------------

export async function listFixedExpenses(): Promise<FixedExpense[]> {
  const rows = await db.fixedExpenses.toArray();
  return rows.sort((a, b) => a.dueDay - b.dueDay);
}

export async function listActiveFixedExpenses(): Promise<FixedExpense[]> {
  const rows = await db.fixedExpenses.where("active").equals(1 as never).toArray();
  // Dexie não indexa boolean nativamente; fallback abaixo:
  if (rows.length === 0) {
    const all = await db.fixedExpenses.toArray();
    return all.filter((r) => r.active).sort((a, b) => a.dueDay - b.dueDay);
  }
  return rows.sort((a, b) => a.dueDay - b.dueDay);
}

export async function totalFixedActiveCents(): Promise<number> {
  const rows = await listActiveFixedExpenses();
  return rows.reduce((sum, r) => sum + r.amountCents, 0);
}

export async function addFixedExpense(
  input: Omit<FixedExpense, "id" | "createdAt"> & Partial<Pick<FixedExpense, "id" | "createdAt">>,
): Promise<FixedExpense> {
  const row: FixedExpense = {
    id: input.id ?? newId(),
    createdAt: input.createdAt ?? Date.now(),
    name: input.name,
    amountCents: input.amountCents,
    dueDay: input.dueDay,
    categoryId: input.categoryId,
    active: input.active,
  };
  await db.fixedExpenses.put(row);
  return row;
}

export async function updateFixedExpense(
  id: string,
  patch: Partial<FixedExpense>,
): Promise<void> {
  await db.fixedExpenses.update(id, patch);
}

export async function deleteFixedExpense(id: string): Promise<void> {
  await db.fixedExpenses.delete(id);
}

export async function toggleFixedExpense(
  id: string,
  active: boolean,
): Promise<void> {
  await db.fixedExpenses.update(id, { active });
}

// ---------------------------------------------------------------------------
// Variable expenses (gastos do dia)
// ---------------------------------------------------------------------------

export async function listVariableByMonth(
  monthKey: MonthKey,
): Promise<VariableExpense[]> {
  const { from, to } = monthRange(monthKey);
  return db.variableExpenses
    .where("date")
    .between(from, to, true, true)
    .reverse()
    .sortBy("createdAt");
}

export async function listVariableByDay(
  dayKey: string,
): Promise<VariableExpense[]> {
  return db.variableExpenses
    .where("date")
    .equals(dayKey)
    .reverse()
    .sortBy("createdAt");
}

export async function totalVariableMonth(monthKey: MonthKey): Promise<number> {
  const rows = await listVariableByMonth(monthKey);
  return rows.reduce((sum, r) => sum + r.amountCents, 0);
}

export async function totalVariableDay(dayKey: string): Promise<number> {
  const rows = await listVariableByDay(dayKey);
  return rows.reduce((sum, r) => sum + r.amountCents, 0);
}

export async function addVariableExpense(
  input: Omit<VariableExpense, "id" | "createdAt"> &
    Partial<Pick<VariableExpense, "id" | "createdAt">>,
): Promise<VariableExpense> {
  const row: VariableExpense = {
    id: input.id ?? newId(),
    createdAt: input.createdAt ?? Date.now(),
    description: input.description,
    amountCents: input.amountCents,
    date: input.date,
    categoryId: input.categoryId,
  };
  await db.variableExpenses.put(row);
  return row;
}

export async function updateVariableExpense(
  id: string,
  patch: Partial<VariableExpense>,
): Promise<void> {
  await db.variableExpenses.update(id, patch);
}

export async function deleteVariableExpense(id: string): Promise<void> {
  await db.variableExpenses.delete(id);
}

// ---------------------------------------------------------------------------
// Bulk: export / import / wipe
// ---------------------------------------------------------------------------

export interface ExportPayload {
  version: 1;
  exportedAt: number;
  categories: Category[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  settings: Settings;
}

export async function exportAll(): Promise<ExportPayload> {
  const [categories, fixedExpenses, variableExpenses, settings] =
    await Promise.all([
      db.categories.toArray(),
      db.fixedExpenses.toArray(),
      db.variableExpenses.toArray(),
      getSettings(),
    ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    categories,
    fixedExpenses,
    variableExpenses,
    settings,
  };
}

export async function importAll(
  payload: ExportPayload,
  mode: "replace" | "merge" = "replace",
): Promise<void> {
  if (payload.version !== 1) {
    throw new Error(`Versão de payload não suportada: ${payload.version}`);
  }
  await db.transaction(
    "rw",
    [db.categories, db.fixedExpenses, db.variableExpenses, db.kv],
    async () => {
      if (mode === "replace") {
        await Promise.all([
          db.categories.clear(),
          db.fixedExpenses.clear(),
          db.variableExpenses.clear(),
        ]);
      }
      await db.categories.bulkPut(payload.categories);
      await db.fixedExpenses.bulkPut(payload.fixedExpenses);
      await db.variableExpenses.bulkPut(payload.variableExpenses);
      await db.kv.put({ key: KV_SETTINGS, value: payload.settings });
    },
  );
}

export async function wipeAll(): Promise<void> {
  await db.transaction(
    "rw",
    [db.categories, db.fixedExpenses, db.variableExpenses, db.kv],
    async () => {
      await Promise.all([
        db.categories.clear(),
        db.fixedExpenses.clear(),
        db.variableExpenses.clear(),
        db.kv.clear(),
      ]);
    },
  );
}

// ---------------------------------------------------------------------------
// Seed flag
// ---------------------------------------------------------------------------

export async function isSeeded(): Promise<boolean> {
  const row = await db.kv.get(KV_SEEDED);
  return Boolean(row?.value);
}

export async function markSeeded(): Promise<void> {
  await db.kv.put({ key: KV_SEEDED, value: true });
}
