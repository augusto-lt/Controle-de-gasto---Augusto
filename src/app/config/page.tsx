"use client";

import { DailyGoalRow } from "@/components/config/daily-goal-row";
import { DangerZone } from "@/components/config/danger-zone";
import { DataRow } from "@/components/config/data-row";
import { InstallApp } from "@/components/config/install-app";
import { Section } from "@/components/config/section";
import { ThemeRow } from "@/components/config/theme-row";

export default function ConfigPage() {
  return (
    <div
      className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pb-[calc(5rem+env(safe-area-inset-bottom))]"
    >
      <Section title="Aplicativo">
        <InstallApp />
      </Section>

      <Section title="Preferências">
        <DailyGoalRow />
      </Section>

      <Section title="Aparência">
        <ThemeRow />
      </Section>

      <Section
        title="Dados"
        description="Backup local — nada é enviado para servidor."
      >
        <DataRow />
      </Section>

      <Section title="Zona perigosa">
        <DangerZone />
      </Section>

      <p className="px-1 pt-2 text-center text-[11px] text-muted-foreground">
        Controle de Gastos · v0.1.0 · funciona offline
      </p>
    </div>
  );
}
