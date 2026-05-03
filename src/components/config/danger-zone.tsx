"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { wipeAll } from "@/lib/db";
import { runSeedIfNeeded } from "@/lib/seed";

const CONFIRM_PHRASE = "APAGAR";

/**
 * Apagar tudo com dupla confirmação:
 *   1. Tap no botão "Apagar tudo" abre o dialog
 *   2. Usuário precisa digitar "APAGAR" exatamente para liberar o botão final
 *
 * Após apagar, dispara `runSeedIfNeeded` — como `wipeAll` limpa a flag,
 * o seed roda de novo e o app volta ao estado inicial em vez de ficar vazio.
 */
export function DangerZone() {
  const [open, setOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const canConfirm = confirmText.trim() === CONFIRM_PHRASE && !busy;

  const reset = () => {
    setOpen(false);
    setConfirmText("");
  };

  const handleWipe = async () => {
    if (!canConfirm) return;
    setBusy(true);
    try {
      await wipeAll();
      await runSeedIfNeeded();
      toast.success("Tudo apagado", {
        description: "Os dados padrão foram restaurados.",
      });
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível apagar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-destructive/10"
      >
        <Trash2 className="size-5 text-rose-500" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
            Apagar tudo
          </p>
          <p className="text-xs text-muted-foreground">
            Remove gastos, assinaturas e categorias custom
          </p>
        </div>
      </button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : reset())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar todos os dados?</DialogTitle>
            <DialogDescription>
              Esta ação{" "}
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                não pode ser desfeita
              </span>
              . As assinaturas padrão serão recriadas automaticamente.
              <br />
              Para confirmar, digite{" "}
              <span className="font-mono font-bold text-foreground">
                {CONFIRM_PHRASE}
              </span>{" "}
              abaixo:
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder={CONFIRM_PHRASE}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-center text-base font-mono font-semibold tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
          />
          <DialogFooter>
            <Button variant="outline" onClick={reset} disabled={busy}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!canConfirm}
              onClick={() => void handleWipe()}
            >
              {busy ? "Apagando..." : "Apagar tudo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
