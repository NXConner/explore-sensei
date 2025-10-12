import React, { useState, useEffect } from "react";
import { X, Maximize2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKPIData } from "@/hooks/useKPIData";
import { useJobSites } from "@/hooks/useJobSites";

interface ScreensaverModeProps {
  onClose: () => void;
}

export const ScreensaverMode = ({ onClose }: ScreensaverModeProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { data: kpiData } = useKPIData();
  const { data: jobSites } = useJobSites();

  const slides = [
    {
      title: "ACTIVE OPERATIONS",
      stats: [
        { label: "Active Jobs", value: kpiData?.activeJobs || 0 },
        { label: "Crew Members", value: kpiData?.crewMembers || 0 },
        { label: "Fleet Utilization", value: `${kpiData?.fleetUtilization || 0}%` },
      ],
    },
    {
      title: "FINANCIAL OVERVIEW",
      stats: [
        { label: "Est. Revenue", value: `$${((kpiData?.totalRevenue || 0) / 1000).toFixed(1)}K` },
        { label: "Avg Margin", value: "34%" },
        { label: "Open Leads", value: "12" },
      ],
    },
    {
      title: "PROJECT STATUS",
      stats: [
        {
          label: "Completed",
          value: jobSites?.filter((j) => j.status.includes("Complete")).length || 0,
        },
        {
          label: "In Progress",
          value: jobSites?.filter((j) => j.status.includes("Progress")).length || 0,
        },
        {
          label: "Scheduled",
          value: jobSites?.filter((j) => j.status.includes("Scheduled")).length || 0,
        },
      ],
    },
  ];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center">
      {/* Header Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={() => setIsPaused(!isPaused)}
          variant="ghost"
          size="icon"
          className="h-12 w-12"
        >
          {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
        </Button>
        <Button onClick={onClose} variant="ghost" size="icon" className="h-12 w-12">
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl w-full px-8 animate-fade-in">
        <h1 className="text-6xl font-bold text-center mb-16 text-primary text-glow">
          {slides[currentSlide].title}
        </h1>

        <div className="grid grid-cols-3 gap-12">
          {slides[currentSlide].stats.map((stat, idx) => (
            <div
              key={idx}
              className="tactical-panel p-8 text-center animate-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                {stat.label}
              </p>
              <p className="text-7xl font-bold text-glow">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-3 mt-16">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-3 rounded-full transition-all ${
                idx === currentSlide ? "w-12 bg-primary" : "w-3 bg-primary/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer Time */}
      <div className="absolute bottom-8 text-center">
        <p className="text-4xl font-mono text-primary">{new Date().toLocaleTimeString()}</p>
        <p className="text-lg text-muted-foreground mt-2">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};
