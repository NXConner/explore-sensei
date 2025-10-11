import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";

export const ClockInStatus = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const { toast } = useToast();
  const { emitEvent } = useGamification();

  useEffect(() => {
    // Check if user is clocked in from localStorage
    const stored = localStorage.getItem("clock_status");
    if (stored) {
      const data = JSON.parse(stored);
      setIsClockedIn(data.isClockedIn);
      if (data.clockInTime) {
        setClockInTime(new Date(data.clockInTime));
      }
    }
  }, []);

  useEffect(() => {
    if (!isClockedIn || !clockInTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - clockInTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsedTime(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  const handleClockToggle = async () => {
    const newStatus = !isClockedIn;
    const now = new Date();

    if (newStatus) {
      setIsClockedIn(true);
      setClockInTime(now);
      localStorage.setItem("clock_status", JSON.stringify({ isClockedIn: true, clockInTime: now.toISOString() }));
      toast({ title: "Clocked In", description: `Started at ${now.toLocaleTimeString()}` });
      try { await emitEvent({ event_type: "clock_in", metadata: { at: now.toISOString() } }); } catch {}
    } else {
      setIsClockedIn(false);
      setClockInTime(null);
      localStorage.removeItem("clock_status");
      toast({ title: "Clocked Out", description: `Total time: ${elapsedTime}` });
      try { await emitEvent({ event_type: "clock_out", metadata: { at: now.toISOString(), elapsed: elapsedTime } }); } catch {}
    }

    // Save to localStorage only for now
    try {
      const logEntry = {
        timestamp: now.toISOString(),
        type: newStatus ? "clock_in" : "clock_out",
        elapsed: elapsedTime,
      };
      console.log("Clock event:", logEntry);
    } catch (error) {
      console.error("Failed to log clock event:", error);
    }
  };

  return (
    <Card
      className={`fixed right-[280px] top-20 z-[400] p-3 backdrop-blur-sm border-2 transition-colors ${
        isClockedIn
          ? "bg-green-500/10 border-green-500"
          : "bg-red-500/10 border-red-500"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            isClockedIn ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <div className="text-sm">
          <div className="font-bold text-foreground">
            {isClockedIn ? "CLOCKED IN" : "CLOCKED OUT"}
          </div>
          {isClockedIn && (
            <div className="text-xs text-muted-foreground font-mono">{elapsedTime}</div>
          )}
        </div>
        <Button
          size="sm"
          variant={isClockedIn ? "destructive" : "default"}
          onClick={handleClockToggle}
          className="ml-2"
        >
          {isClockedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
        </Button>
      </div>
    </Card>
  );
};
