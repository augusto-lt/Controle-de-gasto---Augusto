"use client";

import * as React from "react";
import { Download, FileText, Upload } from "lucide-react";
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
import {
  downloadCSV,
  downloadJSON,
  readAndImportJSON,
  type ImportResult,
} from "@/lib/data-transfer";

export function DataRow() {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);

  const handleExportJSON = async () => {
    try {
      await downloadJSON();
      toast.success("Backup JSON gerado");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível exportar");
    }
  };

  const handleExportCSV = async () => {
    try {
      await downloadCSV();
      toast.success("CSV gerado");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível exportar");
    }
  };

  const handleFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) setPending(file);
    e.target.value = ""; // permite reimportar o mesmo arquivo
  };

  const finishImport = async (mode: "replace" | "merge") => {
    if (!pending) return;
    setBusy(true);
    try {
      const result: ImportResult = await readAndImportJSON(pending, mode);
      toast.success("Importação concluída", {
        description: `${result.variableExpenses} gastos · ${result.fixedExpenses} fixos · ${result.categories} categorias`,
      });
      setPending(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha desconhecida";
      toast.error("Importação falhou", { description: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col divide-y divide-border">
      <button
        type="button"
        onClick={() => void handleExportJSON()}
        className="flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50"
      >
        <Download className="size-5 text-muted-foreground" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-medium">Exportar JSON</p>
          <p className="text-xs text-muted-foreground">
            Backup completo (importável de volta)
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => void handleExportCSV()}
        className="flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50"
      >
        <FileText className="size-5 text-muted-foreground" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-medium">Exportar CSV</p>
          <p className="text-xs text-muted-foreground">
            Para abrir no Excel ou Sheets
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50"
      >
        <Upload className="size-5 text-muted-foreground" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-medium">Importar JSON</p>
          <p className="text-xs text-muted-foreground">
            Restaura um backup gerado pelo app
          </p>
        </div>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleFile}
      />

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Como importar?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">
                {pending?.name}
              </span>
              <br />
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                Substituir
              </span>{" "}
              apaga tudo antes da importação.{" "}
              <span className="font-semibold text-foreground">Mesclar</span>{" "}
              mantém o que já existe e sobrescreve por id.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void finishImport("merge")}
            >
              Mesclar
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => void finishImport("replace")}
            >
              Substituir tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
