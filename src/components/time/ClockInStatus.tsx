import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";
import { EODSummaryModal } from "@/components/gamification/EODSummaryModal";
import { useGamificationToggle } from "@/context/GamificationContext";

export const ClockInStatus = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const { toast } = useToast();
  const { emitEvent } = useGamification();
  const { enabled: gamifyEnabled } = useGamificationToggle();
  const [showSummary, setShowSummary] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState(0);

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
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
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
      localStorage.setItem(
        "clock_status",
        JSON.stringify({ isClockedIn: true, clockInTime: now.toISOString() }),
      );
      toast({ title: "Clocked In", description: `Started at ${now.toLocaleTimeString()}` });
      if (gamifyEnabled) { try { await emitEvent({ event_type: "clock_in", metadata: { at: now.toISOString() } }); } catch {} }
    } else {
      setIsClockedIn(false);
      setClockInTime(null);
      localStorage.removeItem("clock_status");
      toast({ title: "Clocked Out", description: `Total time: ${elapsedTime}` });
      if (gamifyEnabled) {
        try {
          const res = await emitEvent({ event_type: "clock_out", metadata: { at: now.toISOString(), elapsed: elapsedTime } });
          const awarded = typeof res?.awarded_points === 'number' ? res.awarded_points : 0;
          setAwardedPoints(awarded);
          setShowSummary(true);
        } catch {}
      }
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
    <>
    {showSummary && (
      <EODSummaryModal awarded={awardedPoints} onClose={() => setShowSummary(false)} />
    )}
    <Card
<<<<<<< HEAD
      className={`fixed right-[280px] top-20 z-[400] p-3 backdrop-blur-sm border-2 transition-colors ${
        isClockedIn ? "bg-green-500/10 border-green-500" : "bg-red-500/10 border-red-500"
=======
      className={`absolute right-16 top-16 z-[950] h-9 px-3 flex items-center backdrop-blur-sm border-2 transition-colors ${
        isClockedIn
          ? "bg-green-500/10 border-green-500"
          : "bg-red-500/10 border-red-500"
>>>>>>> 9994a4d1e9900372338879dc4e862a100a01a0c3
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            isClockedIn ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <div className="text-xs">
          <div className="font-bold text-foreground leading-none">
            {isClockedIn ? "CLOCKED IN" : "CLOCKED OUT"}
          </div>
          {isClockedIn && (
            <div className="text-[10px] text-muted-foreground font-mono">{elapsedTime}</div>
          )}
        </div>
        <Button
          size="icon"
          variant={isClockedIn ? "destructive" : "default"}
          onClick={handleClockToggle}
          className="ml-2 h-6 w-6"
        >
          {isClockedIn ? <LogOut className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
        </Button>
      </div>
    </Card>
    </>
  );
};
