import React from "react";
import { Shield, Award, Users, Heart, Flag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VeteranSectionProps {
  onClose: () => void;
}

export const VeteranSection = ({ onClose }: VeteranSectionProps) => {
  const veteranPrograms = [
    {
      icon: Shield,
      title: "Veteran Hiring Priority",
      description: "Preferential hiring and onboarding for military veterans",
      status: "Active",
    },
    {
      icon: Award,
      title: "Skills Translation",
      description: "Military experience credit towards certifications",
      status: "Active",
    },
    {
      icon: Users,
      title: "Mentor Program",
      description: "Veteran mentorship and buddy system",
      status: "Active",
    },
    {
      icon: Heart,
      title: "Support Resources",
      description: "Mental health and transition assistance",
      status: "Available",
    },
  ];

  const veteranEmployees = [
    { name: "John Smith", branch: "Army", rank: "Sergeant", yearsService: 8 },
    { name: "Mike Johnson", branch: "Marines", rank: "Corporal", yearsService: 6 },
    { name: "Sarah Davis", branch: "Navy", rank: "Petty Officer", yearsService: 5 },
    { name: "Tom Wilson", branch: "Air Force", rank: "Staff Sergeant", yearsService: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-primary/30">
        <Flag className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold">VETERAN PROGRAMS</h2>
          <p className="text-sm text-muted-foreground">Supporting those who served our country</p>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {veteranPrograms.map((program) => (
          <Card key={program.title} className="tactical-panel p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                <program.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm">{program.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {program.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{program.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Veteran Employees */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-primary" />
          <h3 className="font-bold">VETERAN EMPLOYEES</h3>
        </div>
        <div className="space-y-2">
          {veteranEmployees.map((employee) => (
            <div
              key={employee.name}
              className="tactical-panel p-3 flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-sm">{employee.name}</p>
                <p className="text-xs text-muted-foreground">
                  {employee.rank} • {employee.branch}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {employee.yearsService} years service
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-primary/30">
        <Button className="flex-1">Add Veteran Employee</Button>
        <Button variant="outline" className="flex-1">
          View Resources
        </Button>
      </div>
    </div>
  );
};
