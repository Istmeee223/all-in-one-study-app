import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Plus, Users, Send, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChatRoomSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import ChatRoomList from "@/components/chat/ChatRoomList";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";

type ChatRoom = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
};

type ChatMessage = {
  id: number;
  roomId: number;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
};

const createRoomSchema = insertChatRoomSchema.extend({
  name: z.string().min(1, "Room name is required"),
  description: z.string().min(1, "Description is required"),
});

const sendMessageSchema = insertChatMessageSchema.extend({
  content: z.string().min(1, "Message cannot be empty"),
});

export default function Chat() {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Chat rooms query
  const { data: rooms = [], isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat-rooms"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Messages query for selected room
  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat-rooms", selectedRoom, "messages"],
    enabled: selectedRoom !== null,
    refetchInterval: 2000, // Refresh every 2 seconds for real-time feel
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: (data: z.infer<typeof createRoomSchema>) =>
      apiRequest("/api/chat-rooms", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          isActive: true,
          participants: ["user1"], // Default current user
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-rooms"] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string; roomId: number }) =>
      apiRequest(`/api/chat-rooms/${data.roomId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: data.content,
          userId: "user1",
          username: "Student",
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat-rooms", selectedRoom, "messages"] 
      });
      setNewMessage("");
    },
  });

  const createRoomForm = useForm<z.infer<typeof createRoomSchema>>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onCreateRoom = (data: z.infer<typeof createRoomSchema>) => {
    createRoomMutation.mutate(data);
    createRoomForm.reset();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    sendMessageMutation.mutate({
      content: newMessage,
      roomId: selectedRoom,
    });
  };

  const activeRooms = rooms.filter(room => room.isActive);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Study Chat</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Rooms Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Chat Rooms</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    New Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Chat Room</DialogTitle>
                  </DialogHeader>
                  <Form {...createRoomForm}>
                    <form onSubmit={createRoomForm.handleSubmit(onCreateRoom)} className="space-y-4">
                      <FormField
                        control={createRoomForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., JavaScript Study Group" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createRoomForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What will you discuss in this room?"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={createRoomMutation.isPending}
                      >
                        Create Room
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {roomsLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading rooms...
                </div>
              ) : activeRooms.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No active rooms. Create one to start chatting!
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {activeRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRoom === room.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{room.name}</h3>
                        <Badge variant="secondary" className="ml-2">
                          <Users className="h-3 w-3 mr-1" />
                          {room.participants.length}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {room.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDistanceToNow(new Date(room.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedRoom ? (
            <>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {rooms.find(r => r.id === selectedRoom)?.name || "Chat"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {rooms.find(r => r.id === selectedRoom)?.description}
                </p>
              </CardHeader>
              <Separator />
              
              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[400px] p-4">
                  {messagesLoading ? (
                    <div className="text-center text-muted-foreground">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {message.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="bg-accent/50 rounded-lg p-3 max-w-[80%]">
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <Separator />
              <CardContent className="p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a chat room to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}