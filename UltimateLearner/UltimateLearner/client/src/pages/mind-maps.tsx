import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { MindMap, InsertMindMap } from "@shared/schema";
import { Brain, Plus, Users, Link, Eye, Edit3, Trash2, Share, Download, Upload, ZoomIn, ZoomOut, Move } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  children: string[];
  parent?: string;
}

interface MindMapData {
  nodes: MindMapNode[];
  connections: Array<{ from: string; to: string }>;
  centerNode: string;
}

const defaultMindMapData: MindMapData = {
  nodes: [
    {
      id: "center",
      text: "Main Topic",
      x: 400,
      y: 300,
      color: "#3b82f6",
      size: 100,
      children: [],
    }
  ],
  connections: [],
  centerNode: "center"
};

function MindMapCanvas({ 
  data, 
  onDataChange, 
  isReadOnly = false 
}: { 
  data: MindMapData; 
  onDataChange: (data: MindMapData) => void;
  isReadOnly?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [newNodeText, setNewNodeText] = useState("");

  useEffect(() => {
    drawMindMap();
  }, [data, zoom, selectedNode]);

  const drawMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw connections
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    data.connections.forEach(connection => {
      const fromNode = data.nodes.find(n => n.id === connection.from);
      const toNode = data.nodes.find(n => n.id === connection.to);
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    data.nodes.forEach(node => {
      const isSelected = selectedNode === node.id;
      const isCenter = node.id === data.centerNode;

      // Node circle
      ctx.fillStyle = node.color;
      ctx.strokeStyle = isSelected ? "#1f2937" : "#ffffff";
      ctx.lineWidth = isSelected ? 3 : 2;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Node text
      ctx.fillStyle = "#ffffff";
      ctx.font = `${isCenter ? "16px" : "14px"} Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const maxWidth = node.size - 10;
      const words = node.text.split(" ");
      let line = "";
      let y = node.y;
      
      if (words.length === 1 || ctx.measureText(node.text).width <= maxWidth) {
        ctx.fillText(node.text, node.x, y);
      } else {
        let lines: string[] = [];
        words.forEach(word => {
          const testLine = line + (line ? " " : "") + word;
          if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        });
        if (line) lines.push(line);
        
        const lineHeight = 16;
        y = node.y - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((textLine, i) => {
          ctx.fillText(textLine, node.x, y + i * lineHeight);
        });
      }
    });

    ctx.restore();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    // Check if clicking on a node
    const clickedNode = data.nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.size / 2;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
    } else {
      setSelectedNode(null);
    }
  };

  const addNode = () => {
    if (!selectedNode || !newNodeText.trim()) return;

    const parentNode = data.nodes.find(n => n.id === selectedNode);
    if (!parentNode) return;

    const angle = Math.random() * 2 * Math.PI;
    const distance = 150;
    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      text: newNodeText.trim(),
      x: parentNode.x + Math.cos(angle) * distance,
      y: parentNode.y + Math.sin(angle) * distance,
      color: "#10b981",
      size: 80,
      children: [],
      parent: selectedNode
    };

    const updatedData = {
      ...data,
      nodes: [...data.nodes, newNode],
      connections: [...data.connections, { from: selectedNode, to: newNode.id }]
    };

    onDataChange(updatedData);
    setNewNodeText("");
  };

  const deleteNode = () => {
    if (!selectedNode || selectedNode === data.centerNode) return;

    const updatedData = {
      ...data,
      nodes: data.nodes.filter(n => n.id !== selectedNode),
      connections: data.connections.filter(c => c.from !== selectedNode && c.to !== selectedNode)
    };

    onDataChange(updatedData);
    setSelectedNode(null);
  };

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {!isReadOnly && (
          <>
            <Input
              placeholder="Add new node..."
              value={newNodeText}
              onChange={(e) => setNewNodeText(e.target.value)}
              className="flex-1 min-w-[200px]"
              onKeyPress={(e) => e.key === "Enter" && addNode()}
            />
            <Button onClick={addNode} disabled={!selectedNode || !newNodeText.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteNode} 
              disabled={!selectedNode || selectedNode === data.centerNode}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        )}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full border rounded cursor-pointer"
            onClick={handleCanvasClick}
          />
        </CardContent>
      </Card>

      {selectedNode && !isReadOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Node Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Color:</Label>
              <div className="flex gap-1">
                {colors.map(color => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      const updatedNodes = data.nodes.map(node =>
                        node.id === selectedNode ? { ...node, color } : node
                      );
                      onDataChange({ ...data, nodes: updatedNodes });
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CreateMindMapDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isShared, setIsShared] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: InsertMindMap) => {
      return await apiRequest("/api/mind-maps", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mind-maps"] });
      setOpen(false);
      setTitle("");
      setIsShared(false);
      toast({ title: "Mind map created successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create mind map", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      title: title.trim(),
      data: defaultMindMapData,
      isShared,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Mind Map</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter mind map title..."
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="shared"
              checked={isShared}
              onCheckedChange={setIsShared}
            />
            <Label htmlFor="shared">Share with others</Label>
          </div>
          <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
            {createMutation.isPending ? "Creating..." : "Create Mind Map"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MindMapEditor({ mindMap }: { mindMap: MindMap }) {
  const [data, setData] = useState<MindMapData>(
    mindMap.data as MindMapData || defaultMindMapData
  );
  const [autoSave, setAutoSave] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (updatedData: MindMapData) => {
      return await apiRequest(`/api/mind-maps/${mindMap.id}`, {
        method: "PATCH",
        body: JSON.stringify({ data: updatedData }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mind-maps"] });
      if (!autoSave) {
        toast({ title: "Mind map saved successfully!" });
      }
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to save mind map", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        updateMutation.mutate(data);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data, autoSave]);

  const handleDataChange = (newData: MindMapData) => {
    setData(newData);
  };

  const manualSave = () => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{mindMap.title}</h2>
          <p className="text-muted-foreground">
            Last updated: {new Date(mindMap.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="autosave"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
            <Label htmlFor="autosave" className="text-sm">Auto-save</Label>
          </div>
          {!autoSave && (
            <Button onClick={manualSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          )}
          {mindMap.isShared && (
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              Shared
            </Badge>
          )}
        </div>
      </div>

      <MindMapCanvas data={data} onDataChange={handleDataChange} />
    </div>
  );
}

export default function MindMaps() {
  const [selectedMindMap, setSelectedMindMap] = useState<MindMap | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "edit">("grid");

  const { data: mindMaps, isLoading } = useQuery({
    queryKey: ["/api/mind-maps"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/mind-maps/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      useQueryClient().invalidateQueries({ queryKey: ["/api/mind-maps"] });
      if (selectedMindMap) {
        setSelectedMindMap(null);
        setViewMode("grid");
      }
    },
  });

  if (selectedMindMap && viewMode === "edit") {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedMindMap(null);
            setViewMode("grid");
          }}
          className="mb-6"
        >
          ← Back to Mind Maps
        </Button>
        <MindMapEditor mindMap={selectedMindMap} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Mind Maps
          </h1>
          <p className="text-muted-foreground">
            Create visual maps of your ideas and knowledge
          </p>
        </div>
        <CreateMindMapDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Mind Map
          </Button>
        </CreateMindMapDialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !mindMaps?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No mind maps yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first mind map to start organizing your thoughts visually
            </p>
            <CreateMindMapDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Mind Map
              </Button>
            </CreateMindMapDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mindMaps.map((mindMap: MindMap) => {
            const nodeCount = (mindMap.data as MindMapData)?.nodes?.length || 0;
            
            return (
              <Card key={mindMap.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate">{mindMap.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      {mindMap.isShared && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {nodeCount} node{nodeCount !== 1 ? 's' : ''} • 
                    Updated {new Date(mindMap.updatedAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg mb-4 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedMindMap(mindMap);
                        setViewMode("edit");
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(mindMap.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}