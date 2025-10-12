import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  status: string;
  type: string;
}

export const ScheduleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchSchedule();
  }, [currentDate]);

  const fetchSchedule = async () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, title, start_date, status")
      .gte("start_date", start.toISOString())
      .lte("start_date", end.toISOString());

    if (jobs) {
      setScheduleItems(
        jobs.map((job) => ({
          id: job.id,
          title: job.title,
          date: job.start_date,
          status: job.status,
          type: "job",
        })),
      );
    }
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getItemsForDate = (date: Date) => {
    return scheduleItems.filter((item) => isSameDay(new Date(item.date), date));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "in progress":
        return "bg-blue-500/20 text-blue-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-glow flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-primary" />
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hud-element border-primary/30"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hud-element border-primary/30"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-bold text-primary p-2">
            {day}
          </div>
        ))}

        {monthDays.map((day) => {
          const items = getItemsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <Card
              key={day.toISOString()}
              className={`hud-element border-primary/30 p-2 min-h-[100px] cursor-pointer hover:border-primary/50 transition-all ${
                isSelected ? "border-primary ring-1 ring-primary" : ""
              } ${!isSameMonth(day, currentDate) ? "opacity-50" : ""}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-sm font-bold mb-1">{format(day, "d")}</div>
              <div className="space-y-1">
                {items.map((item) => (
                  <Badge
                    key={item.id}
                    className={`${getStatusColor(item.status)} text-xs truncate block`}
                  >
                    {item.title}
                  </Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {selectedDate && (
        <Card className="hud-element border-primary/30 p-4">
          <h3 className="font-bold text-lg mb-3 text-glow">
            {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          <div className="space-y-2">
            {getItemsForDate(selectedDate).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 border border-primary/20 rounded"
              >
                <span>{item.title}</span>
                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
              </div>
            ))}
            {getItemsForDate(selectedDate).length === 0 && (
              <p className="text-muted-foreground text-center py-4">No scheduled items</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
