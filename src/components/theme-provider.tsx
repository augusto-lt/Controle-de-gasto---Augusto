"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Wrapper sobre next-themes com o que faz sentido para este app:
 *   - attribute="class"   → ativa via classe `.dark` no <html>
 *   - defaultTheme="system" → respeita o SO até o usuário escolher
 *   - disableTransitionOnChange → evita flash visual ao alternar
 *   - storageKey próprio → não colide com outros apps
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="controle-gastos:theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
