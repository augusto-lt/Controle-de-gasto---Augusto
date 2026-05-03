/**
 * Seed inicial — categorias padrão + assinaturas mensais.
 *
 * Executado **uma única vez** na primeira abertura do app (controle via
 * flag persistida em `kv`). Idempotente: se o usuário apagar tudo via
 * configurações, o flag também é limpo e o seed roda de novo.
 */

import { db, isSeeded, markSeeded, newId } from "@/lib/db";
import type { Category, FixedExpense } from "@/types";

// IDs estáveis para categorias padrão — facilita migrações e referências
// cruzadas no seed e nas telas (ex.: dashboard pode pintar "Assinaturas"
// com uma cor específica sem precisar resolver pelo nome).
export const CATEGORY_IDS = {
  alimentacao: "cat-alimentacao",
  bebidas: "cat-bebidas",
  transporte: "cat-transporte",
  lazer: "cat-lazer",
  saude: "cat-saude",
  mercado: "cat-mercado",
  assinaturas: "cat-assinaturas",
  outros: "cat-outros",
} as const;

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: CATEGORY_IDS.alimentacao,
    name: "Alimentação",
    icon: "Utensils",
    color: "#f59e0b",
    custom: false,
  },
  {
    id: CATEGORY_IDS.bebidas,
    name: "Bebidas",
    icon: "CupSoda",
    color: "#06b6d4",
    custom: false,
  },
  {
    id: CATEGORY_IDS.transporte,
    name: "Transporte",
    icon: "Car",
    color: "#3b82f6",
    custom: false,
  },
  {
    id: CATEGORY_IDS.lazer,
    name: "Lazer",
    icon: "Gamepad2",
    color: "#a855f7",
    custom: false,
  },
  {
    id: CATEGORY_IDS.saude,
    name: "Saúde",
    icon: "HeartPulse",
    color: "#ef4444",
    custom: false,
  },
  {
    id: CATEGORY_IDS.mercado,
    name: "Mercado",
    icon: "ShoppingCart",
    color: "#22c55e",
    custom: false,
  },
  {
    id: CATEGORY_IDS.assinaturas,
    name: "Assinaturas",
    icon: "Repeat",
    color: "#8b5cf6",
    custom: false,
  },
  {
    id: CATEGORY_IDS.outros,
    name: "Outros",
    icon: "Package",
    color: "#71717a",
    custom: false,
  },
];

interface SeedFixed {
  name: string;
  amountCents: number;
  dueDay: number;
}

// Valores e nomes exatamente como passados pelo Augusto no spec.
// Para CapCut, ChatGPT e Husk App os valores não foram especificados —
// começamos em 0 e ele edita na tela "Fixos" (todos já vêm com toggle ativo).
export const DEFAULT_FIXED: SeedFixed[] = [
  { name: "Plano celular", amountCents: 4499, dueDay: 5 },
  { name: "OneDrive", amountCents: 1200, dueDay: 10 },
  { name: "Mercado Livre", amountCents: 999, dueDay: 15 },
  { name: "YouTube Premium", amountCents: 299, dueDay: 20 },
  { name: "Claude", amountCents: 12400, dueDay: 1 },
  { name: "CapCut", amountCents: 0, dueDay: 1 },
  { name: "ChatGPT", amountCents: 0, dueDay: 1 },
  { name: "Husk App", amountCents: 0, dueDay: 1 },
];

/** Roda o seed se ainda não foi rodado. Devolve `true` se semeou nesta chamada. */
export async function runSeedIfNeeded(): Promise<boolean> {
  if (await isSeeded()) return false;

  await db.transaction(
    "rw",
    [db.categories, db.fixedExpenses, db.kv],
    async () => {
      // categorias: usa put para não duplicar caso o usuário já tenha
      // criado alguma categoria customizada antes do seed (improvável,
      // mas defensivo).
      await db.categories.bulkPut(DEFAULT_CATEGORIES);

      const now = Date.now();
      const fixedRows: FixedExpense[] = DEFAULT_FIXED.map((f, i) => ({
        id: newId(),
        name: f.name,
        amountCents: f.amountCents,
        dueDay: f.dueDay,
        categoryId: CATEGORY_IDS.assinaturas,
        active: true,
        createdAt: now + i, // preserva ordem de inserção
      }));
      await db.fixedExpenses.bulkAdd(fixedRows);

      await markSeeded();
    },
  );

  return true;
}
