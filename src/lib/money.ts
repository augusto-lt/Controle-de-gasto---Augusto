/**
 * Helpers monetários — todos os valores internos são armazenados em centavos
 * (number inteiro) para evitar erros de ponto flutuante.
 *
 * Regras:
 *   - "10"      → R$ 10,00 (1000 centavos)
 *   - "10,5"    → R$ 10,50
 *   - "10.50"   → R$ 10,50 (aceita ponto OU vírgula como decimal)
 *   - "1.234,56"→ R$ 1.234,56 (formato pt-BR completo)
 *   - "R$ 9,99" → R$ 9,99 (prefixo opcional)
 */

const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const BRL_NUMBER_FORMATTER = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata centavos como "R$ 1.234,56". */
export function formatBRL(cents: number): string {
  return BRL_FORMATTER.format(fromCents(cents));
}

/** Formata centavos sem o símbolo "R$" — útil em inputs e chips. */
export function formatBRLNumber(cents: number): string {
  return BRL_NUMBER_FORMATTER.format(fromCents(cents));
}

/** Converte centavos (int) para reais (float). Use só na borda de UI. */
export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

/** Converte reais (float) para centavos (int). */
export function toCents(reais: number): number {
  return Math.round(reais * 100);
}

/**
 * Faz parse de uma string digitada pelo usuário e devolve o valor em centavos.
 * Devolve `null` se a entrada não for um número válido.
 *
 * Heurística:
 *   - remove "R$", espaços e caracteres não numéricos (exceto . , -)
 *   - se houver vírgula, ela é o separador decimal e pontos viram milhar
 *   - se houver só ponto e parecer decimal (ex: "10.5", "10.50"), trata como decimal
 *   - se houver só ponto e parecer milhar (ex: "1.000"), trata como milhar
 *   - se for inteiro puro ("10"), assume reais inteiros (R$ 10,00) — NÃO R$ 0,10
 */
export function parseBRL(input: string): number | null {
  if (input == null) return null;

  // remove tudo que não for dígito, ponto, vírgula ou sinal de menos
  const cleaned = String(input)
    .trim()
    .replace(/[^\d.,-]/g, "");

  if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === ",") {
    return null;
  }

  const negative = cleaned.startsWith("-");
  const body = negative ? cleaned.slice(1) : cleaned;

  let normalized: string;

  if (body.includes(",")) {
    // vírgula = decimal pt-BR; pontos viram milhar
    normalized = body.replace(/\./g, "").replace(",", ".");
  } else if (body.includes(".")) {
    const parts = body.split(".");
    const last = parts[parts.length - 1];
    // ponto seguido de 1-2 dígitos no final → decimal (ex: "10.5", "10.50")
    // qualquer outra coisa → separador de milhar (ex: "1.000", "1.234.567")
    if (parts.length === 2 && last.length <= 2) {
      normalized = body;
    } else {
      normalized = body.replace(/\./g, "");
    }
  } else {
    normalized = body;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;

  const cents = toCents(value);
  return negative ? -cents : cents;
}

/**
 * Tenta extrair `{ description, amountCents }` de uma string como "fanta 6,50".
 * Aceita o valor no início ou no fim. Devolve `null` se não houver número.
 */
export function parseQuickInput(
  input: string,
): { description: string; amountCents: number } | null {
  if (!input?.trim()) return null;

  // Tenta valor no fim: "fanta 6,50"
  const endMatch = input.match(/^(.+?)\s+([\d.,-]+)$/);
  if (endMatch) {
    const cents = parseBRL(endMatch[2]);
    if (cents != null) {
      return { description: endMatch[1].trim(), amountCents: cents };
    }
  }

  // Tenta valor no início: "6,50 fanta"
  const startMatch = input.match(/^([\d.,-]+)\s+(.+)$/);
  if (startMatch) {
    const cents = parseBRL(startMatch[1]);
    if (cents != null) {
      return { description: startMatch[2].trim(), amountCents: cents };
    }
  }

  return null;
}
