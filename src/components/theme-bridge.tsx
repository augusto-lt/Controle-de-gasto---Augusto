"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useSettings } from "@/hooks/use-settings";

/**
 * Mantém next-themes em sincronia com o tema persistido no IndexedDB.
 *
 * Comportamento:
 *   - next-themes é a fonte de verdade em runtime (sem flash, gerencia <html>)
 *   - Settings (Dexie) é a fonte persistente entre dispositivos / export-import
 *   - Quando Settings carrega, este bridge propaga o valor para next-themes
 *
 * Atualizações no sentido oposto (UI → Settings + tema) ficam a cargo da
 * tela de Configurações, que chama `setTheme()` (next-themes) e
 * `setSettings({ theme })` (Dexie) explicitamente.
 */
export function ThemeBridge() {
  const settings = useSettings();
  const { theme: currentTheme, setTheme } = useTheme();

  useEffect(() => {
    if (!settings) return;
    if (settings.theme && settings.theme !== currentTheme) {
      setTheme(settings.theme);
    }
  }, [settings, currentTheme, setTheme]);

  return null;
}
