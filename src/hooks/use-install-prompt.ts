"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Evento `beforeinstallprompt` do Chromium — não tem tipo no DOM lib padrão.
 * https://developer.mozilla.org/docs/Web/API/BeforeInstallPromptEvent
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallPlatform = "android-chromium" | "ios-safari" | "other";

interface InstallState {
  /** Já está rodando como PWA instalado (standalone). */
  isInstalled: boolean;
  /** Plataforma detectada — define qual UI mostrar. */
  platform: InstallPlatform;
  /** Pode chamar `promptInstall()` agora (apenas Chromium). */
  canPrompt: boolean;
  /** Dispara o prompt nativo. Resolve com `true` se o usuário aceitou. */
  promptInstall: () => Promise<boolean>;
}

function detectPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  // iOS / iPadOS Safari (também detecta iPad em modo desktop com touch)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  if (isIOS) return "ios-safari";
  // Chromium-based (Chrome, Edge, Brave, Opera, Samsung Internet…)
  if (/Chrome|Chromium|Edg|OPR|SamsungBrowser/.test(ua))
    return "android-chromium";
  return "other";
}

function detectInstalled(): boolean {
  if (typeof window === "undefined") return false;
  // standalone display-mode = instalado e aberto como app
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS Safari expõe navigator.standalone quando aberto via "Adicionar à Tela"
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function useInstallPrompt(): InstallState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("other");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Hidratação a partir de APIs do browser (não acessíveis em render).
    setPlatform(detectPlatform());
    setIsInstalled(detectInstalled());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferred(null);
    };
    const mql = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayChange = () => setIsInstalled(detectInstalled());

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    mql?.addEventListener?.("change", onDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      mql?.removeEventListener?.("change", onDisplayChange);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const promptInstall = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null); // só pode disparar 1x
    return choice.outcome === "accepted";
  }, [deferred]);

  return {
    isInstalled,
    platform,
    canPrompt: deferred !== null,
    promptInstall,
  };
}
