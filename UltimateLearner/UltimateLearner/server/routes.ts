import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertNoteSchema, 
  insertFlashcardDeckSchema, 
  insertFlashcardSchema, 
  insertTaskSchema, 
  insertStudySessionSchema, 
  insertStudyEventSchema,
  insertFileSchema,
  insertMindMapSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertQuizSchema,
  insertQuizAttemptSchema,
  insertAchievementSchema,
  insertAnalyticsSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { aiService } from "./ai-services";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Allow specific file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|m4a/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({ 
  storage: storage_multer,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Notes API
  app.get("/api/notes", async (req: Request, res: Response) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch notes", error: error.message });
    }
  });

  app.get("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch note", error: error.message });
    }
  });

  app.post("/api/notes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create note", error: error.message });
    }
  });

  app.patch("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedNote = await storage.updateNote(id, req.body);
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(updatedNote);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update note", error: error.message });
    }
  });

  app.delete("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete note", error: error.message });
    }
  });

  app.get("/api/notes/search/:query", async (req: Request, res: Response) => {
    try {
      const query = req.params.query;
      const notes = await storage.searchNotes(query);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to search notes", error: error.message });
    }
  });

  // Flashcard Decks API
  app.get("/api/flashcard-decks", async (req: Request, res: Response) => {
    try {
      const decks = await storage.getFlashcardDecks();
      res.json(decks);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch decks", error: error.message });
    }
  });

  app.get("/api/flashcard-decks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deck = await storage.getFlashcardDeck(id);
      if (!deck) {
        return res.status(404).json({ message: "Deck not found" });
      }
      res.json(deck);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch deck", error: error.message });
    }
  });

  app.post("/api/flashcard-decks", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFlashcardDeckSchema.parse(req.body);
      const deck = await storage.createFlashcardDeck(validatedData);
      res.status(201).json(deck);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create deck", error: error.message });
    }
  });

  app.patch("/api/flashcard-decks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedDeck = await storage.updateFlashcardDeck(id, req.body);
      if (!updatedDeck) {
        return res.status(404).json({ message: "Deck not found" });
      }
      res.json(updatedDeck);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update deck", error: error.message });
    }
  });

  app.delete("/api/flashcard-decks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFlashcardDeck(id);
      if (!deleted) {
        return res.status(404).json({ message: "Deck not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete deck", error: error.message });
    }
  });

  // Flashcards API
  app.get("/api/flashcard-decks/:deckId/flashcards", async (req: Request, res: Response) => {
    try {
      const deckId = parseInt(req.params.deckId);
      const flashcards = await storage.getFlashcards(deckId);
      res.json(flashcards);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch flashcards", error: error.message });
    }
  });

  app.get("/api/flashcards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const flashcard = await storage.getFlashcard(id);
      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }
      res.json(flashcard);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch flashcard", error: error.message });
    }
  });

  app.post("/api/flashcards", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFlashcardSchema.parse(req.body);
      const flashcard = await storage.createFlashcard(validatedData);
      res.status(201).json(flashcard);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create flashcard", error: error.message });
    }
  });

  app.patch("/api/flashcards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedFlashcard = await storage.updateFlashcard(id, req.body);
      if (!updatedFlashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }
      res.json(updatedFlashcard);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update flashcard", error: error.message });
    }
  });

  app.delete("/api/flashcards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFlashcard(id);
      if (!deleted) {
        return res.status(404).json({ message: "Flashcard not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete flashcard", error: error.message });
    }
  });

  // Tasks API
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
    }
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch task", error: error.message });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create task", error: error.message });
    }
  });

  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedTask = await storage.updateTask(id, req.body);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(updatedTask);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update task", error: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete task", error: error.message });
    }
  });

  // Study Sessions API
  app.get("/api/study-sessions", async (req: Request, res: Response) => {
    try {
      const sessions = await storage.getStudySessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch study sessions", error: error.message });
    }
  });

  app.get("/api/study-sessions/stats", async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const stats = await storage.getStudyStats(days);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch study stats", error: error.message });
    }
  });

  app.post("/api/study-sessions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(validatedData);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create study session", error: error.message });
    }
  });

  // Study Events API
  app.get("/api/study-events", async (req: Request, res: Response) => {
    try {
      const events = await storage.getStudyEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch study events", error: error.message });
    }
  });

  app.post("/api/study-events", async (req: Request, res: Response) => {
    try {
      const validatedData = insertStudyEventSchema.parse(req.body);
      const event = await storage.createStudyEvent(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create study event", error: error.message });
    }
  });

  // Files API
  app.get("/api/files", async (req: Request, res: Response) => {
    try {
      const files = await storage.getFiles();
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch files", error: error.message });
    }
  });

  app.post("/api/files", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileData = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype,
        category: req.body.category || 'general',
      };

      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to upload file", error: error.message });
    }
  });

  app.delete("/api/files/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFile(id);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete file", error: error.message });
    }
  });

  // Mind Maps API
  app.get("/api/mind-maps", async (req: Request, res: Response) => {
    try {
      const mindMaps = await storage.getMindMaps();
      res.json(mindMaps);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch mind maps", error: error.message });
    }
  });

  app.get("/api/mind-maps/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const mindMap = await storage.getMindMap(id);
      if (!mindMap) {
        return res.status(404).json({ message: "Mind map not found" });
      }
      res.json(mindMap);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch mind map", error: error.message });
    }
  });

  app.post("/api/mind-maps", async (req: Request, res: Response) => {
    try {
      const validatedData = insertMindMapSchema.parse(req.body);
      const mindMap = await storage.createMindMap(validatedData);
      res.status(201).json(mindMap);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create mind map", error: error.message });
    }
  });

  app.patch("/api/mind-maps/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedMindMap = await storage.updateMindMap(id, req.body);
      if (!updatedMindMap) {
        return res.status(404).json({ message: "Mind map not found" });
      }
      res.json(updatedMindMap);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update mind map", error: error.message });
    }
  });

  app.delete("/api/mind-maps/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMindMap(id);
      if (!deleted) {
        return res.status(404).json({ message: "Mind map not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete mind map", error: error.message });
    }
  });

  // Chat Rooms API
  app.get("/api/chat-rooms", async (req: Request, res: Response) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch chat rooms", error: error.message });
    }
  });

  app.post("/api/chat-rooms", async (req: Request, res: Response) => {
    try {
      const validatedData = insertChatRoomSchema.parse(req.body);
      const room = await storage.createChatRoom(validatedData);
      res.status(201).json(room);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create chat room", error: error.message });
    }
  });

  // Chat Messages API
  app.get("/api/chat-rooms/:roomId/messages", async (req: Request, res: Response) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const messages = limit 
        ? await storage.getRecentMessages(roomId, limit)
        : await storage.getChatMessages(roomId);
      
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch messages", error: error.message });
    }
  });

  app.post("/api/chat-rooms/:roomId/messages", async (req: Request, res: Response) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const validatedData = insertChatMessageSchema.parse({ ...req.body, roomId });
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to send message", error: error.message });
    }
  });

  // Quizzes API
  app.get("/api/quizzes", async (req: Request, res: Response) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch quizzes", error: error.message });
    }
  });

  app.get("/api/quizzes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch quiz", error: error.message });
    }
  });

  app.post("/api/quizzes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(validatedData);
      res.status(201).json(quiz);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create quiz", error: error.message });
    }
  });

  app.post("/api/quizzes/:id/attempts", async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.id);
      const validatedData = insertQuizAttemptSchema.parse({ ...req.body, quizId });
      const attempt = await storage.createQuizAttempt(validatedData);
      res.status(201).json(attempt);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create quiz attempt", error: error.message });
    }
  });

  app.get("/api/quizzes/:id/attempts", async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.id);
      const attempts = await storage.getQuizAttempts(quizId);
      res.json(attempts);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch quiz attempts", error: error.message });
    }
  });

  // Achievements API
  app.get("/api/achievements/:userId", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const achievements = await storage.getAchievements(userId);
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch achievements", error: error.message });
    }
  });

  app.get("/api/achievements", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string || "user1";
      const achievements = await storage.getAchievements(userId);
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch achievements", error: error.message });
    }
  });

  app.post("/api/achievements", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(validatedData);
      res.status(201).json(achievement);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create achievement", error: error.message });
    }
  });

  // Analytics API
  app.get("/api/analytics/:userId", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const days = req.query.days ? parseInt(req.query.days as string) : undefined;
      const analytics = await storage.getAnalytics(userId, days);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
    }
  });

  app.get("/api/analytics", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string || "user1";
      const days = req.query.days ? parseInt(req.query.days as string) : undefined;
      const analytics = await storage.getAnalytics(userId, days);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
    }
  });

  app.get("/api/quiz-attempts", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string || "user1";
      const attempts = await storage.getUserQuizAttempts(userId);
      res.json(attempts);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch quiz attempts", error: error.message });
    }
  });

  app.post("/api/analytics", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAnalyticsSchema.parse(req.body);
      const analytic = await storage.createAnalytic(validatedData);
      res.status(201).json(analytic);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create analytic", error: error.message });
    }
  });

  // AI Integration Routes
  app.post("/api/ai/generate-flashcards", async (req: Request, res: Response) => {
    try {
      const { content, count = 10 } = req.body;
      const flashcards = await aiService.generateFlashcards(content, count);
      res.json({ flashcards });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to generate flashcards", error: error.message });
    }
  });

  app.post("/api/ai/generate-quiz", async (req: Request, res: Response) => {
    try {
      const { content, questionCount = 10, difficulty = 'medium' } = req.body;
      const questions = await aiService.generateQuiz(content, questionCount, difficulty);
      res.json({ questions });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to generate quiz", error: error.message });
    }
  });

  app.post("/api/ai/summarize", async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const summary = await aiService.summarizeContent(content);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to summarize content", error: error.message });
    }
  });

  app.post("/api/ai/answer-question", async (req: Request, res: Response) => {
    try {
      const { question, context } = req.body;
      const answer = await aiService.answerQuestion(question, context);
      res.json({ answer });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to answer question", error: error.message });
    }
  });

  app.post("/api/ai/extract-text", async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      const text = await aiService.extractTextFromImage(image);
      res.json({ text });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to extract text", error: error.message });
    }
  });

  app.post("/api/ai/recommendations", async (req: Request, res: Response) => {
    try {
      const { analytics } = req.body;
      const recommendations = await aiService.generateRecommendations(analytics);
      res.json({ recommendations });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to generate recommendations", error: error.message });
    }
  });

  app.post("/api/ai/analyze-patterns", async (req: Request, res: Response) => {
    try {
      const { sessions } = req.body;
      const analysis = await aiService.analyzeStudyPatterns(sessions);
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to analyze patterns", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}