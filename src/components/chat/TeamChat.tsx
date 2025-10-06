import React, { useState } from "react";
import { Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/useChat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const TeamChat = () => {
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [newMessage, setNewMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  
  const { rooms, messages, createRoom, sendMessage } = useChat(selectedRoom);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;
    sendMessage({ roomId: selectedRoom, message: newMessage });
    setNewMessage("");
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    createRoom({ name: newRoomName });
    setNewRoomName("");
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Rooms List */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Rooms</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Room Name</Label>
                  <Input
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter room name..."
                  />
                </div>
                <Button onClick={handleCreateRoom} className="w-full">
                  Create Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="h-[calc(600px-57px)]">
          {rooms?.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`w-full p-3 text-left hover:bg-accent transition-colors ${
                selectedRoom === room.id ? "bg-accent" : ""
              }`}
            >
              <p className="font-medium text-sm truncate">{room.name}</p>
              <p className="text-xs text-muted-foreground">{room.type}</p>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                {rooms?.find((r) => r.id === selectedRoom)?.name}
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages?.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-sm bg-accent p-3 rounded-lg">
                        {message.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a room to start chatting
          </div>
        )}
      </div>
    </div>
  );
};
