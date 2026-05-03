"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/dashboard/chart-skeleton";
import { OverGoalDays } from "@/components/reports/over-goal-days";
import { StatsGrid } from "@/components/reports/stats-grid";
import { TopCategories } from "@/components/reports/top-categories";
import { useCategoryMap } from "@/hooks/use-categories";
import { useReports } from "@/hooks/use-reports";
import { useSettings } from "@/hooks/use-settings";

// Recharts fora do bundle inicial — outros painéis são gratuitos.
const SixMonthsLine = dynamic(
  () =>
    import("@/components/reports/six-months-line").then((m) => ({
      default: m.SixMonthsLine,
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="Últimos 6 meses" heightClass="h-44" />,
  },
);

export default function RelatoriosPage() {
  const reports = useReports();
  const categoryMap = useCategoryMap();
  const settings = useSettings();

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <SixMonthsLine data={reports.sixMonths} />
      <StatsGrid stats={reports.stats} />
      <TopCategories items={reports.topCategories} categoryMap={categoryMap} />
      <OverGoalDays
        days={reports.overGoalDays}
        goalCents={settings.dailyGoalCents}
      />
    </div>
  );
}
