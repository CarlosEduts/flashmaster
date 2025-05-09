export interface Deck {
  id: string;
  name: string;
  description: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
  lastStudied?: string;
  studyCount?: number;
  cardCount: number;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  frontImage?: string | null;
  backImage?: string | null;
  frontAudio?: string | null;
  backAudio?: string | null;
  frontVideo?: string | null;
  backVideo?: string | null;
  createdAt: string;
  updatedAt?: string;
  lastReviewed?: string;
  nextReview?: string;
  interval?: number;
  easeFactor?: number;
  reviewCount?: number;
}
