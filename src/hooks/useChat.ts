import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface ChatRoom {
  id: string;
  name: string;
  type: string;
  job_id?: string;
  created_by: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  attachments: any[];
  created_at: string;
}

export const useChat = (roomId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["chat-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_rooms" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as ChatRoom[];
    },
  });

  // Fetch messages for a room
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", roomId],
    enabled: !!roomId,
    queryFn: async () => {
      if (!roomId) return [];
      
      const { data, error } = await supabase
        .from("chat_messages" as any)
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as unknown as ChatMessage[];
    },
  });

  // Create room mutation
  const createRoom = useMutation({
    mutationFn: async ({ name, jobId }: { name: string; jobId?: string }) => {
      const { data, error } = await supabase
        .from("chat_rooms" as any)
        .insert({ name, job_id: jobId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
      toast({
        title: "Success",
        description: "Chat room created successfully",
      });
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ roomId, message }: { roomId: string; message: string }) => {
      const { error } = await supabase
        .from("chat_messages" as any)
        .insert({ room_id: roomId, message });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", roomId] });
    },
  });

  // Real-time subscription for messages
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chat-messages", roomId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return {
    rooms,
    messages,
    roomsLoading,
    messagesLoading,
    createRoom: createRoom.mutate,
    sendMessage: sendMessage.mutate,
  };
};
