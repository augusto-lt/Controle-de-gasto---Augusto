"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { setTheme as persistTheme } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import type { ThemePreference } from "@/types";

interface Option {
  value: ThemePreference;
  label: string;
  icon: LucideIcon;
}

const OPTIONS: Option[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function ThemeRow() {
  const settings = useSettings();
  const { setTheme } = useTheme();

  const change = async (next: ThemePreference) => {
    setTheme(next); // imediato no DOM
    try {
      await persistTheme(next); // persiste no Dexie
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar a preferência");
    }
  };

  return (
    <div className="space-y-3 p-4">
      <p className="text-sm font-medium">Tema</p>
      <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = settings.theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => void change(opt.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "active:scale-[0.97]",
                selected
                  ? "border-foreground bg-accent"
                  : "border-border bg-background hover:bg-accent/50",
              )}
            >
              <Icon className="size-5" aria-hidden />
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
