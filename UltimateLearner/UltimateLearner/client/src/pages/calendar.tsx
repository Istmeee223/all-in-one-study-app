import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  BookOpen
} from "lucide-react";
import { STUDY_EVENT_TYPES, formatTimeAgo } from "@/lib/constants";
import type { StudyEvent, InsertStudyEvent, Task } from "@shared/schema";

function HeaderBar() {
  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Study Calendar</h2>
          <p className="text-muted-foreground">Schedule and track your study sessions</p>
        </div>
      </div>
    </header>
  );
}

function CreateEventDialog({ children, selectedDate }: { 
  children: React.ReactNode;
  selectedDate?: Date;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("study");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState(
    selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const { toast } = useToast();

  const createEventMutation = useMutation({
    mutationFn: async (event: InsertStudyEvent) => {
      const response = await apiRequest("POST", "/api/study-events", event);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-events"] });
      setTitle("");
      setDescription("");
      setType("study");
      setStartTime("");
      setEndTime("");
      toast({ title: "Event created successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create event", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) {
      toast({ 
        title: "Missing information", 
        description: "Please fill in all required fields",
        variant: "destructive" 
      });
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast({ 
        title: "Invalid time", 
        description: "End time must be after start time",
        variant: "destructive" 
      });
      return;
    }

    createEventMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      startTime: startDateTime,
      endTime: endDateTime,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Study Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Event title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Event description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study Session</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Time</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Time</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={createEventMutation.isPending}
          >
            {createEventMutation.isPending ? "Creating..." : "Add Event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: events } = useQuery({
    queryKey: ["/api/study-events"],
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (date: Date) => {
    if (!events) return [];
    
    return events.filter((event: StudyEvent) => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "study": return "bg-blue-500";
      case "exam": return "bg-red-500";
      case "assignment": return "bg-purple-500";
      case "review": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month's trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    calendarDays.push({ date, isCurrentMonth: false });
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({ date, isCurrentMonth: true });
  }
  
  // Next month's leading days
  const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {monthNames[month]} {year}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const isToday = date.toDateString() === today.toDateString();
            const dayEvents = getEventsForDate(date);
            
            return (
              <div
                key={index}
                className={`
                  p-3 text-center text-sm cursor-pointer rounded-lg transition-colors relative
                  ${isCurrentMonth 
                    ? 'text-foreground hover:bg-muted' 
                    : 'text-muted-foreground'
                  }
                  ${isToday ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                `}
                onClick={() => setSelectedDate(date)}
              >
                {date.getDate()}
                {dayEvents.length > 0 && (
                  <div className="flex justify-center mt-1 space-x-1">
                    {dayEvents.slice(0, 3).map((event: StudyEvent, i: number) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TodaySchedule() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: todayEvents } = useQuery({
    queryKey: ["/api/study-events", { date: today }],
  });

  const sortedEvents = todayEvents?.sort((a: StudyEvent, b: StudyEvent) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  ) || [];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "study": return "bg-blue-500";
      case "exam": return "bg-red-500";
      case "assignment": return "bg-purple-500";
      case "review": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No events scheduled for today
          </p>
        ) : (
          sortedEvents.map((event: StudyEvent) => (
            <div key={event.id} className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${getEventTypeColor(event.type)}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-foreground">{event.title}</h5>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(new Date(event.startTime))}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
                <Badge variant="secondary" className="mt-1 text-xs">
                  {event.type}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingDeadlines() {
  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const upcomingTasks = tasks?.filter((task: Task) => 
    !task.completed && task.dueDate
  ).sort((a: Task, b: Task) => 
    new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
  ).slice(0, 5) || [];

  const getUrgencyColor = (dueDate: Date) => {
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (diffDays <= 1) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (diffDays <= 3) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  };

  const getUrgencyLabel = (dueDate: Date) => {
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return "This week";
    return "Upcoming";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No upcoming deadlines
          </p>
        ) : (
          upcomingTasks.map((task: Task) => {
            const dueDate = new Date(task.dueDate!);
            return (
              <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg ${getUrgencyColor(dueDate)}`}>
                <div>
                  <h5 className="font-medium">{task.title}</h5>
                  <p className="text-sm opacity-80">
                    Due: {dueDate.toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">
                  {getUrgencyLabel(dueDate)}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default function Calendar() {
  return <div>Calendar</div>;
}
