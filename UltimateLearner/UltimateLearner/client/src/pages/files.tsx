import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Upload, 
  FileText,
  Download,
  Trash2,
  Image,
  File,
  Search,
  Cloud,
  MoreVertical
} from "lucide-react";
import { formatFileSize, formatTimeAgo, FILE_TYPES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import type { StudyFile } from "@shared/schema";

function HeaderBar() {
  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Study Materials</h2>
          <p className="text-muted-foreground">Upload and organize your documents and resources</p>
        </div>
      </div>
    </header>
  );
}

function FileUploadZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [category, setCategory] = useState("uncategorized");
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({ title: "File uploaded successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Upload failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({ 
        title: "Invalid file type", 
        description: "Only PDF, Word documents, text files, and images are allowed",
        variant: "destructive" 
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({ 
        title: "File too large", 
        description: "Maximum file size is 10MB",
        variant: "destructive" 
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    
    uploadMutation.mutate(formData);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Upload Files</h4>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="assignments">Assignments</SelectItem>
              <SelectItem value="notes">Notes</SelectItem>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div
          className={`file-upload-zone ${isDragOver ? 'border-green-500' : ''} ${uploadMutation.isPending ? 'opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ALLOWED_FILE_TYPES.join(",")}
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={uploadMutation.isPending}
          />
          
          <Cloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-foreground mb-2">
            {uploadMutation.isPending ? "Uploading..." : "Drop files here"}
          </h4>
          <p className="text-muted-foreground mb-4">or click to browse</p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, DOC, DOCX, TXT, and image files (max 10MB)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function FileFilters({ activeFilter, onFilterChange }: { 
  activeFilter: string; 
  onFilterChange: (filter: string) => void;
}) {
  const filters = [
    { key: "all", label: "All Files", icon: File },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "images", label: "Images", icon: Image },
    { key: "recent", label: "Recent", icon: Upload },
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
            className={isActive ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Icon className="w-4 h-4 mr-2" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}

function FileCard({ file, onDelete }: { 
  file: StudyFile; 
  onDelete: (id: number) => void;
}) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="w-6 h-6 text-green-600 dark:text-green-400" />;
    }
    if (mimeType === "application/pdf") {
      return <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />;
    }
    if (mimeType.includes("word") || mimeType.includes("document")) {
      return <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    }
    return <File className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "bg-green-100 dark:bg-green-900";
    if (mimeType === "application/pdf") return "bg-red-100 dark:bg-red-900";
    if (mimeType.includes("word")) return "bg-blue-100 dark:bg-blue-900";
    return "bg-purple-100 dark:bg-purple-900";
  };

  const getFileTypeName = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "Image";
    if (mimeType === "application/pdf") return "PDF";
    if (mimeType.includes("word")) return "Word";
    if (mimeType === "text/plain") return "Text";
    return "File";
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/files/${file.id}/download`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor(file.mimeType)}`}>
            {getFileIcon(file.mimeType)}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(file.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <h4 className="font-semibold text-foreground mb-2 line-clamp-2" title={file.originalName}>
          {file.originalName}
        </h4>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>{formatFileSize(file.size)}</span>
          <Badge variant="secondary">
            {getFileTypeName(file.mimeType)}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Uploaded {formatTimeAgo(new Date(file.uploadedAt))}
        </p>
        
        {file.category && file.category !== "uncategorized" && (
          <Badge variant="outline" className="mt-2">
            {file.category}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function FilesList() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: allFiles, isLoading } = useQuery({
    queryKey: ["/api/files"],
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    },
  });

  const handleFileDelete = (id: number) => {
    deleteFileMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-muted rounded-lg mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const filterFiles = (files: StudyFile[]) => {
    let filtered = files;

    // Apply category filter
    switch (activeFilter) {
      case "documents":
        filtered = files.filter(file => 
          file.mimeType === "application/pdf" || 
          file.mimeType.includes("word") || 
          file.mimeType === "text/plain"
        );
        break;
      case "images":
        filtered = files.filter(file => file.mimeType.startsWith("image/"));
        break;
      case "recent":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = files.filter(file => new Date(file.uploadedAt) > oneWeekAgo);
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file =>
        file.originalName.toLowerCase().includes(query) ||
        file.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredFiles = allFiles ? filterFiles(allFiles) : [];

  if (!allFiles || allFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No files uploaded yet</h3>
        <p className="text-muted-foreground">Upload your first study materials to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <FileFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 pl-10"
          />
        </div>
      </div>
      
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg font-semibold text-foreground mb-2">
            No {activeFilter === "all" ? "" : activeFilter} files found
          </div>
          <p className="text-muted-foreground">
            {searchQuery ? "Try a different search term." : "Upload some files to see them here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file: StudyFile) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={handleFileDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function Files() {
  return (
    <>
      <HeaderBar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Study Materials</h3>
              <p className="text-muted-foreground">Upload and organize your documents and resources</p>
            </div>
          </div>

          <FileUploadZone />
          <FilesList />
        </div>
      </main>
    </>
  );
}
