"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/": "Início",
  "/fixos": "Fixos",
  "/variaveis": "Variáveis",
  "/relatorios": "Relatórios",
  "/config": "Configurações",
};

function titleFor(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  // fallback: pega o primeiro segmento e capitaliza
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  return seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : "Controle de Gastos";
}

export function AppHeader() {
  const pathname = usePathname();
  const title = titleFor(pathname);
  const isConfig = pathname === "/config";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        "border-b border-border bg-background/95 backdrop-blur",
        "pt-[env(safe-area-inset-top)]",
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        {!isConfig && (
          <Link
            href="/config"
            aria-label="Configurações"
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-md",
              "text-muted-foreground hover:bg-accent hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "transition-colors",
            )}
          >
            <SettingsIcon className="size-5" aria-hidden />
          </Link>
        )}
        {isConfig && (
          <Link
            href="/"
            className={cn(
              "text-sm font-medium text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1",
            )}
          >
            Voltar
          </Link>
        )}
      </div>
    </header>
  );
}
