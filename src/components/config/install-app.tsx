"use client";

import { CheckCircle2, Download, Share, SquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

/**
 * Bloco da tela de Configurações que instala o app:
 *   - Já instalado            → mostra confirmação
 *   - Chromium (Android/desk) → botão que dispara o prompt nativo
 *   - iOS Safari              → instruções passo a passo
 *   - Outros                  → orienta abrir em Chrome/Safari
 */
export function InstallApp() {
  const { isInstalled, platform, canPrompt, promptInstall } =
    useInstallPrompt();

  if (isInstalled) {
    return (
      <div className="flex items-center gap-3 p-4">
        <CheckCircle2 className="size-5 text-emerald-500" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-medium">Instalado como app</p>
          <p className="text-xs text-muted-foreground">
            Você está abrindo direto da tela inicial.
          </p>
        </div>
      </div>
    );
  }

  if (platform === "android-chromium") {
    return (
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Download className="size-5 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">Instalar como app</p>
            <p className="text-xs text-muted-foreground">
              Abre direto da tela inicial e funciona offline.
            </p>
          </div>
        </div>
        <Button
          size="lg"
          className="w-full"
          disabled={!canPrompt}
          onClick={async () => {
            const ok = await promptInstall();
            if (ok) toast.success("App instalado");
          }}
        >
          <Download className="size-4" aria-hidden />
          {canPrompt ? "Instalar agora" : "Instalação não disponível"}
        </Button>
        {!canPrompt && (
          <p className="text-[11px] text-muted-foreground">
            O navegador ainda não liberou o prompt. Tente recarregar a página
            ou usar o menu do navegador (⋮ → &quot;Instalar aplicativo&quot;).
          </p>
        )}
      </div>
    );
  }

  if (platform === "ios-safari") {
    return (
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Download className="size-5 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">Instalar como app</p>
            <p className="text-xs text-muted-foreground">
              No iPhone/iPad, faça pelo Safari:
            </p>
          </div>
        </div>
        <ol className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              1
            </span>
            <span className="flex items-center gap-1.5">
              Toque em
              <Share
                className="size-4 text-muted-foreground"
                aria-label="Compartilhar"
              />
              <strong>Compartilhar</strong>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              2
            </span>
            <span className="flex items-center gap-1.5">
              Escolha
              <SquarePlus
                className="size-4 text-muted-foreground"
                aria-hidden
              />
              <strong>Adicionar à Tela de Início</strong>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              3
            </span>
            <span>
              Toque em <strong>Adicionar</strong> no canto superior direito
            </span>
          </li>
        </ol>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4">
      <Download className="size-5 text-muted-foreground" aria-hidden />
      <div className="flex-1">
        <p className="text-sm font-medium">Instalar como app</p>
        <p className="text-xs text-muted-foreground">
          Abra esta página no Chrome/Edge (Android ou desktop) ou no Safari
          (iPhone/iPad) para ver a opção de instalação.
        </p>
      </div>
    </div>
  );
}
