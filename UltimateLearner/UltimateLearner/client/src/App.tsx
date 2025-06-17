import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Notes from "@/pages/notes";
import Flashcards from "@/pages/flashcards";
import Timer from "@/pages/timer";
import Tasks from "@/pages/tasks";
import Calendar from "@/pages/calendar";
import Files from "@/pages/files";
import MindMaps from "@/pages/mind-maps";
import Quizzes from "@/pages/quizzes";
import Analytics from "@/pages/analytics";
import Achievements from "@/pages/achievements";
import AIAssistant from "@/pages/ai-assistant";
import Chat from "@/pages/chat";
import { AuthProvider, useAuth } from "./auth";
import LoginPage from "./pages/login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/notes" component={Notes} />
      <Route path="/flashcards" component={Flashcards} />
      <Route path="/timer" component={Timer} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/files" component={Files} />
      <Route path="/mind-maps" component={MindMaps} />
      <Route path="/quizzes" component={Quizzes} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/ai" component={AIAssistant} />
      <Route path="/chat" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ProtectedApp() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return <Router />;
}

export default function App() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Show login page or redirect
    return <Login />;
  }

  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <ProtectedApp />
              </div>
            </div>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
