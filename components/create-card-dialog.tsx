"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Card as FlashCard } from "@/types/deck";

interface CreateCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCard: (card: FlashCard) => void;
  deckId: string;
}

export function CreateCardDialog({
  open,
  onOpenChange,
  onCreateCard,
  deckId,
}: CreateCardDialogProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [frontError, setFrontError] = useState("");
  const [backError, setBackError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!front.trim()) {
      setFrontError("Front side cannot be empty");
      hasError = true;
    }

    if (!back.trim()) {
      setBackError("Back side cannot be empty");
      hasError = true;
    }

    if (hasError) return;

    const newCard: FlashCard = {
      id: uuidv4(),
      deckId,
      front: front.trim(),
      back: back.trim(),
      createdAt: new Date().toISOString(),
      interval: 0,
      easeFactor: 2.5,
      reviewCount: 0,
    };

    onCreateCard(newCard);
    resetForm();
  };

  const resetForm = () => {
    setFront("");
    setBack("");
    setFrontError("");
    setBackError("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new flashcard</DialogTitle>
            <DialogDescription>
              Add a new flashcard to your deck. You can include text, images,
              audio, and video.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue="front" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="front">Front Side</TabsTrigger>
                <TabsTrigger value="back">Back Side</TabsTrigger>
              </TabsList>
              <TabsContent value="front" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="front"
                    className="flex items-center justify-between"
                  >
                    Front content
                    {frontError && (
                      <span className="text-xs text-destructive">
                        {frontError}
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id="front"
                    value={front}
                    onChange={(e) => {
                      setFront(e.target.value);
                      if (e.target.value.trim()) setFrontError("");
                    }}
                    placeholder="e.g., ¿Cómo estás?"
                    rows={3}
                    className={frontError ? "border-destructive" : ""}
                  />
                </div>
                <div className="flex gap-2"></div>
              </TabsContent>
              <TabsContent value="back" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="back"
                    className="flex items-center justify-between"
                  >
                    Back content
                    {backError && (
                      <span className="text-xs text-destructive">
                        {backError}
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id="back"
                    value={back}
                    onChange={(e) => {
                      setBack(e.target.value);
                      if (e.target.value.trim()) setBackError("");
                    }}
                    placeholder="e.g., How are you?"
                    rows={3}
                    className={backError ? "border-destructive" : ""}
                  />
                </div>
                <div className="flex gap-2"></div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
