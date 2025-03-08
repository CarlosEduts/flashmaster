"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { ImagePlus, Mic, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { Card as FlashCard } from "@/types/deck"

interface CreateCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateCard: (card: FlashCard) => void
  deckId: string
}

export function CreateCardDialog({ open, onOpenChange, onCreateCard, deckId }: CreateCardDialogProps) {
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [frontAudio, setFrontAudio] = useState<string | null>(null)
  const [backAudio, setBackAudio] = useState<string | null>(null)
  const [frontVideo, setFrontVideo] = useState<string | null>(null)
  const [backVideo, setBackVideo] = useState<string | null>(null)
  const [frontError, setFrontError] = useState("")
  const [backError, setBackError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let hasError = false

    if (!front.trim() && !frontImage && !frontAudio && !frontVideo) {
      setFrontError("Front side cannot be empty")
      hasError = true
    }

    if (!back.trim() && !backImage && !backAudio && !backVideo) {
      setBackError("Back side cannot be empty")
      hasError = true
    }

    if (hasError) return

    const newCard: FlashCard = {
      id: uuidv4(),
      deckId,
      front: front.trim(),
      back: back.trim(),
      frontImage,
      backImage,
      frontAudio,
      backAudio,
      frontVideo,
      backVideo,
      createdAt: new Date().toISOString(),
      interval: 0,
      easeFactor: 2.5,
      reviewCount: 0,
    }

    onCreateCard(newCard)
    resetForm()
  }

  const resetForm = () => {
    setFront("")
    setBack("")
    setFrontImage(null)
    setBackImage(null)
    setFrontAudio(null)
    setBackAudio(null)
    setFrontVideo(null)
    setBackVideo(null)
    setFrontError("")
    setBackError("")
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  // Mock functions for media handling (in a real app, these would handle file uploads)
  const handleImageUpload = (side: "front" | "back") => {
    const imageUrl = `/placeholder.svg?height=200&width=300`
    if (side === "front") {
      setFrontImage(imageUrl)
      setFrontError("")
    } else {
      setBackImage(imageUrl)
      setBackError("")
    }
  }

  const handleAudioRecord = (side: "front" | "back") => {
    const audioUrl = "audio-placeholder.mp3"
    if (side === "front") {
      setFrontAudio(audioUrl)
      setFrontError("")
    } else {
      setBackAudio(audioUrl)
      setBackError("")
    }
  }

  const handleVideoUpload = (side: "front" | "back") => {
    const videoUrl = "video-placeholder.mp4"
    if (side === "front") {
      setFrontVideo(videoUrl)
      setFrontError("")
    } else {
      setBackVideo(videoUrl)
      setBackError("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new flashcard</DialogTitle>
            <DialogDescription>
              Add a new flashcard to your deck. You can include text, images, audio, and video.
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
                  <Label htmlFor="front" className="flex items-center justify-between">
                    Front content
                    {frontError && <span className="text-xs text-destructive">{frontError}</span>}
                  </Label>
                  <Textarea
                    id="front"
                    value={front}
                    onChange={(e) => {
                      setFront(e.target.value)
                      if (e.target.value.trim()) setFrontError("")
                    }}
                    placeholder="e.g., ¿Cómo estás?"
                    rows={3}
                    className={frontError ? "border-destructive" : ""}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleImageUpload("front")}>
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAudioRecord("front")}>
                    <Mic className="h-4 w-4 mr-2" />
                    Record Audio
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleVideoUpload("front")}>
                    <Video className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </div>
                {frontImage && (
                  <div className="mt-2">
                    <img src={frontImage || "/placeholder.svg"} alt="Front side" className="max-h-40 rounded-md" />
                  </div>
                )}
                {frontAudio && (
                  <div className="mt-2">
                    <audio controls className="w-full">
                      <source src={frontAudio} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                {frontVideo && (
                  <div className="mt-2">
                    <video controls className="w-full max-h-40">
                      <source src={frontVideo} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="back" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="back" className="flex items-center justify-between">
                    Back content
                    {backError && <span className="text-xs text-destructive">{backError}</span>}
                  </Label>
                  <Textarea
                    id="back"
                    value={back}
                    onChange={(e) => {
                      setBack(e.target.value)
                      if (e.target.value.trim()) setBackError("")
                    }}
                    placeholder="e.g., How are you?"
                    rows={3}
                    className={backError ? "border-destructive" : ""}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleImageUpload("back")}>
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAudioRecord("back")}>
                    <Mic className="h-4 w-4 mr-2" />
                    Record Audio
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleVideoUpload("back")}>
                    <Video className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </div>
                {backImage && (
                  <div className="mt-2">
                    <img src={backImage || "/placeholder.svg"} alt="Back side" className="max-h-40 rounded-md" />
                  </div>
                )}
                {backAudio && (
                  <div className="mt-2">
                    <audio controls className="w-full">
                      <source src={backAudio} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                {backVideo && (
                  <div className="mt-2">
                    <video controls className="w-full max-h-40">
                      <source src={backVideo} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

