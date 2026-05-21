// Domain types — valores em centavos (number) para evitar erros de float.

export type ID = string;

export interface Category {
  id: ID;
  name: string;
  icon: string; // nome de ícone do lucide-react
  color: string; // hex
  custom: boolean;
}

export interface FixedExpense {
  id: ID;
  name: string;
  amountCents: number;
  dueDay: number; // 1-31
  categoryId: ID;
  active: boolean;
  createdAt: number;
}

export interface VariableExpense {
  id: ID;
  description: string;
  amountCents: number;
  date: string; // 'YYYY-MM-DD'
  categoryId: ID;
  createdAt: number;
}

export type ThemePreference = "light" | "dark" | "system";

export interface Settings {
  dailyGoalCents: number;
  /** Renda mensal — quando > 0, dashboard mostra saldo restante do mês. */
  monthlyIncomeCents: number;
  theme: ThemePreference;
}
