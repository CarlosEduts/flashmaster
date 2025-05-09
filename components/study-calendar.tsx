"use client";

import { useState } from "react";
import { addDays, format, startOfWeek, subMonths } from "date-fns";
import type { StudySession } from "@/types/statistics";

interface StudyCalendarProps {
  studySessions: StudySession[];
}

export function StudyCalendar({ studySessions }: StudyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar data for the last 3 months
  const generateCalendarData = () => {
    const startDate = subMonths(currentDate, 3);
    const endDate = currentDate;

    // Create a map of dates to card counts
    const dateMap = new Map<string, number>();

    studySessions.forEach((session) => {
      const dateStr = new Date(session.date).toISOString().split("T")[0];
      const existing = dateMap.get(dateStr) || 0;
      dateMap.set(dateStr, existing + session.cardsStudied);
    });

    // Generate calendar cells
    const calendarData = [];
    let currentWeek = [];

    // Start with the first day of the week containing the start date
    let day = startOfWeek(startDate);

    while (day <= endDate) {
      const dateStr = day.toISOString().split("T")[0];
      const cardCount = dateMap.get(dateStr) || 0;

      currentWeek.push({
        date: new Date(day),
        count: cardCount,
        intensity: getIntensity(cardCount),
      });

      // Start a new week
      if (currentWeek.length === 7) {
        calendarData.push([...currentWeek]);
        currentWeek = [];
      }

      day = addDays(day, 1);
    }

    // Add the last partial week if needed
    if (currentWeek.length > 0) {
      calendarData.push([...currentWeek]);
    }

    return calendarData;
  };

  // Calculate color intensity based on card count
  const getIntensity = (count: number): number => {
    if (count === 0) return 0;
    if (count < 10) return 1;
    if (count < 25) return 2;
    if (count < 50) return 3;
    return 4;
  };

  const calendarData = generateCalendarData();

  // Get month labels
  const getMonthLabels = () => {
    const months = new Set<string>();
    calendarData.forEach((week) => {
      week.forEach((day) => {
        months.add(format(day.date, "MMM"));
      });
    });
    return Array.from(months);
  };

  const monthLabels = getMonthLabels();

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between">
        <div className="flex space-x-4">
          {monthLabels.map((month, i) => (
            <div key={i} className="text-sm font-medium">
              {month}
            </div>
          ))}
        </div>
      </div>

      <div className="flex mb-1 text-xs text-muted-foreground">
        <div className="w-6 text-center">S</div>
        <div className="w-6 text-center">M</div>
        <div className="w-6 text-center">T</div>
        <div className="w-6 text-center">W</div>
        <div className="w-6 text-center">T</div>
        <div className="w-6 text-center">F</div>
        <div className="w-6 text-center">S</div>
      </div>

      <div className="space-y-1">
        {calendarData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="w-6 h-6 rounded-sm mr-1 flex items-center justify-center text-xs relative group"
                style={{
                  backgroundColor:
                    day.intensity === 0
                      ? "rgba(120, 120, 120, 0.1)"
                      : `hsl(var(--primary) / ${day.count * 20}%)`,
                  border: "1px solid var(--border)",
                }}
              >
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded p-1 shadow-md whitespace-nowrap z-10">
                  {format(day.date, "MMM d, yyyy")}: {day.count} cards
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center mt-4 text-xs text-muted-foreground">
        <span className="mr-2">Less</span>
        <div className="flex space-x-1">
          <div
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
            }}
          ></div>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "hsl(var(--primary) / 20%)" }}
          ></div>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "hsl(var(--primary) / 40%)" }}
          ></div>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "hsl(var(--primary) / 60%)" }}
          ></div>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "hsl(var(--primary) / 80%)" }}
          ></div>
        </div>
        <span className="ml-2">More</span>
      </div>
    </div>
  );
}
