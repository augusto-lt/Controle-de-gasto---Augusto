"use client";

import { useEffect } from "react";
import { runSeedIfNeeded } from "@/lib/seed";

/**
 * Componente invisível que roda na primeira montagem do app:
 *   - garante que o IndexedDB está semeado
 *   - registra o service worker (Serwist gera /sw.js no build)
 */
export function AppBootstrap() {
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const seeded = await runSeedIfNeeded();
        if (!cancelled && seeded) {
          console.info("[bootstrap] seed inicial aplicado");
        }
      } catch (err) {
        console.error("[bootstrap] falha no seed", err);
      }
    })();

    // Registro do service worker (apenas em produção; em dev o Serwist desativa
    // o swSrc para acelerar HMR — registrar aqui geraria 404).
    if (
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          console.error("[bootstrap] falha ao registrar service worker", err);
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
