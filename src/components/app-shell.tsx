"use client";

import { Toaster } from "sonner";
import { AppBootstrap } from "@/components/app-bootstrap";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { ThemeBridge } from "@/components/theme-bridge";

/**
 * Shell visual do app — cabeçalho fixo, área de conteúdo rolável e
 * navegação inferior. Mounted dentro do ThemeProvider em layout.tsx.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBootstrap />
      <ThemeBridge />

      <div className="flex min-h-dvh flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <BottomNav />
      </div>

      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "font-sans",
          },
        }}
      />
    </>
  );
}
