import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Clock, Target, TrendingUp, Brain, BookOpen, Trophy, Calendar, Zap, Users } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics", "current-user", timeRange],
  });

  const { data: studySessions } = useQuery({
    queryKey: ["/api/study-sessions"],
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements", "current-user"],
  });

  const { data: quizAttempts } = useQuery({
    queryKey: ["/api/quiz-attempts", "current-user"],
  });

  // Mock data for demo purposes
  const mockStats = {
    totalStudyTime: 2400, // minutes
    sessionsCompleted: 18,
    averageSessionLength: 45,
    streakDays: 7,
    weeklyGoalProgress: 75,
    focusScore: 8.5,
    productivityTrend: "+12%",
    topSubjects: [
      { name: "Mathematics", time: 480, percentage: 32 },
      { name: "Physics", time: 360, percentage: 24 },
      { name: "Chemistry", time: 300, percentage: 20 },
      { name: "Biology", time: 240, percentage: 16 },
      { name: "History", time: 120, percentage: 8 },
    ],
    weeklyData: [
      { day: "Mon", sessions: 3, minutes: 135 },
      { day: "Tue", sessions: 2, minutes: 90 },
      { day: "Wed", sessions: 4, minutes: 180 },
      { day: "Thu", sessions: 2, minutes: 75 },
      { day: "Fri", sessions: 3, minutes: 140 },
      { day: "Sat", sessions: 2, minutes: 85 },
      { day: "Sun", sessions: 2, minutes: 95 },
    ],
    quizPerformance: {
      totalQuizzes: 12,
      averageScore: 85,
      improvement: "+8%",
      bestSubject: "Mathematics",
      weakestSubject: "History"
    },
    mindMapStats: {
      created: 5,
      nodes: 45,
      collaborations: 3
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your learning progress and insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="study">Study Patterns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="goals">Goals & Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(mockStats.totalStudyTime)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{mockStats.productivityTrend}</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.sessionsCompleted}</div>
                <p className="text-xs text-muted-foreground">
                  Avg {mockStats.averageSessionLength} min per session
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.streakDays} days</div>
                <p className="text-xs text-muted-foreground">
                  Keep it up!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.focusScore}/10</div>
                <p className="text-xs text-muted-foreground">
                  Based on session quality
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Goal Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goal Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Study Time Goal</span>
                  <span>{mockStats.weeklyGoalProgress}% complete</span>
                </div>
                <Progress value={mockStats.weeklyGoalProgress} />
              </div>
              <p className="text-sm text-muted-foreground">
                {formatTime(mockStats.totalStudyTime)} of {formatTime(Math.round(mockStats.totalStudyTime / (mockStats.weeklyGoalProgress / 100)))} weekly goal
              </p>
            </CardContent>
          </Card>

          {/* Subject Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStats.topSubjects.map((subject, index) => (
                  <div key={subject.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        {subject.name}
                      </span>
                      <span>{formatTime(subject.time)}</span>
                    </div>
                    <Progress value={subject.percentage} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="study" className="space-y-6">
          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Study Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {mockStats.weeklyData.map((day) => (
                  <div key={day.day} className="text-center space-y-2">
                    <div className="text-xs text-muted-foreground font-medium">{day.day}</div>
                    <div className="h-24 bg-gradient-to-t from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-end justify-center relative">
                      <div 
                        className="bg-blue-500 rounded-b-lg w-full transition-all duration-300"
                        style={{ height: `${(day.minutes / 200) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-xs font-medium text-center">
                          <div>{day.sessions}</div>
                          <div className="text-[10px] opacity-75">sessions</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs">{formatTime(day.minutes)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Study Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Morning (6-12 PM)</span>
                    <Badge variant="secondary">High Focus</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Afternoon (12-6 PM)</span>
                    <Badge variant="outline">Medium Focus</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Evening (6-12 AM)</span>
                    <Badge variant="outline">Low Focus</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Optimal Session Length</span>
                    <span className="font-medium">45-50 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Break Frequency</span>
                    <span className="font-medium">Every 25 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Distraction Level</span>
                    <Badge variant="secondary">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Quiz Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">{mockStats.quizPerformance.totalQuizzes}</div>
                  <div className="text-sm text-muted-foreground">Quizzes Taken</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">{mockStats.quizPerformance.averageScore}%</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                  <Badge variant="secondary" className="text-xs">
                    {mockStats.quizPerformance.improvement} improvement
                  </Badge>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">A-</div>
                  <div className="text-sm text-muted-foreground">Current Grade</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Strongest Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>{mockStats.quizPerformance.bestSubject}</span>
                    <Badge variant="default">92% avg</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Physics</span>
                    <Badge variant="secondary">88% avg</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chemistry</span>
                    <Badge variant="secondary">85% avg</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>{mockStats.quizPerformance.weakestSubject}</span>
                    <Badge variant="outline">72% avg</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Biology</span>
                    <Badge variant="outline">78% avg</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Literature</span>
                    <Badge variant="outline">80% avg</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mind Map Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Mind Map Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">{mockStats.mindMapStats.created}</div>
                  <div className="text-sm text-muted-foreground">Maps Created</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">{mockStats.mindMapStats.nodes}</div>
                  <div className="text-sm text-muted-foreground">Total Nodes</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">{mockStats.mindMapStats.collaborations}</div>
                  <div className="text-sm text-muted-foreground">Collaborations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {/* Current Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Current Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Complete 20 hours study this week</span>
                  <span className="text-sm text-muted-foreground">75% complete</span>
                </div>
                <Progress value={75} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Maintain 7-day study streak</span>
                  <span className="text-sm text-muted-foreground">100% complete</span>
                </div>
                <Progress value={100} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Score 90%+ on next Math quiz</span>
                  <span className="text-sm text-muted-foreground">In progress</span>
                </div>
                <Progress value={60} />
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="font-medium">Week Warrior</div>
                    <div className="text-sm text-muted-foreground">Completed 7 consecutive study days</div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">New!</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium">Quiz Master</div>
                    <div className="text-sm text-muted-foreground">Scored 90%+ on 5 consecutive quizzes</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Brain className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium">Mind Map Explorer</div>
                    <div className="text-sm text-muted-foreground">Created your first collaborative mind map</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">Focus on History</div>
                  <div className="text-sm text-muted-foreground">Your quiz scores in History are below average. Consider reviewing recent notes.</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">Optimize Study Schedule</div>
                  <div className="text-sm text-muted-foreground">You're most productive between 9-11 AM. Try scheduling difficult subjects during this time.</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">Take a Break</div>
                  <div className="text-sm text-muted-foreground">You've been studying consistently for 7 days. Consider a short break to avoid burnout.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}