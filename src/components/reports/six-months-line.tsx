"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/money";
import { formatMonthLabel } from "@/lib/date";
import type { MonthSeriesPoint } from "@/hooks/use-reports";

interface SixMonthsLineProps {
  data: MonthSeriesPoint[];
}

interface LinePayload {
  payload: ChartRow;
}

interface ChartRow {
  monthKey: string;
  label: string;
  reais: number;
}

export function SixMonthsLine({ data }: SixMonthsLineProps) {
  const chartData: ChartRow[] = data.map((d) => ({
    monthKey: d.monthKey,
    label: d.label,
    reais: d.totalCents / 100,
  }));
  const hasAny = chartData.some((d) => d.reais > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Últimos 6 meses</CardTitle>
      </CardHeader>
      <div className="h-44 px-2 pb-3">
        {hasAny ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ stroke: "var(--color-border)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = (payload as unknown as LinePayload[])[0].payload;
                  return (
                    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="font-medium text-popover-foreground">
                        {formatMonthLabel(row.monthKey)}
                      </p>
                      <p className="tabular-nums text-muted-foreground">
                        {formatBRL(Math.round(row.reais * 100))}
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="reais"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--color-primary)" }}
                activeDot={{ r: 5 }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Sem dados nos últimos 6 meses
          </div>
        )}
      </div>
    </Card>
  );
}
