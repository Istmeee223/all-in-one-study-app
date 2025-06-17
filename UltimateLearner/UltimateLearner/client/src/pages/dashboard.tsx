import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Clock, 
  Brain, 
  ListTodo, 
  Flame,
  FileText,
  TrendingUp,
  CheckCircle2,
  Circle
} from "lucide-react";
import { formatTimeAgo, formatDuration, getCategoryColor, getPriorityColor } from "@/lib/constants";
import type { Task, Note, StudySession } from "@shared/schema";

function HeaderBar() {
  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <div className="hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="w-80 pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 study-gradient-green rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-white">JS</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function WelcomeBanner() {
  const { data: todaySessions } = useQuery({
    queryKey: ["/api/study-sessions?type=today"],
  });

  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const totalStudyTime = todaySessions?.reduce((total: number, session: StudySession) => 
    session.completed ? total + session.duration : total, 0) || 0;

  const completedTasks = tasks?.filter((task: Task) => task.completed).length || 0;

  return (
    <div className="mb-8 p-6 study-gradient rounded-2xl text-white">
      <h3 className="text-2xl font-bold mb-2">Welcome back! 👋</h3>
      <p className="text-blue-100 mb-4">
        You've studied for {formatDuration(totalStudyTime * 60)} today. Keep up the great work!
      </p>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white bg-opacity-30 rounded-full"></div>
          <span className="text-sm">{completedTasks} tasks completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white bg-opacity-30 rounded-full"></div>
          <span className="text-sm">{todaySessions?.length || 0} study sessions</span>
        </div>
      </div>
    </div>
  );
}

function QuickStats() {
  const { data: todaySessions } = useQuery({
    queryKey: ["/api/study-sessions?type=today"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/study-sessions/stats?days=7"],
  });

  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const totalTodayTime = todaySessions?.reduce((total: number, session: StudySession) => 
    session.completed ? total + session.duration : total, 0) || 0;

  const todayTimeHours = totalTodayTime / 60;
  const targetHours = 3; // 3 hour daily goal
  const progressPercentage = Math.min((todayTimeHours / targetHours) * 100, 100);

  const allTasks = tasks || [];
  const completedTasks = allTasks.filter((task: Task) => task.completed);
  const taskProgress = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Study Time Today</p>
              <p className="text-2xl font-bold text-foreground">{formatDuration(totalTodayTime * 60)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <span className="text-sm text-muted-foreground mt-2 block">{Math.round(progressPercentage)}% of daily goal</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Study Sessions</p>
              <p className="text-2xl font-bold text-foreground">{stats?.totalSessions || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">This week</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
              <p className="text-2xl font-bold text-foreground">{completedTasks.length}/{allTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <ListTodo className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={taskProgress} className="h-2" />
            <span className="text-sm text-muted-foreground mt-2 block">{Math.round(taskProgress)}% complete</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Study Streak</p>
              <p className="text-2xl font-bold text-foreground">7 days</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">🔥 Personal best!</p>
        </CardContent>
      </Card>
    </div>
  );
}

function RecentActivity() {
  const { data: notes } = useQuery({
    queryKey: ["/api/notes"],
  });

  const recentNotes = notes?.slice(0, 3) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentNotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No notes yet. Create your first note!</p>
          ) : (
            recentNotes.map((note: Note) => (
              <div key={note.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-foreground truncate">{note.title}</h5>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(new Date(note.updatedAt))}</p>
                    {note.category && (
                      <Badge variant="secondary" className={getCategoryColor(note.category)}>
                        {note.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <UpcomingTasks />
    </div>
  );
}

function UpcomingTasks() {
  const { data: tasks, refetch } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const upcomingTasks = tasks?.filter((task: Task) => !task.completed).slice(0, 4) || [];

  const handleTaskToggle = async (taskId: number, completed: boolean) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      refetch();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="w-5 h-5" />
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No pending tasks. You're all caught up!</p>
        ) : (
          upcomingTasks.map((task: Task) => (
            <div key={task.id} className="flex items-center space-x-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => 
                  handleTaskToggle(task.id, checked as boolean)
                }
              />
              <div className="flex-1 min-w-0">
                <h5 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </h5>
                {task.dueDate && (
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return <div>Dashboard</div>;
}
