import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackToMapButtonProps {
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export const BackToMapButton = ({ variant = "outline", className = "" }: BackToMapButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button variant={variant} onClick={() => navigate("/")} className={`gap-2 ${className}`}>
      <ArrowLeft className="w-4 h-4" />
      <Map className="w-4 h-4" />
      Back to Map
    </Button>
  );
};
