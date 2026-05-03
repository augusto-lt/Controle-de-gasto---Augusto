"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  title: string;
  /** Altura interna em rem (h-40 = 10rem por padrão). */
  heightClass?: string;
}

/**
 * Placeholder leve mostrado enquanto os componentes de gráfico (recharts)
 * carregam de forma assíncrona. Mantém o tamanho final para evitar layout
 * shift ao montar o gráfico real.
 */
export function ChartSkeleton({
  title,
  heightClass = "h-40",
}: ChartSkeletonProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <div className={cn("px-2 pb-2", heightClass)}>
        <div className="h-full w-full animate-pulse rounded-md bg-muted/60" />
      </div>
    </Card>
  );
}
