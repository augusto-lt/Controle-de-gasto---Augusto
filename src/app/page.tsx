"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { GoalCard } from "@/components/dashboard/goal-card";
import { Last7DaysBar } from "@/components/dashboard/last-7-days-bar";
import { TotalCard } from "@/components/dashboard/total-card";
import { Fab } from "@/components/fab";
import { QuickAddSheet } from "@/components/quick-add-sheet";
import { useCategoryMap } from "@/hooks/use-categories";
import { useMonthlySummary } from "@/hooks/use-monthly-summary";

const containerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function HomePage() {
  const summary = useMonthlySummary();
  const categoryMap = useCategoryMap();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 pb-[calc(7rem+env(safe-area-inset-bottom))]"
      >
        <motion.div variants={itemVariants}>
          <TotalCard
            monthKey={summary.monthKey}
            totalCents={summary.totalCents}
            fixedCents={summary.fixedCents}
            variableCents={summary.variableCents}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <GoalCard
            todayCents={summary.todayCents}
            goalCents={summary.dailyGoalCents}
            status={summary.goalStatus}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Last7DaysBar data={summary.last7Days} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <CategoryDonut
            byCategory={summary.byCategory}
            categoryMap={categoryMap}
          />
        </motion.div>
      </motion.div>

      <Fab onClick={() => setSheetOpen(true)} aria-label="Adicionar gasto" />

      <QuickAddSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
