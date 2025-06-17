import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/use-theme";
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  Clock, 
  FileText, 
  Home, 
  ListTodo, 
  Moon, 
  Sun,
  Upload,
  MessageSquare,
  Trophy,
  BarChart3,
  Zap,
  Users
} from "lucide-react";
import { Link, useLocation } from "wouter";

const coreNavigationItems = [
  { href: "/", icon: Home, label: "Dashboard", section: "dashboard" },
  { href: "/notes", icon: FileText, label: "Notes", section: "notes" },
  { href: "/flashcards", icon: Brain, label: "Flashcards", section: "flashcards" },
  { href: "/timer", icon: Clock, label: "Focus Timer", section: "timer" },
  { href: "/tasks", icon: ListTodo, label: "Tasks", section: "tasks" },
  { href: "/calendar", icon: Calendar, label: "Calendar", section: "calendar" },
  { href: "/files", icon: Upload, label: "Files", section: "files" },
];

const advancedNavigationItems = [
  { href: "/mind-maps", icon: Brain, label: "Mind Maps", section: "mind-maps", badge: "Visual" },
  { href: "/quizzes", icon: BookOpen, label: "Quizzes", section: "quizzes", badge: "Interactive" },
  { href: "/chat", icon: MessageSquare, label: "Chat", section: "chat", badge: "Collaborate" },
  { href: "/analytics", icon: BarChart3, label: "Analytics", section: "analytics", badge: "Insights" },
  { href: "/achievements", icon: Trophy, label: "Achievements", section: "achievements", badge: "Gamified" },
];

const aiNavigationItems = [
  { href: "/ai", icon: Zap, label: "AI Assistant", section: "ai", badge: "New" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="w-64 bg-card shadow-lg border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 study-gradient rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">StudyFlow</h1>
            <p className="text-sm text-muted-foreground">All-in-One Study</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Core Features */}
        <div className="space-y-1">
          <div className="px-2 py-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Core</h3>
          </div>
          {coreNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start nav-item ${isActive ? "active" : ""}`}
                  style={isActive ? { backgroundColor: "var(--study-blue)", color: "white" } : {}}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <Separator />

        {/* Advanced Features */}
        <div className="space-y-1">
          <div className="px-2 py-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advanced</h3>
          </div>
          {advancedNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start nav-item ${isActive ? "active" : ""}`}
                  style={isActive ? { backgroundColor: "var(--study-blue)", color: "white" } : {}}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        <Separator />

        {/* AI Features */}
        <div className="space-y-1">
          <div className="px-2 py-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Powered</h3>
          </div>
          {aiNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start nav-item ${isActive ? "active" : ""}`}
                  style={isActive ? { backgroundColor: "var(--study-blue)", color: "white" } : {}}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className="w-full justify-center space-x-2"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          <span>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;
