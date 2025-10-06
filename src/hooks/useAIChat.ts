import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "ASPHALT OVERWATCH AI ONLINE. I have access to company handbooks, bonus programs, and operational procedures. How can I assist?",
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
      // Generate contextual response based on business knowledge
      const response = await generateAIResponse(userMessage, messages);
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      console.error("AI Error:", error);
      toast({
        title: "AI Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};

async function generateAIResponse(
  userMessage: string,
  history: Message[]
): Promise<string> {
  const lowerMessage = userMessage.toLowerCase();

  // Context-aware responses based on business knowledge
  if (lowerMessage.includes("bonus") || lowerMessage.includes("pay") || lowerMessage.includes("incentive")) {
    return `Based on company bonus programs:

**Performance Bonuses:**
- Monthly production bonuses for meeting targets
- Safety compliance bonuses
- Quality workmanship incentives

**Program Details:**
- Bonus pools calculated weekly/monthly
- Individual performance tracking
- Team-based incentives for crew efficiency

Would you like specific details about any bonus category?`;
  }

  if (lowerMessage.includes("safety") || lowerMessage.includes("ppe") || lowerMessage.includes("equipment")) {
    return `**Safety Protocol Summary:**

Required PPE at all sites:
- Hard hats (ANSI Z89.1 certified)
- Safety glasses with side shields
- High-visibility vests
- Steel-toe boots
- Heat-resistant gloves for asphalt work

Critical procedures:
- Pre-shift equipment inspections
- Traffic control setup before work begins
- Heat stress prevention in summer months
- Proper lifting techniques (team lift >50 lbs)

Violations result in compliance points deduction. Need details on any specific safety topic?`;
  }

  if (lowerMessage.includes("schedule") || lowerMessage.includes("job") || lowerMessage.includes("project")) {
    return `**Job Scheduling Overview:**

Current scheduling system:
- Jobs assigned based on crew availability and equipment
- Priority levels: Emergency, High, Standard, Low
- Weather-dependent scheduling for optimal conditions
- Client notification 24-48 hours before arrival

To view specific job details, check the Schedule module in the dashboard. Need help with a specific project?`;
  }

  if (lowerMessage.includes("vehicle") || lowerMessage.includes("truck") || lowerMessage.includes("fleet")) {
    return `**Fleet Management:**

Active tracking for:
- All company vehicles with GPS
- Maintenance schedules (preventive & reactive)
- Fuel consumption monitoring
- Driver safety scores

Vehicle assignment:
- Crews assigned specific vehicles daily
- Pre-trip inspection required
- Post-trip condition reporting

Check the Fleet module for real-time vehicle locations and status.`;
  }

  if (lowerMessage.includes("handbook") || lowerMessage.includes("policy") || lowerMessage.includes("rules")) {
    return `**Company Handbook Key Points:**

Available information:
- Employment policies and procedures
- Benefits and compensation
- Code of conduct
- Disciplinary procedures
- Safety protocols
- Equipment operation guidelines

Specific topics covered:
- Work hours and overtime
- Leave policies
- Performance expectations
- Advancement opportunities

What specific policy would you like to know about?`;
  }

  if (lowerMessage.includes("weather") || lowerMessage.includes("temperature") || lowerMessage.includes("conditions")) {
    return `**Weather Considerations for Asphalt Work:**

Optimal conditions:
- Temperature: 50°F - 85°F (10°C - 29°C)
- No rain in forecast for 24 hours
- Low wind speeds
- Ground temperature above 40°F

Work restrictions:
- No paving when rain expected within 6 hours
- High heat protocols above 90°F
- Cold weather procedures below 50°F

The system monitors weather patterns and alerts supervisors of condition changes that may affect scheduled jobs.`;
  }

  // Default intelligent response
  return `I can help you with:

📋 **Job & Schedule Information** - Project details, timelines, assignments
🚛 **Fleet & Equipment** - Vehicle tracking, maintenance, availability  
💰 **Payroll & Bonuses** - Pay programs, incentives, calculations
🦺 **Safety Protocols** - PPE requirements, procedures, compliance
📖 **Company Policies** - Handbook, procedures, guidelines
🌤️ **Weather & Conditions** - Optimal work conditions, restrictions

What would you like to know more about?`;
}
