"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BarChart, Home, Repeat } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Deck } from "@/types/deck"

export default function StudyCompletePage() {
  const params = useParams()
  const router = useRouter()
  const { getItem } = useLocalStorage()
  const [deck, setDeck] = useState<Deck | null>(null)
  const deckId = params.deckId as string

  useEffect(() => {
    const loadDeck = () => {
      const decks = getItem<Deck[]>("flashmaster:decks") || []
      const currentDeck = decks.find((d) => d.id === deckId)

      if (!currentDeck) {
        router.push("/decks")
        return
      }

      setDeck(currentDeck)
    }

    loadDeck()
  }, [deckId, getItem, router])

  if (!deck) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/decks/${deckId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Complete</h1>
          <p className="text-muted-foreground text-sm">{deck.name}</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Great job!</CardTitle>
          <CardDescription>You've completed your study session for {deck.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <BarChart className="h-12 w-12 text-primary" />
            </div>
            <p className="text-center max-w-md mb-6">
              Your progress has been saved. Keep up the good work and continue studying regularly for the best results.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => router.push(`/decks/${deckId}/study`)}>
                <Repeat className="h-4 w-4 mr-2" />
                Study Again
              </Button>
              <Button variant="outline" onClick={() => router.push(`/decks/${deckId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Deck
              </Button>
              <Button variant="ghost" onClick={() => router.push("/decks")}>
                <Home className="h-4 w-4 mr-2" />
                All Decks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

