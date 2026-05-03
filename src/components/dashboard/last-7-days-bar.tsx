"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/money";
import {
  formatRelativeDayLabel,
  formatTickShort,
  type DayKey,
} from "@/lib/date";

interface Last7DaysBarProps {
  data: { day: DayKey; totalCents: number }[];
}

interface ChartRow {
  day: DayKey;
  short: string;
  reais: number;
}

interface BarPayload {
  payload: ChartRow;
}

export function Last7DaysBar({ data }: Last7DaysBarProps) {
  const chartData: ChartRow[] = data.map((d) => ({
    day: d.day,
    short: formatTickShort(d.day),
    reais: d.totalCents / 100,
  }));

  const hasAny = chartData.some((d) => d.reais > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Últimos 7 dias</CardTitle>
      </CardHeader>
      <div className="h-40 px-2 pb-2">
        {hasAny ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="short"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "var(--color-accent)", opacity: 0.4 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = (payload as unknown as BarPayload[])[0].payload;
                  return (
                    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="font-medium text-popover-foreground">
                        {formatRelativeDayLabel(row.day)}
                      </p>
                      <p className="tabular-nums text-muted-foreground">
                        {formatBRL(Math.round(row.reais * 100))}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="reais"
                fill="var(--color-primary)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Nenhum gasto nos últimos 7 dias
          </div>
        )}
      </div>
    </Card>
  );
}
