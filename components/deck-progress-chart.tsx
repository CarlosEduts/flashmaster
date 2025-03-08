"use client"

import { useMemo } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Deck } from "@/types/deck"
import type { StudySession } from "@/types/statistics"

interface DeckProgressChartProps {
  decks: Deck[]
  studySessions: StudySession[]
}

export function DeckProgressChart({ decks, studySessions }: DeckProgressChartProps) {
  // Prepare data for deck progress
  const chartData = useMemo(() => {
    // Create a map of deck IDs to study counts
    const deckMap = new Map<string, number>()

    studySessions.forEach((session) => {
      if (session.deckId) {
        const existing = deckMap.get(session.deckId) || 0
        deckMap.set(session.deckId, existing + session.cardsStudied)
      }
    })

    // Generate data for each deck
    return decks
      .map((deck) => ({
        name: deck.name,
        value: deckMap.get(deck.id) || 0,
        id: deck.id,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Show top 10 decks
  }, [decks, studySessions])

  // Generate colors for the pie chart
  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--primary) / 90%)",
    "hsl(var(--primary) / 80%)",
    "hsl(var(--primary) / 70%)",
    "hsl(var(--primary) / 60%)",
    "hsl(var(--primary) / 50%)",
    "hsl(var(--primary) / 40%)",
    "hsl(var(--primary) / 30%)",
    "hsl(var(--primary) / 20%)",
    "hsl(var(--primary) / 10%)",
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ChartContainer className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent formatter={(value) => [`${value} cards`, "Cards Studied"]} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="flex flex-col justify-center">
        <h3 className="text-lg font-medium mb-4">Deck Progress</h3>
        <div className="space-y-2">
          {chartData.map((deck, index) => (
            <div key={deck.id} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <div className="flex-1 text-sm">{deck.name}</div>
              <div className="text-sm font-medium">{deck.value} cards</div>
            </div>
          ))}
        </div>

        {chartData.length === 0 && <div className="text-center text-muted-foreground">No study data available yet</div>}
      </div>
    </div>
  )
}

