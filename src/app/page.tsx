"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/dashboard/chart-skeleton";
import { GoalCard } from "@/components/dashboard/goal-card";
import { ProjectionCard } from "@/components/dashboard/projection-card";
import { TotalCard } from "@/components/dashboard/total-card";
import { Fab } from "@/components/fab";
import { QuickAddSheet } from "@/components/quick-add-sheet";
import { useCategoryMap } from "@/hooks/use-categories";
import { useGoalStreak } from "@/hooks/use-goal-streak";
import { useMonthlySummary } from "@/hooks/use-monthly-summary";
import { useMonthProjection } from "@/hooks/use-month-projection";
import { useSettings } from "@/hooks/use-settings";

// Recharts é pesado (~100kb gz) — carrega só quando o dashboard monta.
const Last7DaysBar = dynamic(
  () =>
    import("@/components/dashboard/last-7-days-bar").then((m) => ({
      default: m.Last7DaysBar,
    })),
  { ssr: false, loading: () => <ChartSkeleton title="Últimos 7 dias" /> },
);

const CategoryDonut = dynamic(
  () =>
    import("@/components/dashboard/category-donut").then((m) => ({
      default: m.CategoryDonut,
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="Por categoria" heightClass="h-36" />,
  },
);

export default function HomePage() {
  const summary = useMonthlySummary();
  const projection = useMonthProjection();
  const { streakDays } = useGoalStreak();
  const settings = useSettings();
  const categoryMap = useCategoryMap();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <TotalCard
            monthKey={summary.monthKey}
            totalCents={summary.totalCents}
            fixedCents={summary.fixedCents}
            variableCents={summary.variableCents}
            incomeCents={settings.monthlyIncomeCents}
          />
        </div>

        <div
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: "60ms", animationFillMode: "backwards" }}
        >
          <GoalCard
            todayCents={summary.todayCents}
            goalCents={summary.dailyGoalCents}
            status={summary.goalStatus}
            streakDays={streakDays}
          />
        </div>

        {projection.isProjectable && (
          <div
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{
              animationDelay: "120ms",
              animationFillMode: "backwards",
            }}
          >
            <ProjectionCard data={projection} />
          </div>
        )}

        <div
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: "180ms", animationFillMode: "backwards" }}
        >
          <Last7DaysBar data={summary.last7Days} />
        </div>

        <div
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: "240ms", animationFillMode: "backwards" }}
        >
          <CategoryDonut
            byCategory={summary.byCategory}
            categoryMap={categoryMap}
          />
        </div>
      </div>

      <Fab onClick={() => setSheetOpen(true)} aria-label="Adicionar gasto" />

      <QuickAddSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
