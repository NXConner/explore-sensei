import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "ASPHALT OVERWATCH AI ONLINE. I have access to company handbooks, bonus programs, and operational procedures. How can I assist?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: [...messages, newUserMessage] },
      });

      if (error) {
        throw error;
      }

      const aiResponse = data?.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error("No response from AI");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error: unknown) {
      console.error("AI Error:", error);

      let errorMessage = "Failed to get AI response. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          errorMessage = "AI is receiving too many requests. Please wait a moment and try again.";
        } else if (error.message.includes("credits")) {
          errorMessage = "AI credits have been depleted. Please contact your administrator.";
        }
      }

      toast({
        title: "AI Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};
