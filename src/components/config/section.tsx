"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** Wrapper visual padrão para cada bloco da tela de configurações. */
export function Section({
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("space-y-2", className)}>
      <div className="px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <Card>{children}</Card>
    </section>
  );
}
