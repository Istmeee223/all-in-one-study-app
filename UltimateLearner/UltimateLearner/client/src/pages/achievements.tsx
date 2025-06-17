import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Calendar, Brain, BookOpen, Clock, Zap, Star, Award, Medal } from "lucide-react";

export default function Achievements() {
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");

  const { data: achievements, isLoading, error } = useQuery({
    queryKey: ["/api/achievements", "current-user"],
  });

  // Use real data if available, otherwise fallback to mock
  const achievementList = achievements ?? mockAchievements;

  // Mock achievements data
  const mockAchievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first study session",
      icon: "star",
      category: "getting_started",
      difficulty: "bronze",
      points: 50,
      earned: true,
      earnedAt: new Date("2024-01-15"),
      progress: 100,
      requirement: "Complete 1 study session"
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Study for 7 consecutive days",
      icon: "calendar",
      category: "consistency",
      difficulty: "gold",
      points: 200,
      earned: true,
      earnedAt: new Date("2024-01-22"),
      progress: 100,
      requirement: "Study 7 consecutive days"
    },
    {
      id: 3,
      title: "Quiz Master",
      description: "Score 90%+ on 5 consecutive quizzes",
      icon: "brain",
      category: "performance",
      difficulty: "silver",
      points: 150,
      earned: true,
      earnedAt: new Date("2024-01-20"),
      progress: 100,
      requirement: "Score 90%+ on 5 quizzes in a row"
    },
    {
      id: 4,
      title: "Mind Map Explorer",
      description: "Create your first collaborative mind map",
      icon: "brain",
      category: "collaboration",
      difficulty: "bronze",
      points: 75,
      earned: true,
      earnedAt: new Date("2024-01-18"),
      progress: 100,
      requirement: "Create 1 collaborative mind map"
    },
    {
      id: 5,
      title: "Marathon Runner",
      description: "Study for 5 hours in a single day",
      icon: "clock",
      category: "endurance",
      difficulty: "silver",
      points: 150,
      earned: false,
      progress: 75,
      requirement: "Study 5 hours in one day"
    },
    {
      id: 6,
      title: "Perfect Score",
      description: "Get 100% on 3 different subjects",
      icon: "target",
      category: "performance",
      difficulty: "gold",
      points: 300,
      earned: false,
      progress: 33,
      requirement: "Score 100% in 3 different subjects"
    },
    {
      id: 7,
      title: "Knowledge Vault",
      description: "Create 100 flashcards",
      icon: "book",
      category: "content",
      difficulty: "silver",
      points: 125,
      earned: false,
      progress: 60,
      requirement: "Create 100 flashcards"
    },
    {
      id: 8,
      title: "Speed Demon",
      description: "Complete a quiz in under 2 minutes with 85%+ score",
      icon: "zap",
      category: "speed",
      difficulty: "gold",
      points: 250,
      earned: false,
      progress: 0,
      requirement: "Complete quiz in <2 min with 85%+ score"
    },
    {
      id: 9,
      title: "Month Master",
      description: "Study every day for 30 days",
      icon: "calendar",
      category: "consistency",
      difficulty: "platinum",
      points: 500,
      earned: false,
      progress: 23,
      requirement: "Study 30 consecutive days"
    },
    {
      id: 10,
      title: "AI Collaborator",
      description: "Generate 50 AI-powered quizzes",
      icon: "zap",
      category: "ai",
      difficulty: "silver",
      points: 175,
      earned: false,
      progress: 20,
      requirement: "Generate 50 AI quizzes"
    }
  ];

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      star: Star,
      calendar: Calendar,
      brain: Brain,
      target: Target,
      clock: Clock,
      zap: Zap,
      book: BookOpen,
      trophy: Trophy
    };
    return icons[iconName] || Trophy;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      bronze: "text-amber-600 bg-amber-100 dark:bg-amber-900/20",
      silver: "text-gray-600 bg-gray-100 dark:bg-gray-900/20",
      gold: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
      platinum: "text-purple-600 bg-purple-100 dark:bg-purple-900/20"
    };
    return colors[difficulty as keyof typeof colors] || colors.bronze;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      getting_started: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      consistency: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      performance: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      collaboration: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      endurance: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      content: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
      speed: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300",
      ai: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300"
    };
    return colors[category as keyof typeof colors] || colors.getting_started;
  };

  const filteredAchievements = achievementList.filter(achievement => {
    if (filter === "earned") return achievement.earned;
    if (filter === "locked") return !achievement.earned;
    return true;
  });

  const stats = {
    total: achievementList.length,
    earned: achievementList.filter(a => a.earned).length,
    points: achievementList.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0)
  };

  if (isLoading) return <div>Loading achievements...</div>;
  if (error) return <div>Could not load achievements.</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8" />
            Achievements
          </h1>
          <p className="text-muted-foreground">
            Track your learning milestones and unlock rewards
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.earned}/{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.earned / stats.total) * 100)}% complete
            </p>
            <Progress value={(stats.earned / stats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.points.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Achievement points earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Achievement</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">Week Warrior</div>
            <p className="text-xs text-muted-foreground">
              Earned 3 days ago
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" onClick={() => setFilter("all")}>
            All ({mockAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="earned" onClick={() => setFilter("earned")}>
            Earned ({stats.earned})
          </TabsTrigger>
          <TabsTrigger value="locked" onClick={() => setFilter("locked")}>
            Locked ({stats.total - stats.earned})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => {
              const IconComponent = getIcon(achievement.icon);
              const isEarned = achievement.earned;
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`transition-all duration-200 ${
                    isEarned 
                      ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20' 
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${getDifficultyColor(achievement.difficulty)}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getCategoryColor(achievement.category)}
                        >
                          {achievement.category.replace('_', ' ')}
                        </Badge>
                        {isEarned && <Medal className="h-4 w-4 text-yellow-600" />}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <Progress value={achievement.progress} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {achievement.requirement}
                      </span>
                      <Badge variant="secondary">
                        {achievement.points} pts
                      </Badge>
                    </div>

                    {isEarned && achievement.earnedAt && (
                      <div className="text-xs text-muted-foreground">
                        Earned on {achievement.earnedAt.toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="earned">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => {
              const IconComponent = getIcon(achievement.icon);
              
              return (
                <Card 
                  key={achievement.id} 
                  className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${getDifficultyColor(achievement.difficulty)}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getCategoryColor(achievement.category)}
                        >
                          {achievement.category.replace('_', ' ')}
                        </Badge>
                        <Medal className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {achievement.points} points earned
                      </Badge>
                    </div>

                    {achievement.earnedAt && (
                      <div className="text-xs text-muted-foreground">
                        Earned on {achievement.earnedAt.toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="locked">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => {
              const IconComponent = getIcon(achievement.icon);
              
              return (
                <Card 
                  key={achievement.id} 
                  className="opacity-75 hover:opacity-100 transition-opacity"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${getDifficultyColor(achievement.difficulty)}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getCategoryColor(achievement.category)}
                      >
                        {achievement.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <Progress value={achievement.progress} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {achievement.requirement}
                      </span>
                      <Badge variant="outline">
                        {achievement.points} pts
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}