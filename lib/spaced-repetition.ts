import type { Card } from "@/types/deck"

// SM-2 algorithm for spaced repetition
// https://en.wikipedia.org/wiki/SuperMemo#Algorithm_SM-2

export function calculateNextReview(card: Card, quality: number): Date {
  // Quality is from 0 to 5
  // 0 = complete blackout, 5 = perfect recall

  let { interval = 0, easeFactor = 2.5 } = card

  // If quality < 3, reset interval to 0
  if (quality < 3) {
    interval = 0
  } else {
    // Calculate new interval
    if (interval === 0) {
      interval = 1
    } else if (interval === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
  }

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  // Calculate next review date
  const now = new Date()
  const nextReview = new Date(now)
  nextReview.setDate(now.getDate() + interval)

  return nextReview
}

