import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Quiz, InsertQuiz, QuizAttempt, InsertQuizAttempt } from "@shared/schema";
import { Brain, Plus, Play, Clock, Trophy, Target, Zap, BookOpen, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  question: string;
  options?: string[];
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  difficulty: 'easy' | 'medium' | 'hard';
  correctAnswer?: string;
}

function CreateQuizDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [createMethod, setCreateMethod] = useState<"manual" | "ai">("manual");
  const [aiContent, setAiContent] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const aiGenerateMutation = useMutation({
    mutationFn: async (data: { content: string; questionCount: number; difficulty: string }) => {
      return await apiRequest("/api/ai/generate-quiz", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: { questions: QuizQuestion[] }) => {
      setQuestions(data.questions || []);
      toast({ title: "Quiz questions generated successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to generate questions", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertQuiz) => {
      return await apiRequest("/api/quizzes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      setOpen(false);
      resetForm();
      toast({ title: "Quiz created successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create quiz", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setDifficulty("medium");
    setTimeLimit(undefined);
    setQuestions([]);
    setCreateMethod("manual");
    setAiContent("");
    setAiQuestionCount(10);
  };

  const addManualQuestion = () => {
    setQuestions([...questions, {
      question: "",
      type: "multiple_choice",
      difficulty: "medium",
      options: ["", "", "", ""]
    }]);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map((q, i) => i === index ? { ...q, ...updates } : q));
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const generateAIQuestions = () => {
    if (!aiContent.trim()) return;
    aiGenerateMutation.mutate({
      content: aiContent,
      questionCount: aiQuestionCount,
      difficulty
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) return;

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      difficulty,
      timeLimit,
      questions,
      aiGenerated: createMethod === "ai"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title..."
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Math, Science, History..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the quiz..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={timeLimit || ""}
                onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Optional"
                min={1}
              />
            </div>
          </div>

          <Tabs value={createMethod} onValueChange={(value: "manual" | "ai") => setCreateMethod(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Creation</TabsTrigger>
              <TabsTrigger value="ai">AI Generation</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Questions ({questions.length})</Label>
                <Button type="button" onClick={addManualQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Question {index + 1}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                          >
                            Remove
                          </Button>
                        </div>
                        <Input
                          value={question.question}
                          onChange={(e) => updateQuestion(index, { question: e.target.value })}
                          placeholder="Enter question..."
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={question.type}
                            onValueChange={(value: "multiple_choice" | "true_false" | "short_answer") =>
                              updateQuestion(index, { type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="true_false">True/False</SelectItem>
                              <SelectItem value="short_answer">Short Answer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={question.difficulty}
                            onValueChange={(value: "easy" | "medium" | "hard") =>
                              updateQuestion(index, { difficulty: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {question.type === "multiple_choice" && (
                          <div className="space-y-2">
                            <Label className="text-sm">Options</Label>
                            {question.options?.map((option, optionIndex) => (
                              <Input
                                key={optionIndex}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion(index, { options: newOptions });
                                }}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <div>
                <Label htmlFor="aiContent">Content to Generate Questions From *</Label>
                <Textarea
                  id="aiContent"
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  placeholder="Paste your study material, notes, or textbook content here..."
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  value={aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(parseInt(e.target.value) || 10)}
                  min={1}
                  max={50}
                />
              </div>
              <Button
                type="button"
                onClick={generateAIQuestions}
                disabled={!aiContent.trim() || aiGenerateMutation.isPending}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                {aiGenerateMutation.isPending ? "Generating..." : "Generate Questions with AI"}
              </Button>
              {questions.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Generated {questions.length} questions. You can review and edit them before creating the quiz.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Button 
            type="submit" 
            disabled={createMutation.isPending || !title.trim() || questions.length === 0}
            className="w-full"
          >
            {createMutation.isPending ? "Creating..." : "Create Quiz"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QuizTaker({ quiz, onComplete }: { quiz: Quiz; onComplete: () => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const questions = quiz.questions as QuizQuestion[];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const submitMutation = useMutation({
    mutationFn: async (attempt: InsertQuizAttempt) => {
      return await apiRequest(`/api/quizzes/${quiz.id}/attempts`, {
        method: "POST",
        body: JSON.stringify(attempt),
      });
    },
    onSuccess: () => {
      toast({ title: "Quiz submitted successfully!" });
      onComplete();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit quiz", 
        description: error.message,
        variant: "destructive" 
      });
      setIsSubmitting(false);
    },
  });

  // Timer effect
  useState(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    setIsSubmitting(true);
    
    // Calculate score (simplified scoring)
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (question.correctAnswer && userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;

    submitMutation.mutate({
      quizId: quiz.id,
      userId: "current-user", // This would be the actual user ID
      answers,
      score,
      timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60 - (timeLeft || 0)) : undefined
    });
  };

  if (isSubmitting || submitMutation.isPending) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Submitting your quiz...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-muted-foreground">{quiz.description}</p>
          )}
        </div>
        {timeLeft !== null && (
          <Badge variant={timeLeft < 300 ? "destructive" : "secondary"}>
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(timeLeft)}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{currentQuestion.difficulty}</Badge>
            <Badge variant="outline">{currentQuestion.type.replace('_', ' ')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.type === "multiple_choice" && (
            <RadioGroup
              value={answers[currentQuestionIndex] || ""}
              onValueChange={handleAnswerChange}
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === "true_false" && (
            <RadioGroup
              value={answers[currentQuestionIndex] || ""}
              onValueChange={handleAnswerChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false">False</Label>
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === "short_answer" && (
            <Textarea
              value={answers[currentQuestionIndex] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your answer..."
              rows={3}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors
                ${index === currentQuestionIndex 
                  ? 'bg-primary text-primary-foreground' 
                  : answers[index] 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-muted text-muted-foreground'
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button onClick={submitQuiz}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={nextQuestion}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Quizzes() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "take">("list");

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  const { data: attempts } = useQuery({
    queryKey: ["/api/quiz-attempts", "current-user"],
    enabled: !!selectedQuiz,
  });

  if (selectedQuiz && viewMode === "take") {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedQuiz(null);
            setViewMode("list");
          }}
          className="mb-6"
        >
          ← Back to Quizzes
        </Button>
        <QuizTaker 
          quiz={selectedQuiz} 
          onComplete={() => {
            setSelectedQuiz(null);
            setViewMode("list");
          }} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Quizzes
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge with interactive quizzes
          </p>
        </div>
        <CreateQuizDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </CreateQuizDialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !quizzes?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quizzes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first quiz to start testing your knowledge
            </p>
            <CreateQuizDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </CreateQuizDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz: Quiz) => {
            const questions = quiz.questions as QuizQuestion[];
            const questionCount = questions?.length || 0;
            
            return (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate">{quiz.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      {quiz.aiGenerated && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {quiz.difficulty}
                      </Badge>
                    </div>
                  </div>
                  {quiz.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {questionCount} question{questionCount !== 1 ? 's' : ''}
                    </span>
                    {quiz.timeLimit && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {quiz.timeLimit} min
                      </span>
                    )}
                  </div>
                  {quiz.category && (
                    <Badge variant="outline" className="text-xs">
                      {quiz.category}
                    </Badge>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setViewMode("take");
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}