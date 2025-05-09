export interface StudySession {
  id: string;
  deckId: string;
  date: string;
  cardsStudied: number;
  correctAnswers: number;
  studyTimeSeconds: number;
}
