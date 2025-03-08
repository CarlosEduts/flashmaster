"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, BarChart3, PieChart } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudyCalendar } from "@/components/study-calendar"
import { StudyTimeChart } from "@/components/study-time-chart"
import { AccuracyChart } from "@/components/accuracy-chart"
import { DeckProgressChart } from "@/components/deck-progress-chart"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Deck } from "@/types/deck"
import type { StudySession } from "@/types/statistics"

export default function StatisticsPage() {
  const { getItem } = useLocalStorage()
  const [decks, setDecks] = useState<Deck[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [stats, setStats] = useState({
    totalCards: 0,
    totalStudied: 0,
    totalTime: 0,
    averageAccuracy: 0,
    studyDays: 0,
    longestStreak: 0,
    currentStreak: 0,
  })

  useEffect(() => {
    const loadData = () => {
      const storedDecks = getItem<Deck[]>("flashmaster:decks") || []
      setDecks(storedDecks)

      const storedSessions = getItem<StudySession[]>("flashmaster:study-sessions") || []
      setStudySessions(storedSessions)

      // Calculate statistics
      if (storedSessions.length > 0) {
        const totalCards = storedSessions.reduce((sum, session) => sum + session.cardsStudied, 0)
        const totalCorrect = storedSessions.reduce((sum, session) => sum + session.correctAnswers, 0)
        const totalTime = storedSessions.reduce((sum, session) => sum + session.studyTimeSeconds, 0)
        const accuracy = totalCards > 0 ? (totalCorrect / totalCards) * 100 : 0

        // Calculate study days and streaks
        const studyDays = new Set(storedSessions.map((session) => new Date(session.date).toISOString().split("T")[0]))
          .size

        // Calculate streaks
        const sortedDates = [
          ...new Set(storedSessions.map((session) => new Date(session.date).toISOString().split("T")[0])),
        ].sort()

        let currentStreak = 0
        let longestStreak = 0
        let tempStreak = 0

        // Check if user studied today
        const today = new Date().toISOString().split("T")[0]
        const hasStudiedToday = sortedDates.includes(today)

        if (hasStudiedToday) {
          currentStreak = 1
          tempStreak = 1

          // Count backwards from yesterday
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)

          const checkDate = yesterday
          while (true) {
            const dateStr = checkDate.toISOString().split("T")[0]
            if (sortedDates.includes(dateStr)) {
              currentStreak++
              tempStreak++
              checkDate.setDate(checkDate.getDate() - 1)
            } else {
              break
            }
          }
        }

        // Calculate longest streak
        for (let i = 0; i < sortedDates.length; i++) {
          if (i === 0) {
            tempStreak = 1
          } else {
            const currentDate = new Date(sortedDates[i])
            const prevDate = new Date(sortedDates[i - 1])

            const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
              tempStreak++
            } else {
              tempStreak = 1
            }
          }

          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
          }
        }

        setStats({
          totalCards,
          totalStudied: storedSessions.length,
          totalTime,
          averageAccuracy: Math.round(accuracy),
          studyDays,
          longestStreak,
          currentStreak,
        })
      }
    }

    loadData()
  }, [getItem])

  return (
    <div className="container py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{stats.totalCards}</div>
            </div>
            <div className="text-sm text-muted-foreground">Cards Studied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">
                {Math.floor(stats.totalTime / 60)}m {stats.totalTime % 60}s
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Total Study Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
            </div>
            <div className="text-sm text-muted-foreground">Average Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{stats.currentStreak} days</div>
            </div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="calendar">Study Calendar</TabsTrigger>
          <TabsTrigger value="time">Study Time</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="decks">Deck Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Study Calendar</CardTitle>
              <CardDescription>View your study activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <StudyCalendar studySessions={studySessions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Study Time</CardTitle>
              <CardDescription>Track how much time you spend studying each day</CardDescription>
            </CardHeader>
            <CardContent>
              <StudyTimeChart studySessions={studySessions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy">
          <Card>
            <CardHeader>
              <CardTitle>Accuracy Rate</CardTitle>
              <CardDescription>Track your answer accuracy over time</CardDescription>
            </CardHeader>
            <CardContent>
              <AccuracyChart studySessions={studySessions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decks">
          <Card>
            <CardHeader>
              <CardTitle>Deck Progress</CardTitle>
              <CardDescription>Compare your progress across different decks</CardDescription>
            </CardHeader>
            <CardContent>
              <DeckProgressChart decks={decks} studySessions={studySessions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

