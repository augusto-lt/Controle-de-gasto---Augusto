import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { Serwist, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Estratégia rápida para navegação: SWR.
 *   - Devolve a página do cache imediatamente (instantâneo)
 *   - Atualiza em background — próxima visita pega o novo HTML
 *
 * Substitui a estratégia padrão do Serwist (`NetworkFirst` com timeout 10s)
 * que faz a UI parecer travada em redes ruins enquanto espera o network.
 */
const navigationStrategy: RuntimeCaching = {
  matcher: ({ request }) => request.mode === "navigate",
  handler: new StaleWhileRevalidate({
    cacheName: "pages",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // A nossa entrada de navegação vem ANTES do defaultCache para ter prioridade.
  runtimeCaching: [navigationStrategy, ...defaultCache],
});

serwist.addEventListeners();
