import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIQuestion {
  question: string;
  options?: string[];
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
}

export interface AIFlashcard {
  front: string;
  back: string;
  difficulty: number;
}

export interface AISummary {
  summary: string;
  keyPoints: string[];
  concepts: string[];
}

export interface AIRecommendation {
  type: 'study_plan' | 'weakness_focus' | 'break_reminder' | 'resource';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export class AIService {
  
  // Generate flashcards from text content
  async generateFlashcards(content: string, count: number = 10): Promise<AIFlashcard[]> {
    try {
      const prompt = `Generate ${count} educational flashcards from the following content. 
      Return them as a JSON array with objects containing "front" (question), "back" (answer), and "difficulty" (1-5).
      Make the questions clear and the answers concise but complete.
      
      Content: ${content}
      
      Format: [{"front": "question", "back": "answer", "difficulty": 3}]`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"flashcards": []}');
      return result.flashcards || [];
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
      throw new Error('Failed to generate AI flashcards');
    }
  }

  // Generate quiz questions from content
  async generateQuiz(content: string, questionCount: number = 10, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<AIQuestion[]> {
    try {
      const prompt = `Generate ${questionCount} ${difficulty} quiz questions from the following content.
      Include a mix of multiple choice, true/false, and short answer questions.
      Return as JSON with this format:
      
      Content: ${content}
      
      Format: {
        "questions": [
          {
            "question": "What is...",
            "options": ["A", "B", "C", "D"], // only for multiple choice
            "type": "multiple_choice",
            "difficulty": "${difficulty}",
            "subject": "derived from content",
            "correctAnswer": "A" // for reference
          }
        ]
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
      return result.questions || [];
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      throw new Error('Failed to generate AI quiz');
    }
  }

  // Summarize text content
  async summarizeContent(content: string): Promise<AISummary> {
    try {
      const prompt = `Analyze and summarize the following content. Provide:
      1. A concise summary (2-3 sentences)
      2. Key points (bullet points)
      3. Main concepts/topics covered
      
      Content: ${content}
      
      Return as JSON: {
        "summary": "brief summary",
        "keyPoints": ["point 1", "point 2"],
        "concepts": ["concept 1", "concept 2"]
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        summary: result.summary || '',
        keyPoints: result.keyPoints || [],
        concepts: result.concepts || []
      };
    } catch (error) {
      console.error('Failed to summarize content:', error);
      throw new Error('Failed to generate AI summary');
    }
  }

  // Answer questions about content
  async answerQuestion(question: string, context: string): Promise<string> {
    try {
      const prompt = `Based on the following context, answer the question clearly and accurately.
      If the answer cannot be found in the context, say so.
      
      Context: ${context}
      
      Question: ${question}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });

      return response.choices[0].message.content || 'I could not generate an answer.';
    } catch (error) {
      console.error('Failed to answer question:', error);
      throw new Error('Failed to generate AI answer');
    }
  }

  // Extract text from images using OCR
  async extractTextFromImage(base64Image: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract and transcribe all text from this image. Maintain formatting and structure as much as possible."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 4000,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Failed to extract text from image:', error);
      throw new Error('Failed to perform OCR');
    }
  }

  // Generate study recommendations based on analytics
  async generateRecommendations(analytics: {
    studyTime: number;
    weaknessAreas: string[];
    strengthAreas: string[];
    recentPerformance: number[];
  }): Promise<AIRecommendation[]> {
    try {
      const prompt = `Based on the following study analytics, generate personalized study recommendations.
      
      Analytics:
      - Weekly study time: ${analytics.studyTime} minutes
      - Weakness areas: ${analytics.weaknessAreas.join(', ')}
      - Strength areas: ${analytics.strengthAreas.join(', ')}
      - Recent performance scores: ${analytics.recentPerformance.join(', ')}
      
      Provide 3-5 actionable recommendations as JSON:
      {
        "recommendations": [
          {
            "type": "study_plan",
            "title": "Focus on weak areas",
            "description": "specific advice",
            "priority": "high",
            "actionable": true
          }
        ]
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  // Analyze study patterns and detect issues
  async analyzeStudyPatterns(sessions: any[]): Promise<{
    insights: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    try {
      const prompt = `Analyze these study session patterns and provide insights:
      
      Sessions: ${JSON.stringify(sessions.slice(-20))} // last 20 sessions
      
      Return analysis as JSON:
      {
        "insights": ["pattern observation 1", "pattern observation 2"],
        "warnings": ["potential issue 1", "potential issue 2"],
        "suggestions": ["improvement suggestion 1", "improvement suggestion 2"]
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        insights: result.insights || [],
        warnings: result.warnings || [],
        suggestions: result.suggestions || []
      };
    } catch (error) {
      console.error('Failed to analyze study patterns:', error);
      return { insights: [], warnings: [], suggestions: [] };
    }
  }
}

export const aiService = new AIService();