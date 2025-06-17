import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  FileText, 
  Save, 
  Download,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  AlignLeft,
  Search
} from "lucide-react";
import { formatTimeAgo, getCategoryColor, CATEGORIES } from "@/lib/constants";
import type { Note, InsertNote } from "@shared/schema";

function HeaderBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, refetch: searchNotes } = useQuery({
    queryKey: ["/api/search", { q: searchQuery }],
    enabled: false,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchNotes();
    }
  };

  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-foreground">Notes</h2>
          <p className="text-muted-foreground">Organize your study materials and thoughts</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="w-80 pl-10"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function NoteEditor({ onNoteCreated }: { onNoteCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const createNoteMutation = useMutation({
    mutationFn: async (note: InsertNote) => {
      const response = await apiRequest("POST", "/api/notes", note);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setTitle("");
      setContent("");
      setCategory("");
      toast({ title: "Note created successfully!" });
      onNoteCreated();
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create note", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({ 
        title: "Missing information", 
        description: "Please enter both title and content",
        variant: "destructive" 
      });
      return;
    }

    createNoteMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      category: category || null,
    });
  };

  const handleExport = () => {
    if (!title.trim() || !content.trim()) return;
    
    const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const insertFormatting = (before: string, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${before}${selectedText}${after}`;
    
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <Input
          placeholder="Note Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-semibold border-none shadow-none p-0 focus-visible:ring-0"
        />
      </CardHeader>
      
      <div className="px-6 pb-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("**")}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("*")}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("__")}
          >
            <Underline className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("[", "](url)")}
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("- ", "")}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("\n## ", "")}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <CardContent className="p-6">
        <Textarea
          ref={textareaRef}
          placeholder="Start writing your notes..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-64 border-none shadow-none resize-none focus-visible:ring-0"
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {content ? "Auto-saved" : "Start typing to begin"}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={createNoteMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {createNoteMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotesList() {
  const { data: notes, isLoading } = useQuery({
    queryKey: ["/api/notes"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded mb-4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No notes yet</h3>
        <p className="text-muted-foreground">Create your first note to get started with organizing your study materials.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note: Note) => (
        <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <h4 className="font-semibold text-foreground mb-2 line-clamp-2">{note.title}</h4>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}
              {note.content.length > 150 ? '...' : ''}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatTimeAgo(new Date(note.updatedAt))}</span>
              {note.category && (
                <Badge variant="secondary" className={getCategoryColor(note.category)}>
                  {note.category}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Notes() {
  return <div>Notes</div>;
}
