"use client";

import { memo } from "react";
import {
  Car,
  CupSoda,
  Gamepad2,
  HeartPulse,
  Package,
  Repeat,
  ShoppingCart,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

// Apenas os ícones efetivamente usados pelo seed inicial — manter mínimo
// reduz o bundle. Quando o usuário criar categorias custom no futuro,
// adicionamos um seletor que aponta para mais ícones desta lista.
const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  CupSoda,
  Car,
  Gamepad2,
  HeartPulse,
  ShoppingCart,
  Repeat,
  Package,
};

interface CategoryIconProps {
  category?: Pick<Category, "icon" | "color"> | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES: Record<NonNullable<CategoryIconProps["size"]>, string> = {
  sm: "size-7 [&>svg]:size-4",
  md: "size-9 [&>svg]:size-5",
  lg: "size-12 [&>svg]:size-6",
};

/**
 * Bolinha colorida com o ícone da categoria. Cor de fundo = `category.color`
 * com baixa opacidade; ícone com a cor cheia. Cai num placeholder cinza
 * se a categoria não foi encontrada (ex.: gasto antigo cuja categoria foi
 * deletada).
 */
function CategoryIconImpl({
  category,
  size = "md",
  className,
}: CategoryIconProps) {
  const Icon = (category && ICON_MAP[category.icon]) ?? Package;
  const color = category?.color ?? "#71717a";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        SIZES[size],
        className,
      )}
      style={{
        backgroundColor: `${color}1f`, // ~12% alpha
        color,
      }}
      aria-hidden
    >
      <Icon />
    </span>
  );
}

export const CategoryIcon = memo(CategoryIconImpl);
