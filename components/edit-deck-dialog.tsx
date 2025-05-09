"use client";

import type React from "react";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Deck } from "@/types/deck";

interface EditDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateDeck: (deck: Deck) => void;
  deck: Deck;
}

export function EditDeckDialog({
  open,
  onOpenChange,
  onUpdateDeck,
  deck,
}: EditDeckDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
    }
  }, [deck, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Deck name is required");
      return;
    }

    const updatedDeck: Deck = {
      ...deck,
      name: name.trim(),
      description: description.trim(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateDeck(updatedDeck);
  };

  const resetForm = () => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
    }
    setNameError("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit deck</DialogTitle>
            <DialogDescription>
              Update the name and description of your flashcard deck.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="edit-name"
                className="flex items-center justify-between"
              >
                Deck name
                {nameError && (
                  <span className="text-xs text-destructive">{nameError}</span>
                )}
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError("");
                }}
                className={nameError ? "border-destructive" : ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
