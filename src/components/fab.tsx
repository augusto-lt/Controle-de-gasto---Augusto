"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/**
 * Floating Action Button — sempre visível no canto inferior direito,
 * acima da bottom-nav (offset considera safe-area do iOS).
 */
export function Fab({ className, label = "Adicionar", ...props }: FabProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "fixed right-4 z-30 flex size-14 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg",
        "transition-transform active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // posicionado acima da bottom-nav (h-16) + safe-area
        "bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)]",
        className,
      )}
      {...props}
    >
      <Plus className="size-6" aria-hidden />
    </button>
  );
}
