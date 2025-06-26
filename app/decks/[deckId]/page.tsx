"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Plus,
  Play,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCardDialog } from "@/components/create-card-dialog";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import type { Card as FlashCard, Deck } from "@/types/deck";

export default function DeckPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { getItem, setItem } = useLocalStorage();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [isEditDeckOpen, setIsEditDeckOpen] = useState(false);
  const deckId = params.deckId as string;

  useEffect(() => {
    const loadDeck = () => {
      const decks = getItem<Deck[]>("flashmaster:decks") || [];
      const currentDeck = decks.find((d) => d.id === deckId);

      if (!currentDeck) {
        router.push("/decks");
        return;
      }

      setDeck(currentDeck);

      const deckCards =
        getItem<FlashCard[]>(`flashmaster:cards:${deckId}`) || [];
      setCards(deckCards);
    };

    loadDeck();
  }, [deckId, getItem, router]);

  const handleCreateCard = (newCard: FlashCard) => {
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    setItem(`flashmaster:cards:${deckId}`, updatedCards);

    // Update card count in deck
    const decks = getItem<Deck[]>("flashmaster:decks") || [];
    const updatedDecks = decks.map((d) => {
      if (d.id === deckId) {
        return { ...d, cardCount: updatedCards.length };
      }
      return d;
    });
    setItem("flashmaster:decks", updatedDecks);

    if (deck) {
      setDeck({ ...deck, cardCount: updatedCards.length });
    }

    setIsCreateCardOpen(false);
  };

  const handleUpdateDeck = (updatedDeck: Deck) => {
    const decks = getItem<Deck[]>("flashmaster:decks") || [];
    const updatedDecks = decks.map((d) => (d.id === deckId ? updatedDeck : d));
    setItem("flashmaster:decks", updatedDecks);
    setDeck(updatedDeck);
    setIsEditDeckOpen(false);
  };

  const handleDeleteDeck = () => {
    const decks = getItem<Deck[]>("flashmaster:decks") || [];
    const updatedDecks = decks.filter((d) => d.id !== deckId);
    setItem("flashmaster:decks", updatedDecks);

    // Remove cards associated with this deck
    localStorage.removeItem(`flashmaster:cards:${deckId}`);

    toast({
      title: "Deck deleted",
      description: "The deck and all its cards have been deleted.",
    });

    router.push("/decks");
  };

  if (!deck) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading deck...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container max-w-4xl py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/decks")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{deck.name}</h1>
              <p className="text-muted-foreground mt-1">{deck.description}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={() => router.push(`/decks/${deckId}/study`)}
              disabled={cards.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Study
            </Button>
            <Button variant="outline" onClick={() => setIsCreateCardOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDeckOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Deck
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDeleteDeck}
                >
                  <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                  Delete Deck
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="cards">Cards ({cards.length})</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          <TabsContent value="cards">
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No cards yet</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Add your first flashcard to this deck to start learning.
                </p>
                <Button onClick={() => setIsCreateCardOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Card
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <Card key={card.id} className="overflow-hidden py-0">
                    <CardContent className="p-0">
                      <div className="p-6 bg-muted/50 border-b">
                        <div className="font-medium">{card.front}</div>
                      </div>
                      <div className="p-6">
                        <div className="text-muted-foreground">{card.back}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{cards.length}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Cards
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {deck.lastStudied
                      ? new Date(deck.lastStudied).toLocaleDateString()
                      : "Never"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last Studied
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {deck.studyCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Study Sessions
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <CreateCardDialog
          open={isCreateCardOpen}
          onOpenChange={setIsCreateCardOpen}
          onCreateCard={handleCreateCard}
          deckId={deckId}
        />

        <EditDeckDialog
          open={isEditDeckOpen}
          onOpenChange={setIsEditDeckOpen}
          onUpdateDeck={handleUpdateDeck}
          deck={deck}
        />
      </div>
    </div>
  );
}
