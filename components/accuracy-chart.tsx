"use client";

import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { StudySession } from "@/types/statistics";

interface AccuracyChartProps {
  studySessions: StudySession[];
}

export function AccuracyChart({ studySessions }: AccuracyChartProps) {
  // Prepare data for the last 14 days
  const chartData = useMemo(() => {
    const today = new Date();
    const data = [];

    // Create a map of dates to accuracy data
    const dateMap = new Map<string, { correct: number; total: number }>();

    studySessions.forEach((session) => {
      const dateStr = new Date(session.date).toISOString().split("T")[0];
      const existing = dateMap.get(dateStr) || { correct: 0, total: 0 };

      dateMap.set(dateStr, {
        correct: existing.correct + session.correctAnswers,
        total: existing.total + session.cardsStudied,
      });
    });

    // Generate data for the last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = date.toISOString().split("T")[0];
      const accuracyData = dateMap.get(dateStr);

      const accuracy = accuracyData
        ? Math.round((accuracyData.correct / accuracyData.total) * 100)
        : null;

      data.push({
        date: dateStr,
        accuracy: accuracy,
      });
    }

    return data;
  }, [studySessions]);

  return (
    <ChartContainer
      config={{
        accuracy: {
          label: "Accuracy",
          color: "hsl(var(--primary))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
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
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="var(--color-accuracy)"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  format(new Date(value), "MMMM d, yyyy")
                }
                formatter={(value) =>
                  value ? [`${value}%`, "Accuracy"] : ["No data", "Accuracy"]
                }
              />
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
