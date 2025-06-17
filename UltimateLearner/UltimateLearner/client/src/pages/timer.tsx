import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTimer } from "@/hooks/use-timer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Play, 
  Pause, 
  RotateCcw,
  Clock,
  Zap,
  BarChart3
} from "lucide-react";
import { formatDuration, POMODORO_DURATIONS } from "@/lib/constants";
import type { InsertStudySession } from "@shared/schema";
import useSound from "use-sound";
import dingSfx from "@/assets/ding.mp3"; // Add a sound file

function HeaderBar() {
  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Focus Timer</h2>
          <p className="text-muted-foreground">Stay focused with the Pomodoro technique</p>
        </div>
      </div>
    </header>
  );
}

function TimerDisplay() {
  const [timerState, timerActions] = useTimer("focus");
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async (session: InsertStudySession) => {
      const response = await apiRequest("POST", "/api/study-sessions", session);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
      toast({ title: "Study session recorded!" });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const response = await apiRequest("PUT", `/api/study-sessions/${id}`, { completed });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
    },
  });

  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  useEffect(() => {
    if (timerState.isCompleted && currentSessionId) {
      updateSessionMutation.mutate({ id: currentSessionId, completed: true });
      setCurrentSessionId(null);
      
      // Show completion notification
      toast({ 
        title: "Session Complete!", 
        description: `Great work! You completed a ${timerState.type} session.`
      });
    }
  }, [timerState.isCompleted, currentSessionId]);

  const handleStart = async () => {
    if (!timerState.isRunning && !currentSessionId) {
      // Create a new session when starting
      try {
        const session = await createSessionMutation.mutateAsync({
          type: timerState.type,
          duration: Math.ceil(timerState.timeLeft / 60), // Convert to minutes
        });
        setCurrentSessionId(session.id);
      } catch (error) {
        toast({ 
          title: "Failed to start session", 
          description: "Please try again",
          variant: "destructive" 
        });
        return;
      }
    }
    timerActions.start();
  };

  const handlePause = () => {
    timerActions.pause();
  };

  const handleReset = () => {
    timerActions.reset();
    if (currentSessionId) {
      // Mark current session as incomplete if resetting
      updateSessionMutation.mutate({ id: currentSessionId, completed: false });
      setCurrentSessionId(null);
    }
  };

  const handlePresetSelect = (minutes: number) => {
    timerActions.setDuration(minutes);
    if (currentSessionId) {
      setCurrentSessionId(null);
    }
  };

  const handleTypeChange = (type: "focus" | "break" | "long_break") => {
    timerActions.setType(type);
    if (currentSessionId) {
      setCurrentSessionId(null);
    }
  };

  const minutes = Math.floor(timerState.timeLeft / 60);
  const seconds = timerState.timeLeft % 60;
  const totalTime = timerState.type === "focus" ? POMODORO_DURATIONS.FOCUS * 60 : 
                   timerState.type === "break" ? POMODORO_DURATIONS.BREAK * 60 : 
                   POMODORO_DURATIONS.LONG_BREAK * 60;
  const progress = ((totalTime - timerState.timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getTypeLabel = () => {
    switch (timerState.type) {
      case "focus": return "Focus Session";
      case "break": return "Short Break";
      case "long_break": return "Long Break";
      default: return "Session";
    }
  };

  const getTypeColor = () => {
    switch (timerState.type) {
      case "focus": return "var(--study-blue)";
      case "break": return "var(--study-green)";
      case "long_break": return "var(--study-purple)";
      default: return "var(--study-blue)";
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-8">
        <div className="text-center">
          <div className="mb-8">
            <div className="relative w-64 h-64 mx-auto mb-6">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke="hsl(var(--border))" 
                  strokeWidth="2" 
                  fill="none" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke={getTypeColor()}
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="timer-circle"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-foreground">
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-lg text-muted-foreground mt-2">{getTypeLabel()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button
              onClick={timerState.isRunning ? handlePause : handleStart}
              className="px-8 py-3 text-lg font-semibold"
              style={{ backgroundColor: getTypeColor() }}
              disabled={timerState.isCompleted}
            >
              {timerState.isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  {currentSessionId ? "Resume" : "Start"}
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              className="px-6 py-3 font-semibold"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <Button
              variant={timerState.type === "focus" ? "default" : "secondary"}
              className="p-4"
              onClick={() => handleTypeChange("focus")}
              disabled={timerState.isRunning}
            >
              <div className="text-center">
                <div className="text-2xl font-bold">{POMODORO_DURATIONS.FOCUS}</div>
                <div className="text-sm">Focus</div>
              </div>
            </Button>
            <Button
              variant={timerState.type === "break" ? "default" : "secondary"}
              className="p-4"
              onClick={() => handleTypeChange("break")}
              disabled={timerState.isRunning}
            >
              <div className="text-center">
                <div className="text-2xl font-bold">{POMODORO_DURATIONS.BREAK}</div>
                <div className="text-sm">Break</div>
              </div>
            </Button>
            <Button
              variant={timerState.type === "long_break" ? "default" : "secondary"}
              className="p-4"
              onClick={() => handleTypeChange("long_break")}
              disabled={timerState.isRunning}
            >
              <div className="text-center">
                <div className="text-2xl font-bold">{POMODORO_DURATIONS.LONG_BREAK}</div>
                <div className="text-sm">Long Break</div>
              </div>
            </Button>
          </div>

          {/* Add this to your Timer UI */}
          <div className="flex gap-2 mb-4">
            <Button onClick={() => handlePresetSelect(25)}>25 min</Button>
            <Button onClick={() => handlePresetSelect(50)}>50 min</Button>
            <Button onClick={() => handlePresetSelect(5)}>5 min break</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimerStats() {
  const { data: todaySessions } = useQuery({
    queryKey: ["/api/study-sessions?type=today"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/study-sessions/stats?days=7"],
  });

  const completedToday = todaySessions?.filter((session: any) => session.completed).length || 0;
  const totalFocusTime = todaySessions?.reduce((total: number, session: any) => 
    session.completed && session.type === "focus" ? total + session.duration : total, 0) || 0;

  const productivity = stats?.totalSessions > 0 ? 
    Math.round((stats.totalTime / (stats.totalSessions * 25)) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">{completedToday}</div>
          <div className="text-sm text-muted-foreground">Sessions Today</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">{formatDuration(totalFocusTime * 60)}</div>
          <div className="text-sm text-muted-foreground">Focus Time</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">{productivity}%</div>
          <div className="text-sm text-muted-foreground">Productivity</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Timer() {
  const [play] = useSound(dingSfx);

  const handleSessionComplete = () => {
    play();
    // ...existing logic
  };

  return (
    <>
      <HeaderBar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <TimerDisplay />
          <TimerStats />
        </div>
      </main>
    </>
  );
}
