"use client";

import { OverGoalDays } from "@/components/reports/over-goal-days";
import { SixMonthsLine } from "@/components/reports/six-months-line";
import { StatsGrid } from "@/components/reports/stats-grid";
import { TopCategories } from "@/components/reports/top-categories";
import { useCategoryMap } from "@/hooks/use-categories";
import { useReports } from "@/hooks/use-reports";
import { useSettings } from "@/hooks/use-settings";

export default function RelatoriosPage() {
  const reports = useReports();
  const categoryMap = useCategoryMap();
  const settings = useSettings();

  return (
    <div
      className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 pb-[calc(5rem+env(safe-area-inset-bottom))]"
    >
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
