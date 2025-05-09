"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Deck } from "@/types/deck";

interface CreateDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDeck: (deck: Deck) => void;
}

export function CreateDeckDialog({
  open,
  onOpenChange,
  onCreateDeck,
}: CreateDeckDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [nameError, setNameError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Deck name is required");
      return;
    }

    const newDeck: Deck = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || undefined,
      createdAt: new Date().toISOString(),
      cardCount: 0,
    };

    onCreateDeck(newDeck);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
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
            <DialogTitle>Create new deck</DialogTitle>
            <DialogDescription>
              Create a new flashcard deck to organize your study materials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="flex items-center justify-between"
              >
                Deck name
                {nameError && (
                  <span className="text-xs text-destructive">{nameError}</span>
                )}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError("");
                }}
                placeholder="e.g., Spanish Vocabulary"
                className={nameError ? "border-destructive" : ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Languages"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Common Spanish words and phrases"
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
            <Button type="submit">Create Deck</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
