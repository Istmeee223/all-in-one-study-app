import {
  notes,
  flashcardDecks,
  flashcards,
  tasks,
  studySessions,
  studyEvents,
  files,
  mindMaps,
  chatRooms,
  chatMessages,
  quizzes,
  quizAttempts,
  achievements,
  analytics,
  type Note,
  type InsertNote,
  type FlashcardDeck,
  type InsertFlashcardDeck,
  type Flashcard,
  type InsertFlashcard,
  type Task,
  type InsertTask,
  type StudySession,
  type InsertStudySession,
  type StudyEvent,
  type InsertStudyEvent,
  type StudyFile,
  type InsertStudyFile,
  type MindMap,
  type InsertMindMap,
  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type Quiz,
  type InsertQuiz,
  type QuizAttempt,
  type InsertQuizAttempt,
  type Achievement,
  type InsertAchievement,
  type Analytics,
  type InsertAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Notes
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  searchNotes(query: string): Promise<Note[]>;

  // Flashcard Decks
  getFlashcardDecks(): Promise<FlashcardDeck[]>;
  getFlashcardDeck(id: number): Promise<FlashcardDeck | undefined>;
  createFlashcardDeck(deck: InsertFlashcardDeck): Promise<FlashcardDeck>;
  updateFlashcardDeck(id: number, deck: Partial<InsertFlashcardDeck>): Promise<FlashcardDeck | undefined>;
  deleteFlashcardDeck(id: number): Promise<boolean>;

  // Flashcards
  getFlashcards(deckId: number): Promise<Flashcard[]>;
  getFlashcard(id: number): Promise<Flashcard | undefined>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: number, flashcard: Partial<Flashcard>): Promise<Flashcard | undefined>;
  deleteFlashcard(id: number): Promise<boolean>;
  getFlashcardsForReview(deckId: number): Promise<Flashcard[]>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByStatus(completed: boolean): Promise<Task[]>;

  // Study Sessions
  getStudySessions(): Promise<StudySession[]>;
  getStudySession(id: number): Promise<StudySession | undefined>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: number, session: Partial<StudySession>): Promise<StudySession | undefined>;
  getStudySessionsToday(): Promise<StudySession[]>;
  getStudyStats(days: number): Promise<{
    totalSessions: number;
    totalTime: number;
    averageSession: number;
  }>;

  // Study Events
  getStudyEvents(): Promise<StudyEvent[]>;
  getStudyEvent(id: number): Promise<StudyEvent | undefined>;
  createStudyEvent(event: InsertStudyEvent): Promise<StudyEvent>;
  updateStudyEvent(id: number, event: Partial<StudyEvent>): Promise<StudyEvent | undefined>;
  deleteStudyEvent(id: number): Promise<boolean>;
  getStudyEventsForDate(date: Date): Promise<StudyEvent[]>;

  // Files
  getFiles(): Promise<StudyFile[]>;
  getFile(id: number): Promise<StudyFile | undefined>;
  createFile(file: InsertStudyFile): Promise<StudyFile>;
  deleteFile(id: number): Promise<boolean>;
  getFilesByCategory(category: string): Promise<StudyFile[]>;

  // Mind Maps
  getMindMaps(): Promise<MindMap[]>;
  getMindMap(id: number): Promise<MindMap | undefined>;
  createMindMap(mindMap: InsertMindMap): Promise<MindMap>;
  updateMindMap(id: number, mindMap: Partial<InsertMindMap>): Promise<MindMap | undefined>;
  deleteMindMap(id: number): Promise<boolean>;

  // Chat Rooms
  getChatRooms(): Promise<ChatRoom[]>;
  getChatRoom(id: number): Promise<ChatRoom | undefined>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  updateChatRoom(id: number, room: Partial<InsertChatRoom>): Promise<ChatRoom | undefined>;
  deleteChatRoom(id: number): Promise<boolean>;

  // Chat Messages
  getChatMessages(roomId: number): Promise<ChatMessage[]>;
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getRecentMessages(roomId: number, limit: number): Promise<ChatMessage[]>;

  // Quizzes
  getQuizzes(): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: number): Promise<boolean>;

  // Quiz Attempts
  getQuizAttempts(quizId: number): Promise<QuizAttempt[]>;
  getQuizAttempt(id: number): Promise<QuizAttempt | undefined>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserQuizAttempts(userId: string): Promise<QuizAttempt[]>;

  // Achievements
  getAchievements(userId: string): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  // Analytics
  getAnalytics(userId: string, days?: number): Promise<Analytics[]>;
  getAnalytic(id: number): Promise<Analytics | undefined>;
  createAnalytic(analytic: InsertAnalytics): Promise<Analytics>;
  updateAnalytic(id: number, analytic: Partial<InsertAnalytics>): Promise<Analytics | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Notes
  async getNotes(): Promise<Note[]> {
    return await db.select().from(notes).orderBy(desc(notes.updatedAt));
  }

  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note || undefined;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db.insert(notes).values(insertNote).returning();
    return note;
  }

  async updateNote(id: number, updateNote: Partial<InsertNote>): Promise<Note | undefined> {
    const [note] = await db
      .update(notes)
      .set({ ...updateNote, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return note || undefined;
  }

  async deleteNote(id: number): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchNotes(query: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(
        like(notes.title, `%${query}%`)
      )
      .orderBy(desc(notes.updatedAt));
  }

  // Flashcard Decks
  async getFlashcardDecks(): Promise<FlashcardDeck[]> {
    return await db.select().from(flashcardDecks).orderBy(desc(flashcardDecks.createdAt));
  }

  async getFlashcardDeck(id: number): Promise<FlashcardDeck | undefined> {
    const [deck] = await db.select().from(flashcardDecks).where(eq(flashcardDecks.id, id));
    return deck || undefined;
  }

  async createFlashcardDeck(insertDeck: InsertFlashcardDeck): Promise<FlashcardDeck> {
    const [deck] = await db.insert(flashcardDecks).values(insertDeck).returning();
    return deck;
  }

  async updateFlashcardDeck(id: number, updateDeck: Partial<InsertFlashcardDeck>): Promise<FlashcardDeck | undefined> {
    const [deck] = await db
      .update(flashcardDecks)
      .set(updateDeck)
      .where(eq(flashcardDecks.id, id))
      .returning();
    return deck || undefined;
  }

  async deleteFlashcardDeck(id: number): Promise<boolean> {
    const result = await db.delete(flashcardDecks).where(eq(flashcardDecks.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Flashcards
  async getFlashcards(deckId: number): Promise<Flashcard[]> {
    return await db.select().from(flashcards).where(eq(flashcards.deckId, deckId));
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    const [flashcard] = await db.select().from(flashcards).where(eq(flashcards.id, id));
    return flashcard || undefined;
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const [flashcard] = await db.insert(flashcards).values(insertFlashcard).returning();
    return flashcard;
  }

  async updateFlashcard(id: number, updateFlashcard: Partial<Flashcard>): Promise<Flashcard | undefined> {
    const [flashcard] = await db
      .update(flashcards)
      .set(updateFlashcard)
      .where(eq(flashcards.id, id))
      .returning();
    return flashcard || undefined;
  }

  async deleteFlashcard(id: number): Promise<boolean> {
    const result = await db.delete(flashcards).where(eq(flashcards.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getFlashcardsForReview(deckId: number): Promise<Flashcard[]> {
    const now = new Date();
    return await db
      .select()
      .from(flashcards)
      .where(
        and(
          eq(flashcards.deckId, deckId),
          lte(flashcards.nextReview, now)
        )
      );
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, updateTask: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updateTask)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getTasksByStatus(completed: boolean): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.completed, completed));
  }

  // Study Sessions
  async getStudySessions(): Promise<StudySession[]> {
    return await db.select().from(studySessions).orderBy(desc(studySessions.startedAt));
  }

  async getStudySession(id: number): Promise<StudySession | undefined> {
    const [session] = await db.select().from(studySessions).where(eq(studySessions.id, id));
    return session || undefined;
  }

  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const [session] = await db.insert(studySessions).values(insertSession).returning();
    return session;
  }

  async updateStudySession(id: number, updateSession: Partial<StudySession>): Promise<StudySession | undefined> {
    const [session] = await db
      .update(studySessions)
      .set(updateSession)
      .where(eq(studySessions.id, id))
      .returning();
    return session || undefined;
  }

  async getStudySessionsToday(): Promise<StudySession[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await db
      .select()
      .from(studySessions)
      .where(gte(studySessions.startedAt, today));
  }

  async getStudyStats(days: number): Promise<{
    totalSessions: number;
    totalTime: number;
    averageSession: number;
  }> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const sessions = await db
      .select()
      .from(studySessions)
      .where(gte(studySessions.startedAt, since));

    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSession = totalSessions > 0 ? totalTime / totalSessions : 0;

    return { totalSessions, totalTime, averageSession };
  }

  // Study Events
  async getStudyEvents(): Promise<StudyEvent[]> {
    return await db.select().from(studyEvents).orderBy(studyEvents.startTime);
  }

  async getStudyEvent(id: number): Promise<StudyEvent | undefined> {
    const [event] = await db.select().from(studyEvents).where(eq(studyEvents.id, id));
    return event || undefined;
  }

  async createStudyEvent(insertEvent: InsertStudyEvent): Promise<StudyEvent> {
    const [event] = await db.insert(studyEvents).values(insertEvent).returning();
    return event;
  }

  async updateStudyEvent(id: number, updateEvent: Partial<StudyEvent>): Promise<StudyEvent | undefined> {
    const [event] = await db
      .update(studyEvents)
      .set(updateEvent)
      .where(eq(studyEvents.id, id))
      .returning();
    return event || undefined;
  }

  async deleteStudyEvent(id: number): Promise<boolean> {
    const result = await db.delete(studyEvents).where(eq(studyEvents.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getStudyEventsForDate(date: Date): Promise<StudyEvent[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(studyEvents)
      .where(
        and(
          gte(studyEvents.startTime, startOfDay),
          lte(studyEvents.startTime, endOfDay)
        )
      );
  }

  // Files
  async getFiles(): Promise<StudyFile[]> {
    return await db.select().from(files).orderBy(desc(files.uploadedAt));
  }

  async getFile(id: number): Promise<StudyFile | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async createFile(insertFile: InsertStudyFile): Promise<StudyFile> {
    const [file] = await db.insert(files).values(insertFile).returning();
    return file;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getFilesByCategory(category: string): Promise<StudyFile[]> {
    return await db.select().from(files).where(eq(files.category, category));
  }

  // Mind Maps
  async getMindMaps(): Promise<MindMap[]> {
    return await db.select().from(mindMaps).orderBy(desc(mindMaps.createdAt));
  }

  async getMindMap(id: number): Promise<MindMap | undefined> {
    const [mindMap] = await db.select().from(mindMaps).where(eq(mindMaps.id, id));
    return mindMap || undefined;
  }

  async createMindMap(insertMindMap: InsertMindMap): Promise<MindMap> {
    const [mindMap] = await db.insert(mindMaps).values(insertMindMap).returning();
    return mindMap;
  }

  async updateMindMap(id: number, updateMindMap: Partial<InsertMindMap>): Promise<MindMap | undefined> {
    const [mindMap] = await db
      .update(mindMaps)
      .set({ ...updateMindMap, updatedAt: new Date() })
      .where(eq(mindMaps.id, id))
      .returning();
    return mindMap || undefined;
  }

  async deleteMindMap(id: number): Promise<boolean> {
    const result = await db.delete(mindMaps).where(eq(mindMaps.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Chat Rooms
  async getChatRooms(): Promise<ChatRoom[]> {
    return await db.select().from(chatRooms).orderBy(desc(chatRooms.createdAt));
  }

  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room || undefined;
  }

  async createChatRoom(insertRoom: InsertChatRoom): Promise<ChatRoom> {
    const [room] = await db.insert(chatRooms).values(insertRoom).returning();
    return room;
  }

  async updateChatRoom(id: number, updateRoom: Partial<InsertChatRoom>): Promise<ChatRoom | undefined> {
    const [room] = await db
      .update(chatRooms)
      .set(updateRoom)
      .where(eq(chatRooms.id, id))
      .returning();
    return room || undefined;
  }

  async deleteChatRoom(id: number): Promise<boolean> {
    const result = await db.delete(chatRooms).where(eq(chatRooms.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Chat Messages
  async getChatMessages(roomId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(chatMessages.createdAt);
  }

  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return message || undefined;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  async getRecentMessages(roomId: number, limit: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz || undefined;
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db.insert(quizzes).values(insertQuiz).returning();
    return quiz;
  }

  async updateQuiz(id: number, updateQuiz: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const [quiz] = await db
      .update(quizzes)
      .set(updateQuiz)
      .where(eq(quizzes.id, id))
      .returning();
    return quiz || undefined;
  }

  async deleteQuiz(id: number): Promise<boolean> {
    const result = await db.delete(quizzes).where(eq(quizzes.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Quiz Attempts
  async getQuizAttempts(quizId: number): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.quizId, quizId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  async getQuizAttempt(id: number): Promise<QuizAttempt | undefined> {
    const [attempt] = await db.select().from(quizAttempts).where(eq(quizAttempts.id, id));
    return attempt || undefined;
  }

  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [attempt] = await db.insert(quizAttempts).values(insertAttempt).returning();
    return attempt;
  }

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  // Achievements
  async getAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement || undefined;
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(insertAchievement).returning();
    return achievement;
  }

  // Analytics
  async getAnalytics(userId: string, days?: number): Promise<Analytics[]> {
    let query = db.select().from(analytics).where(eq(analytics.userId, userId));
    
    if (days) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      query = query.where(gte(analytics.date, since));
    }

    return await query.orderBy(desc(analytics.date));
  }

  async getAnalytic(id: number): Promise<Analytics | undefined> {
    const [analytic] = await db.select().from(analytics).where(eq(analytics.id, id));
    return analytic || undefined;
  }

  async createAnalytic(insertAnalytic: InsertAnalytics): Promise<Analytics> {
    const [analytic] = await db.insert(analytics).values(insertAnalytic).returning();
    return analytic;
  }

  async updateAnalytic(id: number, updateAnalytic: Partial<InsertAnalytics>): Promise<Analytics | undefined> {
    const [analytic] = await db
      .update(analytics)
      .set(updateAnalytic)
      .where(eq(analytics.id, id))
      .returning();
    return analytic || undefined;
  }
}

export const storage = new DatabaseStorage();