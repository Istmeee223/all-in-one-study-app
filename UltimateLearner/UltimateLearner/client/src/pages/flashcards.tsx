import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  Brain, 
  Play,
  RotateCcw,
  Trash2,
  BookOpen
} from "lucide-react";
import { getCategoryColor, CATEGORIES, FLASHCARD_DIFFICULTIES } from "@/lib/constants";
import type { FlashcardDeck, Flashcard, InsertFlashcardDeck, InsertFlashcard } from "@shared/schema";

function HeaderBar() {
  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Flashcards</h2>
          <p className="text-muted-foreground">Review and memorize key concepts</p>
        </div>
      </div>
    </header>
  );
}

function CreateDeckDialog({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const { toast } = useToast();

  const createDeckMutation = useMutation({
    mutationFn: async (deck: InsertFlashcardDeck) => {
      const response = await apiRequest("POST", "/api/flashcard-decks", deck);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-decks"] });
      setTitle("");
      setDescription("");
      setCategory("");
      toast({ title: "Flashcard deck created successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create deck", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ 
        title: "Missing information", 
        description: "Please enter a deck title",
        variant: "destructive" 
      });
      return;
    }

    createDeckMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      category: category || undefined,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Flashcard Deck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Deck title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Deck description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={createDeckMutation.isPending}
          >
            {createDeckMutation.isPending ? "Creating..." : "Create Deck"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StudyMode({ deckId, onClose }: { deckId: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());

  const { data: flashcards } = useQuery({
    queryKey: ["/api/flashcard-decks", deckId, "flashcards"],
  });

  const updateFlashcardMutation = useMutation({
    mutationFn: async ({ id, difficulty }: { id: number; difficulty: number }) => {
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + difficulty);
      
      const response = await apiRequest("PUT", `/api/flashcards/${id}`, {
        difficulty,
        lastReviewed: new Date(),
        nextReview,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-decks", deckId, "flashcards"] });
    },
  });

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No flashcards in this deck</h3>
        <p className="text-muted-foreground mb-4">Add some flashcards to start studying.</p>
        <Button onClick={onClose}>Go Back</Button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleDifficultySelect = (difficulty: number) => {
    updateFlashcardMutation.mutate({ id: currentCard.id, difficulty });
    setReviewedCards(prev => new Set([...prev, currentCard.id]));
    
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Session complete
      onClose();
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onClose}>← Back to Decks</Button>
          <div className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card 
        className={`mb-6 min-h-[300px] cursor-pointer transition-all duration-300 flashcard ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="p-12 flex items-center justify-center text-center">
          <div>
            {!isFlipped ? (
              <>
                <h4 className="text-2xl font-bold text-foreground mb-4">{currentCard.front}</h4>
                <p className="text-muted-foreground">Click to reveal answer</p>
              </>
            ) : (
              <>
                <h4 className="text-2xl font-bold text-foreground mb-4">{currentCard.back}</h4>
                <p className="text-muted-foreground">How well did you know this?</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {isFlipped && (
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Button
            variant="destructive"
            onClick={() => handleDifficultySelect(FLASHCARD_DIFFICULTIES.HARD)}
            disabled={updateFlashcardMutation.isPending}
          >
            Hard
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleDifficultySelect(FLASHCARD_DIFFICULTIES.MEDIUM)}
            disabled={updateFlashcardMutation.isPending}
          >
            Medium
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleDifficultySelect(FLASHCARD_DIFFICULTIES.EASY)}
            disabled={updateFlashcardMutation.isPending}
          >
            Easy
          </Button>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handlePrevious} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button variant="ghost" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}

function AddCardDialog({ deckId }: { deckId: number }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const { toast } = useToast();

  const createCardMutation = useMutation({
    mutationFn: async (card: InsertFlashcard) => {
      const response = await apiRequest("POST", `/api/flashcard-decks/${deckId}/flashcards`, card);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-decks", deckId, "flashcards"] });
      setFront("");
      setBack("");
      toast({ title: "Flashcard added successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to add flashcard", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      toast({ 
        title: "Missing information", 
        description: "Please enter both front and back text",
        variant: "destructive" 
      });
      return;
    }

    createCardMutation.mutate({
      deckId,
      front: front.trim(),
      back: back.trim(),
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Flashcard</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Front (Question)</label>
            <Textarea
              placeholder="Enter the question or prompt..."
              value={front}
              onChange={(e) => setFront(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Back (Answer)</label>
            <Textarea
              placeholder="Enter the answer..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={createCardMutation.isPending}
          >
            {createCardMutation.isPending ? "Adding..." : "Add Flashcard"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FlashcardDecks() {
  const [studyingDeckId, setStudyingDeckId] = useState<number | null>(null);

  const { data: decks, isLoading } = useQuery({
    queryKey: ["/api/flashcard-decks"],
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/flashcard-decks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-decks"] });
    },
  });

  if (studyingDeckId) {
    return <StudyMode deckId={studyingDeckId} onClose={() => setStudyingDeckId(null)} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="h-3 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!decks || decks.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No flashcard decks yet</h3>
        <p className="text-muted-foreground mb-6">Create your first deck to start studying with flashcards.</p>
        <CreateDeckDialog>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Deck
          </Button>
        </CreateDeckDialog>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck: FlashcardDeck) => (
        <FlashcardDeckCard 
          key={deck.id} 
          deck={deck} 
          onStudy={() => setStudyingDeckId(deck.id)}
          onDelete={() => deleteDeckMutation.mutate(deck.id)}
        />
      ))}
    </div>
  );
}

function FlashcardDeckCard({ 
  deck, 
  onStudy, 
  onDelete 
}: { 
  deck: FlashcardDeck; 
  onStudy: () => void;
  onDelete: () => void;
}) {
  const { data: flashcards } = useQuery({
    queryKey: ["/api/flashcard-decks", deck.id, "flashcards"],
  });

  const cardCount = flashcards?.length || 0;
  const masteredCards = flashcards?.filter((card: Flashcard) => 
    card.difficulty && card.difficulty >= 3
  ).length || 0;
  const masteryPercentage = cardCount > 0 ? (masteredCards / cardCount) * 100 : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-foreground line-clamp-2">{deck.title}</h4>
          <div className="flex items-center space-x-1">
            <AddCardDialog deckId={deck.id} />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {deck.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {deck.description}
          </p>
        )}
        
        <p className="text-sm text-muted-foreground mb-4">
          {cardCount} cards • Last studied recently
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              masteryPercentage >= 80 ? 'bg-green-500' : 
              masteryPercentage >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-muted-foreground">
              {Math.round(masteryPercentage)}% mastered
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {deck.category && (
              <Badge variant="secondary" className={getCategoryColor(deck.category)}>
                {deck.category}
              </Badge>
            )}
            <Button 
              size="sm" 
              onClick={onStudy}
              disabled={cardCount === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-1" />
              Study
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Flashcards() {
  return <div>Flashcards</div>;
}
