"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { ArrowLeft, Check, ChevronLeft, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Card as FlashCard, Deck } from "@/types/deck"
import type { StudySession } from "@/types/statistics"
import { calculateNextReview } from "@/lib/spaced-repetition"

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const { getItem, setItem } = useLocalStorage()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<FlashCard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studySession, setStudySession] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  })
  const [startTime, setStartTime] = useState<Date | null>(null)
  const deckId = params.deckId as string

  useEffect(() => {
    const loadDeckAndCards = () => {
      const decks = getItem<Deck[]>("flashmaster:decks") || []
      const currentDeck = decks.find((d) => d.id === deckId)

      if (!currentDeck) {
        router.push("/decks")
        return
      }

      setDeck(currentDeck)

      const deckCards = getItem<FlashCard[]>(`flashmaster:cards:${deckId}`) || []

      // Sort cards by due date (cards due for review first)
      const sortedCards = [...deckCards].sort((a, b) => {
        const aDue = a.nextReview ? new Date(a.nextReview).getTime() : 0
        const bDue = b.nextReview ? new Date(b.nextReview).getTime() : 0
        return aDue - bDue
      })

      setCards(sortedCards)
      setStudySession({
        correct: 0,
        incorrect: 0,
        total: sortedCards.length,
      })
      setStartTime(new Date())
    }

    loadDeckAndCards()
  }, [deckId, getItem, router])

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleResponse = (quality: number) => {
    if (cards.length === 0) return

    const currentCard = cards[currentCardIndex]
    const updatedCard = {
      ...currentCard,
      lastReviewed: new Date().toISOString(),
      nextReview: calculateNextReview(currentCard, quality).toISOString(),
      reviewCount: (currentCard.reviewCount || 0) + 1,
    }

    // Update card in storage
    const updatedCards = [...cards]
    updatedCards[currentCardIndex] = updatedCard
    setCards(updatedCards)
    setItem(`flashmaster:cards:${deckId}`, updatedCards)

    // Update study session stats
    setStudySession((prev) => ({
      ...prev,
      correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect,
    }))

    // Update deck stats
    if (deck) {
      const updatedDeck = {
        ...deck,
        lastStudied: new Date().toISOString(),
        studyCount: (deck.studyCount || 0) + 1,
      }

      const decks = getItem<Deck[]>("flashmaster:decks") || []
      const updatedDecks = decks.map((d) => (d.id === deckId ? updatedDeck : d))
      setItem("flashmaster:decks", updatedDecks)
      setDeck(updatedDeck)
    }

    // Move to next card or finish
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    } else {
      // Study session complete - save session data
      if (startTime) {
        const endTime = new Date()
        const studyTimeSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000)

        const newSession: StudySession = {
          id: uuidv4(),
          deckId,
          date: new Date().toISOString(),
          cardsStudied: cards.length,
          correctAnswers: studySession.correct,
          studyTimeSeconds,
        }

        const sessions = getItem<StudySession[]>("flashmaster:study-sessions") || []
        setItem("flashmaster:study-sessions", [...sessions, newSession])
      }

      // Navigate to completion page
      router.push(`/decks/${deckId}/study/complete`)
    }
  }

  if (!deck || cards.length === 0) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading study session...</p>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentCardIndex]
  const progress = (currentCardIndex / cards.length) * 100

  return (
    <div className="container py-8 px-4 md:px-6 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/decks/${deckId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{deck.name}</h1>
            <p className="text-muted-foreground text-sm">
              Card {currentCardIndex + 1} of {cards.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            <span className="text-green-500 font-medium">{studySession.correct}</span> correct,{" "}
            <span className="text-red-500 font-medium">{studySession.incorrect}</span> incorrect
          </div>
        </div>
      </div>

      <Progress value={progress} className="mb-8" />

      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="p-8 bg-muted/50 border-b min-h-[200px] flex items-center justify-center">
            <div className="text-xl font-medium text-center">{currentCard.front}</div>
          </div>
          {showAnswer && (
            <div className="p-8 min-h-[200px] flex items-center justify-center">
              <div className="text-lg text-center">{currentCard.back}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {!showAnswer ? (
        <div className="flex justify-center">
          <Button size="lg" onClick={handleShowAnswer}>
            Show Answer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500/10"
            onClick={() => handleResponse(1)}
          >
            <X className="h-4 w-4 mr-2" />
            Hard
          </Button>
          <Button
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
            onClick={() => handleResponse(2)}
          >
            Difficult
          </Button>
          <Button
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
            onClick={() => handleResponse(3)}
          >
            Good
          </Button>
          <Button
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-500/10"
            onClick={() => handleResponse(5)}
          >
            <Check className="h-4 w-4 mr-2" />
            Easy
          </Button>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={() => {
            if (currentCardIndex > 0) {
              setCurrentCardIndex(currentCardIndex - 1)
              setShowAnswer(false)
            }
          }}
          disabled={currentCardIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (currentCardIndex < cards.length - 1) {
              setCurrentCardIndex(currentCardIndex + 1)
              setShowAnswer(false)
            }
          }}
          disabled={currentCardIndex === cards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

