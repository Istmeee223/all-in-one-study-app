import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  ListTodo,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical
} from "lucide-react";
import { getPriorityColor, PRIORITY_LEVELS, formatTimeAgo } from "@/lib/constants";
import type { Task, InsertTask } from "@shared/schema";

function HeaderBar() {
  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tasks & Assignments</h2>
          <p className="text-muted-foreground">Keep track of your academic responsibilities</p>
        </div>
      </div>
    </header>
  );
}

function CreateTaskDialog({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const { toast } = useToast();

  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      toast({ title: "Task created successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create task", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ 
        title: "Missing information", 
        description: "Please enter a task title",
        variant: "destructive" 
      });
      return;
    }

    createTaskMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Task description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? "Adding..." : "Add Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskFilters({ activeFilter, onFilterChange }: { 
  activeFilter: string; 
  onFilterChange: (filter: string) => void;
}) {
  const filters = [
    { key: "all", label: "All Tasks", icon: ListTodo },
    { key: "pending", label: "Pending", icon: Clock },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
    { key: "overdue", label: "Overdue", icon: AlertCircle },
  ];

  return (
    <div className="flex items-center space-x-4 mb-6">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.key;
        return (
          <Button
            key={filter.key}
            variant={isActive ? "default" : "secondary"}
            onClick={() => onFilterChange(filter.key)}
            className={isActive ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Icon className="w-4 h-4 mr-2" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}

function TaskItem({ task, onUpdate, onDelete }: { 
  task: Task; 
  onUpdate: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
}) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const handleToggleComplete = (checked: boolean) => {
    onUpdate(task.id, { completed: checked });
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    if (days === -1) return "Due yesterday";
    if (days > 0) return `Due in ${days} day${days > 1 ? 's' : ''}`;
    return `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue`;
  };

  return (
    <Card className={`transition-all ${task.completed ? 'opacity-75' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
            />
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-foreground ${task.completed ? 'line-through' : ''}`}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {task.dueDate && (
                  <div className={`flex items-center text-xs ${
                    isOverdue ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                  }`}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDueDate(new Date(task.dueDate))}
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed {formatTimeAgo(new Date(task.completedAt))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TasksList() {
  const [activeFilter, setActiveFilter] = useState("all");
  
  const { data: allTasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const handleTaskUpdate = (id: number, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ id, updates });
  };

  const handleTaskDelete = (id: number) => {
    deleteTaskMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-5 h-5 bg-muted rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const filterTasks = (tasks: Task[]) => {
    const now = new Date();
    
    switch (activeFilter) {
      case "pending":
        return tasks.filter(task => !task.completed);
      case "completed":
        return tasks.filter(task => task.completed);
      case "overdue":
        return tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          new Date(task.dueDate) < now
        );
      default:
        return tasks;
    }
  };

  const filteredTasks = allTasks ? filterTasks(allTasks) : [];

  if (!allTasks || allTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <ListTodo className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No tasks yet</h3>
        <p className="text-muted-foreground mb-6">Create your first task to get started with managing your assignments.</p>
        <CreateTaskDialog>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Task
          </Button>
        </CreateTaskDialog>
      </div>
    );
  }

  return (
    <>
      <TaskFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg font-semibold text-foreground mb-2">
            No {activeFilter === "all" ? "" : activeFilter} tasks
          </div>
          <p className="text-muted-foreground">
            {activeFilter === "completed" && "Complete some tasks to see them here."}
            {activeFilter === "pending" && "All tasks are completed! Great work."}
            {activeFilter === "overdue" && "No overdue tasks. You're on track!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task: Task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}

function QuickAddTask() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const { toast } = useToast();

  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setTitle("");
      setDueDate("");
      setPriority("medium");
      toast({ title: "Task added successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to add task", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTaskMutation.mutate({
      title: title.trim(),
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="md:col-span-1"
            />
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!title.trim() || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Tasks() {
  return (
    <>
      <HeaderBar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Tasks & Assignments</h3>
              <p className="text-muted-foreground">Keep track of your academic responsibilities</p>
            </div>
            <CreateTaskDialog>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            </CreateTaskDialog>
          </div>

          <QuickAddTask />
          <TasksList />
        </div>
      </main>
    </>
  );
}
