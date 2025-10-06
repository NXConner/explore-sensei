import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/hooks/useAIChat";

interface AIAssistantProps {
  onClose: () => void;
}

export const AIAssistant = ({ onClose }: AIAssistantProps) => {
  const { messages, sendMessage, isLoading } = useAIChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[600px] tactical-panel m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center animate-pulse-glow">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
                AI Tactical Assistant
              </h2>
              <p className="text-xs text-muted-foreground">Powered by Lovable AI</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-md p-3 rounded ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-primary/30"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="bg-card border border-primary/30 p-3 rounded">
                  <p className="text-sm text-muted-foreground">Analyzing...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-primary/30">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about operations, schedules, equipment..."
              className="flex-1 bg-input border-primary/30 focus:border-primary"
            />
            <Button 
              onClick={handleSend} 
              className="btn-tactical"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
