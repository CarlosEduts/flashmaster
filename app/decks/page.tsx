"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, FolderPlus, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Deck } from "@/types/deck";

export default function DecksPage() {
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { getItem, setItem } = useLocalStorage();
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    const storedDecks = getItem<Deck[]>("flashmaster:decks") || [];
    setDecks(storedDecks);
  }, [getItem]);

  const filteredDecks = decks.filter(
    (deck) =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDeck = (newDeck: Deck) => {
    const updatedDecks = [...decks, newDeck];
    setDecks(updatedDecks);
    setItem("flashmaster:decks", updatedDecks);
    setIsCreateDeckOpen(false);
  };

  return (
    <div className="w-full">
      <div className="container max-w-4xl py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Decks</h1>
            <p className="text-muted-foreground mt-1">
              Create, organize, and study your flashcard decks
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search decks..."
                className="w-full md:w-[200px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsCreateDeckOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Deck
            </Button>
          </div>
        </div>

        {decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <FolderPlus className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No decks yet</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Create your first flashcard deck to start learning and memorizing
              effectively.
            </p>
            <Button onClick={() => setIsCreateDeckOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Deck
            </Button>
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No decks match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
              <Link href={`/decks/${deck.id}`} key={deck.id}>
                <Card className="h-full transition-all hover:shadow-md bg-muted/60 border-none">
                  <CardHeader>
                    <CardTitle>{deck.name}</CardTitle>
                    <CardDescription>{deck.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {deck.cardCount || 0}
                        </span>
                        <span className="text-muted-foreground">cards</span>
                      </div>
                      {deck.lastStudied && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">
                            Last studied:
                          </span>
                          <span className="font-medium">
                            {new Date(deck.lastStudied).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      className="ml-auto gap-1 text-primary"
                    >
                      View Deck <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <CreateDeckDialog
          open={isCreateDeckOpen}
          onOpenChange={setIsCreateDeckOpen}
          onCreateDeck={handleCreateDeck}
        />
      </div>
    </div>
  );
}
