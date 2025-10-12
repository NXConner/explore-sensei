import React, { useState } from "react";
import { X, Users, UserPlus, Award, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmployees } from "@/hooks/useEmployees";
import { useSafety } from "@/hooks/useSafety";
import { format } from "date-fns";

interface HRManagementModalProps {
  onClose: () => void;
}

export const HRManagementModal = ({ onClose }: HRManagementModalProps) => {
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { trainings, expiringTrainings, isLoading: safetyLoading } = useSafety();

  const activeEmployees = employees.filter((e) => e.status === "active" || !e.status);
  const onLeave = employees.filter((e) => e.status === "leave");
  const terminated = employees.filter((e) => e.status === "terminated");

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-7xl h-[90vh] hud-element m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-glow">Human Resources</h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="hud-element border-primary/30 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Active Employees</p>
                  <p className="text-3xl font-bold text-green-500">{activeEmployees.length}</p>
                </Card>

                <Card className="hud-element border-primary/30 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">On Leave</p>
                  <p className="text-3xl font-bold text-blue-500">{onLeave.length}</p>
                </Card>

                <Card className="hud-element border-primary/30 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Training Records</p>
                  <p className="text-3xl font-bold text-purple-500">{trainings.length}</p>
                </Card>

                <Card className="hud-element border-primary/30 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Expiring Soon</p>
                  <p className="text-3xl font-bold text-red-500">{expiringTrainings.length}</p>
                </Card>
              </div>

              {expiringTrainings.length > 0 && (
                <Card className="hud-element border-red-500/30 p-6">
                  <h3 className="font-bold text-lg mb-4 text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Training Certifications Expiring Soon
                  </h3>
                  <div className="space-y-2">
                    {expiringTrainings.map((training) => (
                      <div
                        key={training.id}
                        className="flex justify-between items-center p-3 bg-background/50 rounded"
                      >
                        <div>
                          <p className="font-medium">{training.training_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Employee ID: {training.employee_id}
                          </p>
                        </div>
                        <Badge variant="destructive">
                          Expires:{" "}
                          {training.expiration_date
                            ? format(new Date(training.expiration_date), "MMM dd")
                            : "N/A"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="employees" className="mt-6 space-y-3">
              {activeEmployees.map((employee) => (
                <Card key={employee.id} className="hud-element border-primary/30 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          {employee.first_name} {employee.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {employee.role || "Employee"}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs">
                          {employee.email && <span>{employee.email}</span>}
                          {employee.phone && <span>{employee.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {employee.hourly_rate && (
                        <p className="text-lg font-bold text-green-500">
                          ${employee.hourly_rate}/hr
                        </p>
                      )}
                      {employee.hire_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Since {format(new Date(employee.hire_date), "MMM yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="training" className="mt-6 space-y-3">
              {trainings.map((training) => (
                <Card key={training.id} className="hud-element border-primary/30 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-bold">{training.training_name}</h3>
                        <p className="text-sm text-muted-foreground">{training.training_type}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed: {format(new Date(training.completion_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {training.expiration_date && (
                        <Badge
                          variant={
                            expiringTrainings.some((t) => t.id === training.id)
                              ? "destructive"
                              : "outline"
                          }
                        >
                          Expires: {format(new Date(training.expiration_date), "MMM dd, yyyy")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {trainings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No training records found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="mt-6">
              <Card className="hud-element border-yellow-500/30 p-6">
                <h3 className="font-bold text-lg mb-4 text-yellow-400">
                  HR Alerts & Notifications
                </h3>
                <div className="space-y-3">
                  {expiringTrainings.length > 0 && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="font-medium text-red-400">
                          Training Certifications Expiring
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {expiringTrainings.length} certification(s) will expire within 30 days
                      </p>
                    </div>
                  )}
                  {terminated.length > 0 && (
                    <div className="p-4 bg-gray-500/10 border border-gray-500/30 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-400">Terminated Employees</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {terminated.length} terminated employee record(s) on file
                      </p>
                    </div>
                  )}
                  {onLeave.length > 0 && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-blue-400">Employees on Leave</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {onLeave.length} employee(s) currently on leave
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
    </div>
  );
};
