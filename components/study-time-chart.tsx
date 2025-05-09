"use client";

import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { StudySession } from "@/types/statistics";

interface StudyTimeChartProps {
  studySessions: StudySession[];
}

export function StudyTimeChart({ studySessions }: StudyTimeChartProps) {
  // Prepare data for the last 14 days
  const chartData = useMemo(() => {
    const today = new Date();
    const data = [];

    // Create a map of dates to study time
    const dateMap = new Map<string, number>();

    studySessions.forEach((session) => {
      const dateStr = new Date(session.date).toISOString().split("T")[0];
      const existing = dateMap.get(dateStr) || 0;
      dateMap.set(dateStr, existing + session.studyTimeSeconds);
    });

    // Generate data for the last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = date.toISOString().split("T")[0];
      const studyTime = dateMap.get(dateStr) || 0;

      data.push({
        date: dateStr,
        minutes: Math.round(studyTime / 60),
      });
    }

    return data;
  }, [studySessions]);

  return (
    <ChartContainer
      config={{
        minutes: {
          label: "Minutes",
          color: "hsl(var(--primary))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => format(new Date(value), "MMM d")}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => `${value}m`}
          />
          <Bar
            dataKey="minutes"
            fill="var(--color-minutes)"
            radius={[4, 4, 0, 0]}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  format(new Date(value), "MMMM d, yyyy")
                }
                formatter={(value) => [`${value} minutes`, "Study Time"]}
              />
            }
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
