import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { Zap, Send, Brain, BookOpen, FileText, MessageSquare, Sparkles, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI study assistant. I can help you with generating study materials, answering questions, creating quizzes, and providing personalized learning recommendations. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("/api/ai/answer-question", {
        method: "POST",
        body: JSON.stringify({
          question: message,
          context: "General study assistance"
        }),
      });
      return response;
    },
    onSuccess: (data: any) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.answer || "I'm here to help with your studies!",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    }
  });

  const questionMutation = useMutation({
    mutationFn: async (data: { question: string; context: string }) => {
      return await apiRequest("/api/ai/answer-question", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Question Answered",
        description: "AI has provided an answer to your question."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get answer. Please try again.",
        variant: "destructive"
      });
    }
  });

  const summarizeMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("/api/ai/summarize", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Content Summarized",
        description: "AI has generated a summary of your content."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to summarize content. Please try again.",
        variant: "destructive"
      });
    }
  });

  const recommendationsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/ai/recommendations", {
        method: "POST",
        body: JSON.stringify({
          totalStudyTime: 1200,
          sessionsCompleted: 15,
          averageScore: 85,
          weakSubjects: ["History", "Literature"],
          studyStreak: 7
        }),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Recommendations Generated",
        description: "AI has created personalized study recommendations."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(chatInput);
    setChatInput("");
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;

    questionMutation.mutate({
      question: questionInput,
      context: contextInput || "General study context"
    });
  };

  const handleSummarize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentInput.trim()) return;

    summarizeMutation.mutate(contentInput);
  };

  const handleGetRecommendations = () => {
    recommendationsMutation.mutate();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Your intelligent study companion powered by AI
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
          <TabsTrigger value="questions">Q&A Helper</TabsTrigger>
          <TabsTrigger value="summarize">Summarizer</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Chat Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {chatMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <Separator />
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  className="flex-1"
                />
                <Button type="submit" disabled={chatMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Question & Answer Helper
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Question</label>
                  <Textarea
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="What would you like to know?"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Context (Optional)</label>
                  <Textarea
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    placeholder="Provide any relevant context or study material..."
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={questionMutation.isPending}>
                  {questionMutation.isPending ? "Getting Answer..." : "Get AI Answer"}
                </Button>
              </form>

              {questionMutation.data && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">AI Answer:</h4>
                  <p className="text-sm">{questionMutation.data.answer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summarize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Summarizer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSummarize} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Content to Summarize</label>
                  <Textarea
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    placeholder="Paste your study material, article, or notes here..."
                    rows={8}
                  />
                </div>
                <Button type="submit" disabled={summarizeMutation.isPending}>
                  {summarizeMutation.isPending ? "Summarizing..." : "Generate Summary"}
                </Button>
              </form>

              {summarizeMutation.data && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Summary:</h4>
                    <p className="text-sm">{summarizeMutation.data.summary}</p>
                  </div>
                  
                  {summarizeMutation.data.keyPoints && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Key Points:</h4>
                      <ul className="text-sm space-y-1">
                        {summarizeMutation.data.keyPoints.map((point: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summarizeMutation.data.concepts && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Key Concepts:</h4>
                      <div className="flex flex-wrap gap-2">
                        {summarizeMutation.data.concepts.map((concept: string, index: number) => (
                          <Badge key={index} variant="outline">{concept}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Personalized Study Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get AI-powered recommendations based on your study patterns and performance.
              </p>
              
              <Button onClick={handleGetRecommendations} disabled={recommendationsMutation.isPending}>
                {recommendationsMutation.isPending ? "Generating..." : "Get Recommendations"}
              </Button>

              {recommendationsMutation.data && (
                <div className="space-y-4">
                  {recommendationsMutation.data.recommendations?.map((rec: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline">{rec.type.replace('_', ' ')}</Badge>
                      </div>
                      <h4 className="font-medium mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Quick AI Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Quiz from Notes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Study Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Optimize Study Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Study Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Study in 25-minute intervals</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Use the Pomodoro Technique for better focus</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">Review before sleeping</p>
                  <p className="text-xs text-green-700 dark:text-green-300">Consolidate memory during rest</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Use active recall</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Test yourself instead of re-reading</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}